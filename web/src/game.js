import {
  Application,
  Assets,
  Container,
  Sprite,
  Text,
  TextStyle,
} from "pixi.js";
import init, {
  decode_bytes,
  encode_into_bytes,
  HandshakeState,
  SessionCrypto,
} from "../parser/pkg/parser";
import { Render } from "./render/renderer";
import utils from "./utils";
import Player from "./objects/player";

export class Game {
  constructor() {
    this.renderer = new Render(this);

    this.players = [];
    this.objects = [];

    this.my_player = null;

    this.moveInput = { up: false, down: false, left: false, right: false };
    this.zoomDelta = 0;

    this.utils = {
      game: this,
    };
    utils.bind(this.utils)();
  }

  async init() {
    await init();
    await this.renderer.init();

    // hooks
    document.getElementById("goButton").addEventListener("click", async () => {
      await this.enterGame();
    });

    try {
      this.wt = new WebTransport("https://127.0.0.1:6767");
      await this.wt.ready;
      console.log("wt connected");

      this.stream = await this.wt.createBidirectionalStream();
      this.sender = this.stream.writable.getWriter();
      this.reader = this.stream.readable.getReader();

      console.log("starting handshake...");

      const handshake = HandshakeState.create_client_hello();
      const clientHelloBytes = handshake.message();

      await this.sender.write(clientHelloBytes);
      console.log("send clienthello");

      const { value: serverHelloBytes, done } = await this.reader.read();
      if (done || !serverHelloBytes) {
        throw new Error("connection closed during handshake");
      }
      console.log("recv ServerHello");

      this.crypto = handshake.complete_handshake(serverHelloBytes);

      this.read();

      window.addEventListener("keydown", this.handleKey);
      window.addEventListener("keyup", this.handleKey);
      window.addEventListener("wheel", this.handleWheel, { passive: true });
    } catch (error) {
      console.error("failed to establish connection:", error);
      alert("failed to connect to server. please try again.");
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

  handleWheel = (e) => {
    this.zoomDelta += e.deltaY > 0 ? -0.1 : 0.1;
    this.renderer.camera.zoom = Math.max(
      0.5,
      Math.min(3, this.renderer.camera.zoom + this.zoomDelta)
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

    this.sendMove(dir);
  };

  async enterGame() {
    const spawnData = {
      name: document.getElementById("nameInput").value || "Player",
    };

    try {
      await this.sendEncrypted(spawnData, 1);

      document.getElementById("mainMenuContainer")?.remove();
      document.getElementById("darkener")?.remove();
    } catch (error) {
      console.error("failed to enter game:", error);
      alert("failed to join game. please try again.");
    }
  }

  async sendEncrypted(data, opcode) {
    if (!this.crypto || !this.sender) {
      throw new Error("cannot send - encryption not initialized");
    }

    try {
      const plaintext = encode_into_bytes(data, opcode);
      const ciphertext = this.crypto.encrypt(plaintext);

      const frame = new Uint8Array(4 + ciphertext.length);
      new DataView(frame.buffer).setUint32(0, ciphertext.length, false);
      frame.set(ciphertext, 4);

      await this.sender.write(frame);
      
      console.log(`sent encrypted packet (opcode ${opcode}, ${ciphertext.length} bytes, send_nonce now: ${this.crypto.get_send_nonce()})`);
    } catch (e) {
      console.error("failed to send encrypted message:", e);
      throw e;
    }
  }

  async read() {
  let buffer = new Uint8Array(65536);
  let offset = 0;

  try {
    while (true) {
      const { value, done } = await this.reader.read();
      if (done) {
        console.log("stream closed by server");
        break;
      }
      if (!value) continue;

      if (offset + value.length > buffer.length) {
        const newBuf = new Uint8Array(Math.max(buffer.length * 2, offset + value.length));
        newBuf.set(buffer.subarray(0, offset));
        buffer = newBuf;
      }

      buffer.set(value, offset);
      offset += value.length;

      let cursor = 0;
      const view = new DataView(buffer.buffer);

      while (offset - cursor >= 4) {
        const len = view.getUint32(cursor, false);

        if (offset - cursor < 4 + len) break;

        const ciphertext = buffer.subarray(cursor + 4, cursor + 4 + len);
        
        try {
          const plaintext = this.crypto.decrypt(ciphertext);
          const packet = decode_bytes(plaintext);
          this.handlePacket(packet);
        } catch (e) {
          console.error("decryption failed. conn desynced:", e);
          return;
        }

        cursor += 4 + len;
      }

      if (cursor > 0) {
        buffer.copyWithin(0, cursor, offset);
        offset -= cursor;
      }
    }
  } catch (e) {
    console.error("stream read error:", e);
  } finally {
    this.cleanup();
  }
}

  handlePacket(packet) {
    switch (packet.code) {
      case 1:
        console.log("player spawned:", packet.data);

        let { is_mine, data } = packet.data;

        let player = new Player(data);
        game.players.push(player);
        if (is_mine) {
          game.my_player = player;
        }

        if (!this.renderer.player_id_to_sprite[player.id]) {
          this.renderer.player_id_to_sprite[player.id] = new Sprite(
            this.renderer.textures.player_texture
          );
          this.renderer.player_id_to_sprite[player.id].anchor.set(0.5);

          this.renderer.player_id_to_sprite[player.id].x = player.x;
          this.renderer.player_id_to_sprite[player.id].y = player.y;

          this.renderer.player_id_to_sprite[player.id].width = 80;
          this.renderer.player_id_to_sprite[player.id].height = 80;

          let nameText = new Text({
            text: player.name,
            style: new TextStyle({
              fontFamily: "GameFont",
              fontSize: 24,
              fill: 0xffffff,
              align: "center",
              stroke: 0x000000,
              strokeThickness: 4,
            }),
          });
          nameText.anchor.set(0.5, 1);
          this.renderer.player_id_to_sprite[player.id].nameText = nameText;

          this.renderer.world.addChild(
            this.renderer.player_id_to_sprite[player.id]
          );
          this.renderer.world.addChild(nameText);
        }
        break;

      case 2:
        console.log("Player moved:", packet.data);
        break;

      case 3:
        let { players } = packet.data;
        for (let player of players) {
          let p = game.utils.findPlayerByID(player.id) || {};

          p.x = player.x;
          p.y = player.y;
          p.weapon = player.weapon;

          let player_sprite = this.renderer.player_id_to_sprite[p.id];
          if (player_sprite) {
            player_sprite.x = p.x;
            player_sprite.y = p.y;
          }
        }
        break;

      case 4:
        const { c_x, c_y, tiles } = packet.data;
        console.log(`recv map chunk (${c_x}, ${c_y}):`, tiles.length, "tiles");
        this.renderer.upsertChunk(c_x, c_y, tiles);
        break;

      default:
        console.warn("unknown packet type:", packet);
    }
  }

  async sendMove(direction) {
    if (!this.isConnected()) return;

    const moveData = { dir: direction };
    try {
      await this.sendEncrypted(moveData, 2);
    } catch (error) {
      console.error("failed to send move:", error);
    }
  }

  cleanup() {
    console.log("cleaning up connection...");

    if (this.sender) {
      try {
        this.sender.releaseLock();
      } catch (e) {
        console.warn("error releasing sender lock:", e);
      }
      this.sender = null;
    }

    if (this.reader) {
      try {
        this.reader.releaseLock();
      } catch (e) {
        console.warn("error releasing reader lock:", e);
      }
      this.reader = null;
    }

    if (this.wt) {
      try {
        this.wt.close();
      } catch (e) {
        console.warn("error closing WebTransport:", e);
      }
      this.wt = null;
    }

    this.crypto = null;
  }

  isConnected() {
    return this.crypto !== null && this.sender !== null;
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

window.game = game;