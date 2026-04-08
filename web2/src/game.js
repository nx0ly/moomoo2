import init, { encode_into_bytes, HandshakeState } from "../parser/pkg/parser";
import { Render } from "./render/renderer";
import utils from "./utils";
import Player from "./objects/player";
import { decodePacket, initDecoder } from "./packetHandler";
import { ActionBar } from "./ui/actionBar";

export class Game {
  constructor() {
    this.renderer = new Render(this);

    this.players = [];
    this.animals = [];
    this.objects = [];

    this.my_player = null;

    this.moveInput = { up: false, down: false, left: false, right: false };
    this.lastMoveDir = null;
    this.zoomDelta = 0;

    this.lastAimDir = 0;

    this.utils = { game: this };
    utils.bind(this.utils)();
  }

  async init() {
    await init();
    await initDecoder();
    await this.renderer.init();

    document.getElementById("goButton").addEventListener("click", async () => {
      await this.enterGame();
    });

    this.wt = new WebTransport("https://127.0.0.1:6767");
    await this.wt.ready;
    console.log("wt connected");

    this.datagramWriter = this.wt.datagrams.writable.getWriter();
    this.datagramReader = this.wt.datagrams.readable.getReader();

    console.log("starting handshake");

    const handshakeAndMsg = HandshakeState.create_client_hello();
    const clientHelloBytes = handshakeAndMsg.message();

    const helloFramed = new ArrayBuffer(4 + clientHelloBytes.byteLength);
    new DataView(helloFramed).setUint32(0, clientHelloBytes.byteLength, false);
    new Uint8Array(helloFramed, 4).set(clientHelloBytes);

    const stream = await this.wt.createBidirectionalStream();
    this.streamWriter = stream.writable.getWriter();
    this.streamReader = stream.readable.getReader();
    await this.streamWriter.write(new Uint8Array(helloFramed));
    console.log("sent ClientHello");

    let handshakeBuffer = new Uint8Array(0);

    const readExact = async (n) => {
      while (handshakeBuffer.length < n) {
        const { value, done } = await this.streamReader.read();
        if (done) throw new Error("connection closed during handshake");
        const merged = new Uint8Array(handshakeBuffer.length + value.length);
        merged.set(handshakeBuffer);
        merged.set(value, handshakeBuffer.length);
        handshakeBuffer = merged;
      }
    };

    await readExact(4);
    const serverHelloLen = new DataView(handshakeBuffer.buffer).getUint32(
      0,
      false,
    );
    await readExact(4 + serverHelloLen);

    this.crypto = handshakeAndMsg.complete_handshake(
      handshakeBuffer.slice(4, 4 + serverHelloLen),
    );
    console.log("handshake complete");
    console.log(`send nonce: ${this.crypto.get_send_nonce()}`);
    console.log(`receive nonce: ${this.crypto.get_recv_nonce()}`);

    this.streamWriter.close().catch(() => {});
    this.streamReader.cancel().catch(() => {});

    window.addEventListener("keydown", this.handleKey);
    window.addEventListener("keyup", this.handleKey);
    window.addEventListener("mousemove", this.handleMouseMove);
    window.addEventListener("wheel", this.handleWheel, { passive: true });
    window.addEventListener("mousedown", this.handleMousedown);
    window.addEventListener("mouseup", this.handleMousedown);

    this.read().catch((e) => console.error("read loop died:", e));

    this.readReliable().catch((e) =>
      console.error("reliable read loop died:", e),
    );
  }

  async readReliable() {
    const reader = this.wt.incomingUnidirectionalStreams.getReader();
    while (true) {
      const { value: stream, done } = await reader.read();
      console.log("ok", stream);
      if (done) break;

      const chunks = [];
      const streamReader = stream.getReader();
      while (true) {
        const { value: chunk, done: streamDone } = await streamReader.read();
        if (streamDone) break;
        chunks.push(chunk);
      }

      const totalLen = chunks.reduce((n, c) => n + c.length, 0);
      const buf = new Uint8Array(totalLen);
      let offset = 0;
      for (const chunk of chunks) {
        buf.set(chunk, offset);
        offset += chunk.length;
      }

      if (buf.length < 4) continue;
      const payload = buf.slice(4); // rest is: [nonce:8 | ciphertext]

      try {
        const plaintext = this.crypto.decrypt(payload);
        const packet = decodePacket(plaintext);
        this.handlePacket(packet);
      } catch (e) {
        console.error("reliable decrypt/decode error:", e);
      }
    }
  }

  handleKey = (e) => {
    const down = e.type === "keydown";
    if (e.key === "w" || e.key === "ArrowUp") this.moveInput.up = down;
    if (e.key === "s" || e.key === "ArrowDown") this.moveInput.down = down;
    if (e.key === "a" || e.key === "ArrowLeft") this.moveInput.left = down;
    if (e.key === "d" || e.key === "ArrowRight") this.moveInput.right = down;
    this.sendInput();
  };

  handleMousedown = async (_e) => {
    await this.sendEncrypted({}, 6);
  };

