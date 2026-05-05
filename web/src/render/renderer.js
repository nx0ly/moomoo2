import {
  Application,
  Assets,
  Container,
  Graphics,
  Sprite,
} from "pixi.js";
import Camera from "../objects/camera";

// Sprites
import PlayerSprite from "../assets/head.png";
import FishSprite from "../assets/fish_1.png";
import Arm1Sprite from "../assets/arm_1.png";
import Arm2Sprite from "../assets/arm_2.png";
import TreeSprite from "../assets/tree.png";
import StoneSprite from "../assets/stone.png";
import LeafParticle from "../assets/particle_0.png";

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

    this.leaves = [];
    this.particles = [];

    this.texturesToLoad = [
      PlayerSprite, FishSprite, Arm1Sprite, Arm2Sprite, TreeSprite, StoneSprite, LeafParticle
    ];

    this.player_id_to_sprite = {};
    this.animal_id_to_sprite = {};
    this.object_id_to_sprite = {};
    this.textures = {};
    this.animals = [];

    // this.drawGrid(this.grid, 16384, 16384, 64);
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
    // Initialize Pixi.js Application.
    await this.app.init({
      view: document.getElementById("mainCanvas"),
      background: "#000",
      resizeTo: window,
      resolution: window.devicePixelRatio || 1,
      antialias: true,
    });

    this.texturesToLoad.forEach(async texture => {
      this.textures[texture] = await Assets.load(texture);
    });

    this.app.stage.addChild(this.world);
    this.app.stage.addChild(this.ui);
    this.app.ticker.add(this.draw);
  }

  // draw loop
  draw = (ticker) => {
    // Return if my player is not in game.
    const myPlayer = this.game?.my_player;
    if (!myPlayer) return;

    // times
    const now = performance.now();
    const delta = ticker.deltaMS * 0.001;
    const interpolationAlpha = 1 - Math.pow(0.67, delta / 0.067);

    // camera movement
    this.camera.update(delta, myPlayer);

    this.world.x = (this.app.screen.width >> 1) - this.camera.x;
    this.world.y = (this.app.screen.height >> 1) - this.camera.y;

    for (const player of this.game.players) {
      player.update(
        delta,
        player.id == myPlayer.id ? this.game.lastAimDir : player.visualAim,
        interpolationAlpha,
      );
    }

    // update animal positions
    for (let i = 0; i < this.game.animals.length; i++) {
      const animal = this.game.animals[i];
      let sprite = this.animal_id_to_sprite[animal.sid];

      // create new texture
      if (!sprite) {
        sprite = new Sprite(this.textures[FishSprite]);

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

    for (const object of this.game.objects) {
      let sprite = this.object_id_to_sprite[object.id];

      // create new texture
      if (!sprite) {
        let texture;
        switch (object.type_obj) {
          case 0: texture = this.textures[TreeSprite]; break;
          case 1: texture = this.textures[StoneSprite]; break;
        }
        sprite = new Sprite(texture);

        sprite.anchor.set(0.5);
        sprite.width = sprite.height = object.scale * 2.8;
        sprite.rotation = object.dir;

        this.object_id_to_sprite[object.id] = sprite;
        this.world.addChild(sprite);
      }

      sprite.x = object.x + object.wiggleX;
      sprite.y = object.y + object.wiggleY;

      object.updateWiggle(delta);
    }

    this.leaves.forEach(leaf => {
      leaf.update(delta);
    })
  }
}
