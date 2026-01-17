import { Application, Assets, Container, Graphics, Sprite, Text } from "pixi.js";
import Camera from "../objects/camera";
import PlayerSVG from "../assets/head.png";

const CHUNK_SIZE = 32;
const TILE_SIZE = 6;

const TILE_COLORS = {
  "Ocean": 0x4488ff,
  "Sand": 0xedc9af,
  "Grass": 0x768f5a,
  0: 0x4488ff,
  1: 0xedc9af,
  2: 0x768f5a,
};

export class Render {
  constructor(game) {
    this.game = game;
    this.app = new Application();
    this.camera = new Camera(0, 0);

    this.world = new Container();
    this.tileContainer = new Container();
    this.playerContainer = new Container();
    this.ui = new Container();

    this.world.addChild(this.tileContainer);
    this.world.addChild(this.playerContainer);

    this.textures = {};
    this.player_id_to_sprite = {};
    this.chunks = new Map();
  }

  async init() {
    await this.app.init({
      canvas: document.getElementById("mainCanvas"),
      background: "#768f5a",
      resizeTo: window,
      resolution: window.devicePixelRatio || 1,
      antialias: true
    });

    await Assets.load(PlayerSVG);
    this.textures.player_texture = Assets.get(PlayerSVG);

    this.app.stage.addChild(this.world);
    this.app.stage.addChild(this.ui);
    this.app.ticker.add(this.draw);
  }

  upsertChunk(cx, cy, tiles) {
    const key = `${cx},${cy}`;
    
    if (this.chunks.has(key)) {
      const oldG = this.chunks.get(key);
      this.tileContainer.removeChild(oldG);
      oldG.destroy({ children: true, texture: true, baseTexture: true });
    }

    const g = new Graphics();
    
    g.x = cx * CHUNK_SIZE * TILE_SIZE;
    g.y = cy * CHUNK_SIZE * TILE_SIZE;

    for (let y = 0; y < CHUNK_SIZE; y++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        const type = tiles[y * CHUNK_SIZE + x];
        const color = TILE_COLORS[type] ?? 0x000000;
        
        g.rect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE).fill(color);
      }
    }

    this.tileContainer.addChild(g);
    this.chunks.set(key, g);
  }

  syncPlayerSprites() {
    this.game.players.forEach((player) => {
      if (!this.player_id_to_sprite[player.id]) {
        const sprite = new Sprite(this.textures.player_texture);
        sprite.anchor.set(0.5);
        sprite.width = 32;
        sprite.height = 32;
        
        sprite.x = player.x;
        sprite.y = player.y;
        sprite._renderX = player.x;
        sprite._renderY = player.y;

        this.player_id_to_sprite[player.id] = sprite;
        this.playerContainer.addChild(sprite);
      }
    });
  }

  draw = (ticker) => {
    if (!this.game?.my_player) return;
    const dt = ticker.deltaTime;

    this.syncPlayerSprites();

    this.game.players.forEach((player) => {
      let sprite = this.player_id_to_sprite[player.id];
      if (!sprite) return;

      const lerpAmount = 0.25; 
      sprite._renderX += (player.x - sprite._renderX) * lerpAmount * dt;
      sprite._renderY += (player.y - sprite._renderY) * lerpAmount * dt;

      sprite.x = sprite._renderX;
      sprite.y = sprite._renderY;
    });

    const cameraLerp = 0.1 * dt;
    this.camera.x += (this.game.my_player.x - this.camera.x) * cameraLerp;
    this.camera.y += (this.game.my_player.y - this.camera.y) * cameraLerp;

    const halfW = this.app.screen.width / 2;
    const halfH = this.app.screen.height / 2;

    this.world.x = halfW - this.camera.x;
    this.world.y = halfH - this.camera.y;
  };
}