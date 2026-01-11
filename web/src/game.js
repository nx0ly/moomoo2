import { Player } from "./assets/player";
import { Application, Assets, Container, Sprite } from "pixi.js";
import init, {
  decode_bytes,
  encode_into_bytes,
  HandshakeState,
  SessionCrypto,
} from "../parser/pkg/parser";

export class Game {
  async init() {
    console.log("OKOK");
    this.app = new Application();
    // set functions and events
    console.log(document.getElementById("goButton"));
    document.getElementById("goButton").addEventListener("click", async () => {
      await this.spawnButtonClick();
      console.log("ok");
    });

    await init();

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

    await this.app.init({
      view: document.getElementById("mainCanvas"),
      background: "#000",
      resizeTo: window,
      resolution: 2,
    });

    let container = new Container();
    this.app.stage.addChild(container);

    this.read();
  }

  async spawnButtonClick() {
    const spawnData = {
      name: "why god javedpension?",
    };

    await this.sendEncrypted(spawnData, 1);
    console.log("spawn msg sent");
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
    if (!this.reader || !this.crypto) {
      throw new Error("cannot read - stream or encryption not initialized");
    }

    try {
      while (true) {
        const { value, done } = await this.reader.read();
        if (done) {
          console.log("stream closed by server");
          break;
        }

        if (!value) continue;

        try {
          const plaintext = this.crypto.decrypt(value);

          const packet = decode_bytes(plaintext);

          console.log("OP:", packet);

          this.handlePacket(packet);
        } catch (decryptError) {
          console.error("failed to decrypt/decode packet:", decryptError);
        }
      }
    } catch (e) {
      console.error("stream closed:", e);
    } finally {
      this.cleanup();
    }
  }

  handlePacket(packet) {
    switch (packet.code) {
      case 1:
        console.log("player spawned:", packet.data);
        // TODO: Add player to game
        break;

      case 2:
        console.log("player moved:", packet.data);
        // TODO: Update player position
        break;

      default:
        console.warn("unknown packet type:", packet.code);
    }
  }

  async sendMove(direction) {
    const moveData = { dir: direction };
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
game.init();
console.log("why ass", game);
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
