import init, { encode_into_bytes, HandshakeState } from "../parser/pkg/parser";
import { Render } from "./render/renderer";
import utils from "./utils";
import Player from "./objects/player";
import { decodePacket, initDecoder } from "./packetHandler";
import { ActionBar } from "./ui/actionBar";
import { WEAPONS } from "./data/weapons";
import { ResourceDisplay } from "./ui/resourceDisplay";
import { HitLeaf } from "./objects/leaf";

export class Game {
  constructor() {
    this.renderer = new Render(this);

    this.players = [];
    this.animals = [];
    this.objects = [];
    this.inventory = [];
    this.leaves = [];

    this.actionBar = null;
    this.resourcedisplay = new ResourceDisplay();

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

    this.streamWriter.close().catch(() => { });
    this.streamReader.cancel().catch(() => { });

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
      if (done) break;
      this._handleReliableStream(stream).catch(e =>
        console.error("reliable stream error:", e)
      );
    }
  }

  async _handleReliableStream(stream) {
    const reader = stream.getReader();
    let carry = new Uint8Array(0);

    const readExact = async (n) => {
      const out = new Uint8Array(n);
      let offset = 0;

      // drain carry first
      if (carry.length > 0) {
        const take = Math.min(carry.length, n);
        out.set(carry.subarray(0, take), 0);
        carry = carry.subarray(take);
        offset += take;
      }

      while (offset < n) {
        const { value, done } = await reader.read();
        if (done) throw new Error("stream closed early");
        const need = n - offset;
        if (value.length <= need) {
          out.set(value, offset);
          offset += value.length;
        } else {
          out.set(value.subarray(0, need), offset);
          carry = value.subarray(need); // save the overshoot
          offset = n;
        }
      }
      return out;
    };

    const lenBuf = await readExact(4);
    const payloadLen = new DataView(lenBuf.buffer).getUint32(0, false);
    const payload = await readExact(payloadLen);

    try {
      const plaintext = this.crypto.decrypt(payload);
      const packet = decodePacket(plaintext);
      this.handlePacket(packet);
    } catch (e) {
      console.error("reliable decrypt/decode error:", e);
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
    this.sendAim(aim).catch(() => { });
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
    this.sendMove(dir).catch(() => { });
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
          this.actionBar = new ActionBar();
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

        this.sendAim(this.lastAimDir).catch(() => { });
        break;
      }

      // case 4:
      //   console.log(packet.data)
      //   this.animals = packet.data.animals.map((a) => ({
      //     sid: a.id,
      //     x: a.x,
      //     y: a.y,
      //     type: a.animal_type,
      //   }));
      // break;
      case 4: {
        const incoming = packet.data.animals;
        while (this.animals.length < incoming.length) {
          this.animals.push({ sid: 0, x: 0, y: 0, type: 0 });
        }
        this.animalsLength = incoming.length;
        for (let i = 0; i < incoming.length; i++) {
          const a = incoming[i];
          const slot = this.animals[i];
          slot.sid = a.id;
          slot.x = a.x;
          slot.y = a.y;
          slot.type = a.animal_type;
        }
        break;
      }

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

      case 9:
        this.inventory = packet.data.weapons.map(x => WEAPONS.find(y => y.id == x) || {});
        console.log(this.inventory);
        if (this.actionBar) this.actionBar.update(this.inventory)

        break;

        case 10: {
          const object = this.utils.findObjectByID(packet.data.id);
          console.log(this.renderer.world)
          this.renderer.leaves.push(new HitLeaf(object.x + (object.scale * Math.cos(packet.data.dir)), object.y + (object.scale * Math.sin(packet.data.dir)), packet.data.dir, this.renderer.leafTexture, this.renderer.world));
        }

      case 11: {
        const { wood, stone, food } = packet.data;
        console.log(packet.data)
        window.resourceDisplay?.updateResource(0, wood);
        window.resourceDisplay?.updateResource(1, stone);
        window.resourceDisplay?.updateResource(2, food);
        break;
      }

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
