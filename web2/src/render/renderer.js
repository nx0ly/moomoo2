import { Application, Assets, Container, Graphics, Sprite, Text, TextStyle } from "pixi.js";
import Camera from "../objects/camera";
import PlayerSVG from "../assets/head.png";
import FishPNG from "../assets/fish_1.png";
export class Render {
  constructor(game) {
    this.game = game;
    this.app = new Application();
    this.camera = new Camera(10000, 10000);

    this.world = new Container();
    this.ui = new Container();

    this.worldBounds = new Graphics();
    this.worldBounds.rect(0, 0, 10240, 4096).fill(0xffffff); // snow
    this.worldBounds.rect(0, 4096, 10240, 4096).fill(0x768f5a); // grassland
    this.worldBounds.rect(0, 8192, 10240, 4096).fill(0xa49a54); // desert
    this.worldBounds.rect(0, 12288, 10240, 4096).fill(0x864341); // lava
    this.worldBounds.rect(10240, 0, 6144, 16384).fill(0x588fb2); // ocean

    this.grid = new Graphics();

    this.world.addChild(this.worldBounds);
    this.world.addChild(this.grid);

    this.player_id_to_sprite = {};
    this.animal_id_to_sprite = {};
    this.textures = {};
    this.animals = [];

    this.nameTextStyle = new TextStyle({
        fontSize: 20,
        fontFamily: "GameFont",
        fontWeight: "normal",
        fill: "#fff",
        stroke: {
          color: "#454545",
          width: 6.7,
          join: "round"
        },
        align: "center",
        letterSpacing: 0.67
    })

    this.lastCleanupTime = 0;
    this.cleanupInterval = 1000;

    this.drawGrid(this.grid, 16384, 16384, 64);
  }

  drawGrid(ctx, width, height, size) {
    ctx.clear();

    const lineStyle = { width: 4, color: 0x000000, alpha: 0.06 };

    for (let x = 0; x <= width; x += size) {
      ctx.moveTo(x, 0).lineTo(x, height).stroke(lineStyle);
    }
    for (let y = 0; y <= height; y += size) {
      ctx.moveTo(0, y).lineTo(width, y).stroke(lineStyle);
    }
  }

  async init() {
    await this.app.init({
      view: document.getElementById("mainCanvas"),
      background: "#000",
      resizeTo: window,
      resolution: window.devicePixelRatio || 1,
      antialias: false,
    });

    const playerAsset = await Assets.load(PlayerSVG);
    const fishAsset = await Assets.load(FishPNG);
    await Assets.load({ src: "/src/assets/game_font.ttf", data: { family: "GameFont" } });

    this.textures.player_texture = playerAsset;
    this.textures.fish_texture = fishAsset;

    this.app.stage.addChild(this.world);
    this.app.stage.addChild(this.ui);
    this.app.ticker.add(this.draw);
  }

  // draw loop
  draw = (ticker) => {
    // get my player and abort i i haven't spawned yet
    const myPlayer = this.game?.my_player;
    if (!myPlayer) return;

    // times
    const now = performance.now();
    const delta = ticker.deltaMS * 0.001;
    const interpolationAlpha = 1 - Math.pow(0.67, delta / 0.067);

    // camera movement
    const camDx = myPlayer.x - this.camera.x;
    const camDy = myPlayer.y - this.camera.y;
    const camDist = Math.hypot(camDy, camDx);

    this.camera.x += camDx * Math.min(0.05, camDist * 0.05 * delta);
    this.camera.y += camDy * Math.min(0.05, camDist * 0.05 * delta);

    this.world.x = (this.app.screen.width >> 1) - this.camera.x;
    this.world.y = (this.app.screen.height >> 1) - this.camera.y;

    // update player positions
    for (let i = 0; i < this.game.players.length; i++) {
      const player = this.game.players[i];
      let is_mine = player.id == this.game.my_player.id;
      let sprite = this.player_id_to_sprite[player.id];

      // create new texture
      if (!sprite) {
        sprite = new Sprite(this.textures.player_texture);

        sprite.anchor.set(0.5);
        sprite.width = sprite.height = 70;

        const label = new Text({ text: player.name, style: this.nameTextStyle });
        label.anchor.set(0.5, 1);
        sprite._label = label;

        this.player_id_to_sprite[player.id] = sprite;
        this.world.addChild(sprite);
        this.world.addChild(label);

        sprite._rx = player.x;
        sprite._ry = player.y;
      }

      // rotate
      sprite.rotation = is_mine ? this.game.lastAimDir : player.visualAim;

      // interpolate
      sprite._rx += (player.x - sprite._rx) * interpolationAlpha;
      sprite._ry += (player.y - sprite._ry) * interpolationAlpha;
      sprite.x = sprite._rx;
      sprite.y = sprite._ry;

      if (sprite._label) {
        sprite._label.x = sprite._rx;
        sprite._label.y = sprite._ry - 40;
      }

      let aimDelta = player.aim - player.visualAim;
      if (aimDelta > Math.PI) aimDelta -= Math.PI * 2;
      if (aimDelta < -Math.PI) aimDelta += Math.PI * 2;
      player.visualAim += aimDelta * interpolationAlpha;
    }

    // update animal positions
    for (let i = 0; i < this.game.animals.length; i++) {
      const animal = this.game.animals[i];
      let sprite = this.animal_id_to_sprite[animal.sid];

      // create new texture
      if (!sprite) {
        sprite = new Sprite(this.textures.fish_texture);

        sprite.anchor.set(0.5);
        sprite.width = sprite.height = 128;

        sprite._rx = animal.x;
        sprite._ry = animal.y;

        this.animal_id_to_sprite[animal.sid] = sprite;
        this.world.addChild(sprite);
      }

      // rotate animal to its movement
      const dx = animal.x - sprite._rx;
      const dy = animal.y - sprite._ry;

      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        sprite.rotation = Math.atan2(dy, dx) - Math.PI / 2;
      }

      sprite._rx += (animal.x - sprite._rx) * interpolationAlpha;
      sprite._ry += (animal.y - sprite._ry) * interpolationAlpha;

      sprite.x = sprite._rx;
      sprite.y = sprite._ry;

      sprite._lastSeen = now;
    }

    if (now - this.lastCleanupTime > this.cleanupInterval) {
      for (const sid in this.animal_id_to_sprite) {
        const sprite = this.animal_id_to_sprite[sid];
        if (now - sprite._lastSeen > 2000) {
          this.world.removeChild(sprite);
          sprite.destroy();
          delete this.animal_id_to_sprite[sid];
        }
      }
      this.lastCleanupTime = now;
    }
  };
}