  handleMouseMove = (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const aim = Math.atan2(e.clientY - cy, e.clientX - cx);
    if (this.lastAimDir === aim) return;
    this.lastAimDir = aim;
    // aim is sent piggy-backed on every position update from the server (case 3),
    // but also send immediately for responsiveness.
    this.sendAim(aim).catch(() => {});
  };

  handleWheel = (e) => {
    this.zoomDelta += e.deltaY > 0 ? -0.1 : 0.1;
    this.renderer.camera.zoom = Math.max(
      0.5,
      Math.min(3, this.renderer.camera.zoom + this.zoomDelta),
    );
    this.zoomDelta = 0;
  };

  sendInput = () => {
    if (!this.my_player) return;

    let dir = null;
    if (
      this.moveInput.up ||
      this.moveInput.down ||
      this.moveInput.left ||
      this.moveInput.right
    ) {
      const dx = (this.moveInput.right ? 1 : 0) - (this.moveInput.left ? 1 : 0);
      const dy = (this.moveInput.down ? 1 : 0) - (this.moveInput.up ? 1 : 0);
      dir = Math.atan2(dy, dx);
    }

    if (this.lastMoveDir === dir) return;
    this.lastMoveDir = dir;
    this.sendMove(dir).catch(() => {});
  };

  async enterGame() {
    const spawnData = { name: document.getElementById("nameInput").value };
    await this.sendEncrypted(spawnData, 1);
    console.log("spawn msg sent");
    document.getElementById("mainMenuContainer").remove();
    document.getElementById("darkener").remove();
  }

  async sendEncrypted(data, opcode) {
    if (!this.crypto || !this.datagramWriter) {
      throw new Error("cannot send — encryption not initialised");
    }
    const plaintext = encode_into_bytes(data, opcode);
    // crypto.encrypt() → Uint8Array of [ nonce(8) | ciphertext ]
    const packet = this.crypto.encrypt(plaintext);
    await this.datagramWriter.write(packet);
  }

  async read() {
    while (true) {
      const { value, done } = await this.datagramReader.read();
      if (done) break;
      if (!value || value.length < 9) continue; // 8 nonce + ≥1 ciphertext byte

      try {
        const plaintext = this.crypto.decrypt(value);
        const packet = decodePacket(plaintext);
        this.handlePacket(packet);
      } catch (e) {
        console.error("decrypt/decode error:", e);
      }
    }
    console.warn("datagram reader closed");
  }

  handlePacket(packet) {
    switch (packet.code) {
      case 1: {
        console.log("player spawned:", packet.data);
        const { is_mine, data } = packet.data;
        const player = new Player(
          data,
          [
            this.renderer.textures.player_texture,
            this.renderer.textures.arm1_texture,
            this.renderer.textures.arm2_texture,
          ],
          this.renderer.world,
        );
        this.players.push(player);
        if (is_mine) {
          this.my_player = player;
          window.actionBar = new ActionBar();
        }
        break;
      }

      case 3: {
        const { players } = packet.data;
        for (const p of players) {
          const player = this.utils.findPlayerByID(p.id);
          if (!player) continue;
          player.x = p.x;
          player.y = p.y;
          player.weapon = p.weapon;
          player.lastAim = p.aim;
          player.aim = p.aim;
          player.sprite.x = p.x;
          player.sprite.y = p.y;
        }

        this.sendAim(this.lastAimDir).catch(() => {});
        break;
      }

      case 4:
        this.animals = packet.data.animals.map((a) => ({
          sid: a.id,
          x: a.x,
          y: a.y,
          type: a.animal_type,
        }));
        break;

      case 6: {
        console.log("hit event, entity:", packet.data.entity_id);
        const player = this.utils.findPlayerByID(packet.data.entity_id);
        if (player) {
          player.attackAnim = 1;
          player.animateRightArm = !player.animateRightArm;
        }
        break;
      }

      case 7:
        console.log("objects:", packet);
        this.objects = packet.data.objects;
        break;

      default:
        console.warn("unknown packet type:", packet.code);
    }
  }

  async sendMove(direction) {
    await this.sendEncrypted({ dir: direction }, 2);
  }

  async sendAim(direction) {
    await this.sendEncrypted({ dir: direction }, 5);
  }

  cleanup() {
    window.removeEventListener("keydown", this.handleKey);
    window.removeEventListener("keyup", this.handleKey);
    window.removeEventListener("mousemove", this.handleMouseMove);
    window.removeEventListener("wheel", this.handleWheel);
    window.removeEventListener("mousedown", this.handleMousedown);
    window.removeEventListener("mouseup", this.handleMousedown);

    if (this.datagramWriter) {
      this.datagramWriter.releaseLock();
      this.datagramWriter = null;
    }
    if (this.datagramReader) {
      this.datagramReader.cancel();
      this.datagramReader = null;
    }
    if (this.wt) {
      this.wt.close();
      this.wt = null;
    }

    this.crypto = null;
  }

  isConnected() {
    return this.crypto !== null && this.datagramWriter !== null;
  }

  getDebugInfo() {
    if (!this.crypto) return null;
    return {
      sendNonce: this.crypto.get_send_nonce(),
      recvNonce: this.crypto.get_recv_nonce(),
      connected: this.isConnected(),
    };
  }
}

const game = new Game();
await game.init();
console.log("game ready");
