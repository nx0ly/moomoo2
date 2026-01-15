import { Application, Assets, Container, Graphics, Sprite } from "pixi.js";
import Camera from "../objects/camera";
import PlayerSVG from "../assets/head.png";

export class Render {
  constructor(game) {
    this.game = game;
    this.app = new Application();
    this.camera = new Camera(4096, 4096);
    this.worldBounds = new Graphics();
    this.worldBounds.rect(0, 0, 8192, 8192).fill(0x768f5a);
    this.grid = new Graphics();
    this.drawGrid(this.grid, 8192, 8192, 64);

    this.world = new Container();
    this.ui = new Container();

    this.world.addChild(this.worldBounds);
    this.world.addChild(this.grid);

    this.textures = {};
    this.player_id_to_sprite = {};
  }

  drawGrid(g, w, h, s) {
    g.clear();
    g.stroke({ width: 4, color: 0x000000, alpha: 0.06 });

    for (let x = 0; x < w; x += s) {
        g.stroke({ width: 4, color: 0x000000, alpha: 0.06 });

      g.moveTo(x, 0);
      g.lineTo(x, h);
    }

    for (let y = 0; y < h; y += s) {
        g.stroke({ width: 4, color: 0x000000, alpha: 0.06 });

      g.moveTo(0, y);
      g.lineTo(w, y);
    }

    g.stroke();
  }

  async init() {
    await this.app.init({
      view: document.getElementById("mainCanvas"),
      background: "#000",
      resizeTo: window,
      resolution: 2,
    });

    await document.fonts.ready;

    await Assets.load(PlayerSVG);
    const playerTex = Assets.get(PlayerSVG);

    this.textures.player_texture = playerTex;

    this.app.stage.addChild(this.world);
    this.app.stage.addChild(this.ui);

    this.app.ticker.add(this.draw);
  }

  draw = (delta) => {
    if (!this.game?.my_player) return;

    delta = delta.deltaMS * 0.001;

    this.game.players.forEach((player) => {
      let sprite = this.player_id_to_sprite[player.id];

      if (sprite._renderX === undefined) {
        sprite._renderX = sprite.x;
        sprite._renderY = sprite.y;
      }

      const alpha = 1 - Math.pow(1 - 0.25, delta / 0.067);

      sprite._renderX += (player.x - sprite._renderX) * alpha;
      sprite._renderY += (player.y - sprite._renderY) * alpha;

      sprite.x = sprite._renderX;
      sprite.y = sprite._renderY;

      if (sprite.nameText) {
  sprite.nameText.x = sprite._renderX;
  sprite.nameText.y = sprite._renderY - sprite.height * 0.6 - 10;
}

    });

    const dx = this.game.my_player.x - this.camera.x;
    const dy = this.game.my_player.y - this.camera.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const dir = Math.atan2(dy, dx);

    const speed = Math.min(dist * delta * 3.5, dist);

    this.camera.x += Math.cos(dir) * speed;
    this.camera.y += Math.sin(dir) * speed;

    const halfW = this.app.screen.width / 2;
    const halfH = this.app.screen.height / 2;

    this.world.x = halfW - this.camera.x;
    this.world.y = halfH - this.camera.y;
  };
  /*
   * v.dt += e;
              var a = Math.min(1.5, v.dt / (n.serverTickrate * 1.2));
              v.x = v.x1 + (v.x2 - v.x1) * a;
              v.y = v.y1 + (v.y2 - v.y1) * a;
              */
}
