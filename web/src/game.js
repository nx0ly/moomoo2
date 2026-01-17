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

    this.wt = new WebTransport("https://127.0.0.1:6767");
    await this.wt.ready;
    console.log("wt connected");

    this.stream = await this.wt.createBidirectionalStream();
    this.sender = this.stream.writable.getWriter();
    this.reader = this.stream.readable.getReader();

    console.log("starting handshake");

    const handshake = HandshakeState.create_client_hello();
    const clientHelloBytes = handshake.message();

    await this.sender.write(clientHelloBytes);
    console.log("sent ClientHello");

    const { value: serverHelloBytes, done } = await this.reader.read();
    if (done || !serverHelloBytes) {
      throw new Error("connection closed during handshake");
    }
    console.log("received ServerHello");

    this.crypto = handshake.complete_handshake(serverHelloBytes);
    console.log("handshake finished");
    console.log(`send nonce: ${this.crypto.get_send_nonce()}`);
    console.log(`receive nonce: ${this.crypto.get_recv_nonce()}`);

    this.read();

    window.addEventListener("keydown", this.handleKey);
    window.addEventListener("keyup", this.handleKey);
    window.addEventListener("wheel", this.handleWheel, { passive: true });
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

    console.warn(dir);
    this.sendMove(dir);
  };

  async enterGame() {
    const spawnData = {
      name: document.getElementById("nameInput").value,
    };

    await this.sendEncrypted(spawnData, 1);
    console.log("spawn msg sent");

    document.getElementById("mainMenuContainer").remove();
    document.getElementById("darkener").remove();
    // document.getElementById("vignette").remove();
  }

  async sendEncrypted(data, opcode) {
    if (!this.crypto || !this.sender) {
      throw new Error("cannot send - encryption not initialized");
    }

    try {
      const plaintext = encode_into_bytes(data, opcode);
      const ciphertext = this.crypto.encrypt(plaintext);

      await this.sender.write(ciphertext);
    } catch (e) {
      console.error("failed to send encrypted message:", e);
      throw e;
    }
  }

  async read() {
    const buf = new Uint8Array(4096);
    let buffered = new Uint8Array(0);

    try {
      while (true) {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (!value) continue;

        const newBuf = new Uint8Array(buffered.length + value.length);
        newBuf.set(buffered);
        newBuf.set(value, buffered.length);
        buffered = newBuf;

        while (buffered.length >= 4) {
          const len = new DataView(
            buffered.buffer,
            buffered.byteOffset
          ).getUint32(0, false);

          if (buffered.length < 4 + len) break;

          const ciphertext = buffered.slice(4, 4 + len);
          buffered = buffered.slice(4 + len);

          try {
            const plaintext = this.crypto.decrypt(ciphertext);
            const packet = decode_bytes(plaintext);
            this.handlePacket(packet);
          } catch (e) {
            console.error("decrypt error:", e);
          }
        }
      }
    } catch (e) {
      console.error("stream error:", e);
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
        console.log("player moved:", packet.data);

        break;

      case 3:
        let { players } = packet.data;
        console.log(players)
        for (let player of players) {
          let p = game.utils.findPlayerByID(player.id) || {};

          p.x = player.x;
          p.y = player.y;
          p.weapon = player.weapon;

          let player_sprite = this.renderer.player_id_to_sprite[p.id] || {};
          player_sprite.x = p.x;
          player_sprite.y = p.y;
        }

        break;

      default:
        console.warn("unknown packet type:", packet.code);
    }
  }

  async sendMove(direction) {
    const moveData = { dir: direction };
    console.log(moveData);
    await this.sendEncrypted(moveData, 2);
  }

  cleanup() {
    console.log("cleaning up stuff");

    if (this.sender) {
      this.sender.releaseLock();
      this.sender = null;
    }

    if (this.reader) {
      this.reader.releaseLock();
      this.reader = null;
    }

    if (this.wt) {
      this.wt.close();
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

console.log("why ass");
var ui = 0;
var mi = [
  function () {
    return "<div class='infoHeader'>Customize</div><div class='menuSelector' onclick='showSelectScreen(0, this)'>Headgear</div><div class='menuSelector' onclick='showSelectScreen(1, this)'>Clothing</div>";
  },
  function () {
    let h = null;
    h.fetchServerList().then((e) => {
      var t = "";
      var i = 0;
      for (var s in e) {
        for (var n = e[s], o = 0, r = 0; r < n.length; r++) {
          o += n[r].players;
        }
        i += o;
        let p = h.regionInfo[s].name;
        t += "<b>" + p + " - " + o + " players</b>";
        for (let e = 0; e < n.length; e++) {
          var l = n[e];
          var c = a && a.instanceId == l.id;
          var d =
            p +
            " " +
            (e + 1) +
            " - " +
            l.players +
            "/" +
            l.maxPlayers +
            " players";
          var f = c ? "&#x25B6; " : "";
          t +=
            "<div class='" +
            (c ? "selectedMenuSelector" : "subMenuSelector") +
            "' onclick='switchServer(\"" +
            l.id +
            "\")'>" +
            f +
            d +
            "</div>";
        }
        t += "<br/>";
      }
      t += "<b>" + i + " total players</b>";
      let p = document.getElementById("serverList");
      if (p) {
        p.innerHTML = t;
      }
    });
    return "<div class='infoHeader'>Servers</div><div id='serverList' class='infoText'>Loading...</div>";
  },
  function () {
    if (m) {
      return (
        "<div class='infoHeader'>Account</div><div class='accItem'>If you leave a game in progress your stats won't be saved</div><div class='accItem'><b>Name </b> " +
        m.name +
        "</div><div class='accItem'><b>Level </b> " +
        m.level +
        "</div><div class='accItem'><b>Tokens </b> " +
        m.tokens +
        "</div><div class='accItem'><b>Most Kills </b> " +
        m.maxKills +
        "</div><div class='accItem'><b>Kills </b> " +
        m.kills +
        "</div><div class='accItem'><b>Deaths </b> " +
        m.deaths +
        "</div><div class='accItem'><b>KDR </b> " +
        (m.kills / m.deaths).round(2) +
        "</div><div class='accItem'><b>Games </b> " +
        m.games +
        "</div><div class='accItem'><b>Wins </b> " +
        m.wins +
        "</div><div class='menuButton accButton' style='margin-top:10px' onclick='logoutAcc()'>Logout</div>"
      );
    } else {
      return (
        "<div class='infoHeader'>Login</div><div id='accResp' style='display:none'></div><input type='text' id='accName' class='accInput' maxlength='" +
        n.maxNameLength +
        "' placeholder='Username' value='" +
        (De("foes_username") || "") +
        "' ontouchend='touchPrompt(event, \"Enter username:\")'></input><input type='text' id='accEmail' class='accInput' maxlength='" +
        n.maxEmailLength +
        "'placeholder='Email' ontouchend='touchPrompt(event, \"Enter email:\")'></input><input type='password' id='accPass' class='accInput' maxlength='" +
        n.maxPassLength +
        "'placeholder='Password' ontouchend='touchPrompt(event, \"Enter password:\")'></input><div class='menuButton accButton' style='margin-bottom:10px' onclick='loginAcc()'>Login</div><div class='menuButton accButton' onclick='registerAcc()'>Register</div>"
      );
    }
  },
  function () {
    var e =
      "<div class='infoHeader'>How to Play</div><div class='infoText'>The last player alive wins</br>";
    for (var t = gi.desktop, i = 0; i < t.length; i++) {
      var a = t[i];
      e += "<b>" + a[0] + "</b> " + a[1] + "</br>";
    }
    e +=
      "<span id='createContainerMobile'>Created by <a href='https://web.archive.org/web/20181212084011/https://twitter.com/Sidney_de_Vries'>Sidney</a> & <a href='https://web.archive.org/web/20181212084011/https://twitter.com/EatMyAppless'>Vincent</a></span>";
    return (e += "</div>");
  },
  function () {
    var e = "<div class='infoHeader'>Settings</div>";
    for (var t = 0; t < Ze.length; ++t) {
      e +=
        "<div class='menuSelector' id='settingButton" +
        t +
        "' onclick='toggleSetting(" +
        t +
        ")'>" +
        Qe(Ze[t].val) +
        Ze[t].display +
        "</div>";
    }
    return e;
  },
];
function yi(e, t) {
  ui = e;
  infoCard.innerHTML =
    "<div class='menuButton infoBack' onclick='hideInfoScreen()'>Back</div>" +
    mi[e]();
  if (!t) {
    infoCardParent.classList.toggle("submenuShowing", true);
    buttonCardParent.classList.toggle("submenuShowing", true);
  }
}
window.showInfoScreen = yi;
var Ze = [
  {
    name: "showBlood",
    display: "Show Blood",
    val: true,
  },
  {
    name: "showLeaves",
    display: "Show Leaves",
    val: true,
  },
  {
    name: "showParticles",
    display: "Show Particles",
    val: true,
  },
  {
    name: "showChat",
    display: "Show Chat",
    val: true,
  },
  {
    name: "showUI",
    display: "Show UI",
    val: true,
  },
  {
    name: "nativeResolution",
    display: "Use native resolution (needs reload)",
    val: true,
    onChange: function (e) {
      location.reload();
    },
  },
];

function Qe(e) {
  return (e ? "✔" : "✖") + " ";
}

var gi = {
  desktop: [
    ["Movement:", "W,A,S,D"],
    ["Sprint:", "Shift"],
    ["Aim:", "Mouse"],
    ["Interact:", "F"],
    ["Attack:", "Left Mouse or E"],
    ["Toggle Weapon:", "Scroll or Q"],
    ["Drop Weapon:", "C"],
    ["Voice to Text Chat:", "V"],
  ],
  touch: [
    ["Movement:", "Left control"],
    ["Sprint:", "Drag left control to edge"],
    ["Aim:", "Right control"],
    ["Attack:", "Drag right control to edge"],
    ["Interact:", "Touch center of screen"],
    ["Toggle Weapon:", "Touch weapon box in bottom left"],
    ["Drop Weapon:", "Touch ammo display in bottom right"],
  ],
};
