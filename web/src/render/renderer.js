import { Application, Assets, Container, Graphics, Sprite } from "pixi.js";
import Camera from "../objects/camera";
import PlayerSVG from "../assets/head.png";

const CHUNK_SIZE = 16;
const TILE_SIZE = 6;

const TILE_COLORS = {
  "Ocean": 0x4488ff,
  "Sand": 0xedc9af,
  "Grass": 0x768f5a,
  0: 0x4488ff,
  1: 0xedc9af,
  2: 0x768f5a,
};

// FIX MARCHING SQUARES ALGORITHM!!

export class Render {
  constructor(game) {
    this.game = game;
    this.app = new Application();
    this.camera = new Camera(0, 0);

    this.world = new Container();
    this.tileContainer = new Container();
    this.ui = new Container();

    this.world.addChild(this.tileContainer);

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
    });

    await Assets.load(PlayerSVG);
    this.textures.player_texture = Assets.get(PlayerSVG);

    this.app.stage.addChild(this.world);
    this.app.stage.addChild(this.ui);
    this.app.ticker.add(this.draw);
  }

  getVal(tiles, x, y) {
    if (x < 0 || x >= CHUNK_SIZE || y < 0 || y >= CHUNK_SIZE) return 0;
    const t = tiles[y * CHUNK_SIZE + x];
    return (t === "Grass" || t === 2) ? 1 : 0;
  }

  drawSmoothCell(g, xPos, yPos, tl, tr, br, bl) {
    const size = TILE_SIZE;
    const config = tl * 8 + tr * 4 + br * 2 + bl * 1;
    
    const top = { x: xPos + size * 0.5, y: yPos };
    const right = { x: xPos + size, y: yPos + size * 0.5 };
    const bottom = { x: xPos + size * 0.5, y: yPos + size };
    const left = { x: xPos, y: yPos + size * 0.5 };
    
    const tl_corner = { x: xPos, y: yPos };
    const tr_corner = { x: xPos + size, y: yPos };
    const br_corner = { x: xPos + size, y: yPos + size };
    const bl_corner = { x: xPos, y: yPos + size };
    
    const offset = size * 0.35;
    
    g.moveTo(xPos, yPos);
    
    switch(config) {
      case 0: break;
      
      case 1:
        g.moveTo(left.x, left.y);
        g.bezierCurveTo(left.x, left.y + offset, bottom.x - offset, bottom.y, bottom.x, bottom.y);
        g.lineTo(bl_corner.x, bl_corner.y);
        g.lineTo(left.x, left.y);
        break;
        
      case 2:
        g.moveTo(bottom.x, bottom.y);
        g.bezierCurveTo(bottom.x + offset, bottom.y, right.x, right.y + offset, right.x, right.y);
        g.lineTo(br_corner.x, br_corner.y);
        g.lineTo(bottom.x, bottom.y);
        break;
        
      case 3:
        g.moveTo(left.x, left.y);
        g.lineTo(bl_corner.x, bl_corner.y);
        g.lineTo(br_corner.x, br_corner.y);
        g.lineTo(right.x, right.y);
        g.bezierCurveTo(right.x, right.y - offset, left.x, left.y - offset, left.x, left.y);
        break;
        
      case 4:
        g.moveTo(top.x, top.y);
        g.bezierCurveTo(top.x + offset, top.y, right.x, right.y - offset, right.x, right.y);
        g.lineTo(tr_corner.x, tr_corner.y);
        g.lineTo(top.x, top.y);
        break;
        
      case 5:
        g.moveTo(left.x, left.y);
        g.bezierCurveTo(left.x, left.y + offset, bottom.x - offset, bottom.y, bottom.x, bottom.y);
        g.lineTo(bl_corner.x, bl_corner.y);
        g.lineTo(left.x, left.y);
        g.moveTo(top.x, top.y);
        g.bezierCurveTo(top.x + offset, top.y, right.x, right.y - offset, right.x, right.y);
        g.lineTo(tr_corner.x, tr_corner.y);
        g.lineTo(top.x, top.y);
        break;
        
      case 6:
        g.moveTo(top.x, top.y);
        g.lineTo(tr_corner.x, tr_corner.y);
        g.lineTo(br_corner.x, br_corner.y);
        g.lineTo(bottom.x, bottom.y);
        g.bezierCurveTo(bottom.x - offset, bottom.y, top.x - offset, top.y, top.x, top.y);
        break;
        
      case 7:
        g.moveTo(left.x, left.y);
        g.lineTo(bl_corner.x, bl_corner.y);
        g.lineTo(br_corner.x, br_corner.y);
        g.lineTo(tr_corner.x, tr_corner.y);
        g.lineTo(top.x, top.y);
        g.bezierCurveTo(top.x - offset, top.y, left.x, left.y + offset, left.x, left.y);
        break;
        
      case 8:
        g.moveTo(top.x, top.y);
        g.bezierCurveTo(top.x - offset, top.y, left.x, left.y - offset, left.x, left.y);
        g.lineTo(tl_corner.x, tl_corner.y);
        g.lineTo(top.x, top.y);
        break;
        
      case 9:
        g.moveTo(top.x, top.y);
        g.bezierCurveTo(top.x + offset, top.y, bottom.x + offset, bottom.y, bottom.x, bottom.y);
        g.lineTo(bl_corner.x, bl_corner.y);
        g.lineTo(tl_corner.x, tl_corner.y);
        g.lineTo(top.x, top.y);
        break;
        
      case 10:
        g.moveTo(top.x, top.y);
        g.bezierCurveTo(top.x - offset, top.y, left.x, left.y - offset, left.x, left.y);
        g.lineTo(tl_corner.x, tl_corner.y);
        g.lineTo(top.x, top.y);
        g.moveTo(bottom.x, bottom.y);
        g.bezierCurveTo(bottom.x + offset, bottom.y, right.x, right.y + offset, right.x, right.y);
        g.lineTo(br_corner.x, br_corner.y);
        g.lineTo(bottom.x, bottom.y);
        break;
        
      case 11:
        g.moveTo(top.x, top.y);
        g.bezierCurveTo(top.x - offset, top.y, left.x, left.y - offset, left.x, left.y);
        g.lineTo(tl_corner.x, tl_corner.y);
        g.lineTo(bl_corner.x, bl_corner.y);
        g.lineTo(br_corner.x, br_corner.y);
        g.lineTo(right.x, right.y);
        g.bezierCurveTo(right.x, right.y - offset, top.x + offset, top.y, top.x, top.y);
        break;
        
      case 12:
        g.moveTo(left.x, left.y);
        g.bezierCurveTo(left.x, left.y + offset, right.x, right.y + offset, right.x, right.y);
        g.lineTo(tr_corner.x, tr_corner.y);
        g.lineTo(tl_corner.x, tl_corner.y);
        g.lineTo(left.x, left.y);
        break;
        
      case 13:
        g.moveTo(left.x, left.y);
        g.lineTo(tl_corner.x, tl_corner.y);
        g.lineTo(tr_corner.x, tr_corner.y);
        g.lineTo(right.x, right.y);
        g.bezierCurveTo(right.x, right.y + offset, bottom.x + offset, bottom.y, bottom.x, bottom.y);
        g.lineTo(bl_corner.x, bl_corner.y);
        g.lineTo(left.x, left.y);
        break;
        
      case 14:
        g.moveTo(top.x, top.y);
        g.lineTo(tl_corner.x, tl_corner.y);
        g.lineTo(bl_corner.x, bl_corner.y);
        g.lineTo(bottom.x, bottom.y);
        g.bezierCurveTo(bottom.x - offset, bottom.y, left.x, left.y + offset, left.x, left.y);
        g.lineTo(tr_corner.x, tr_corner.y);
        g.lineTo(top.x, top.y);
        break;
        
      case 15:
        g.rect(xPos, yPos, size, size);
        break;
    }
    
    g.fill(TILE_COLORS["Grass"]);
  }

  upsertChunk(cx, cy, tiles) {
    const key = `${cx},${cy}`;
    if (this.chunks.has(key)) {
      this.tileContainer.removeChild(this.chunks.get(key));
    }

    const g = new Graphics();
    const ox = cx * CHUNK_SIZE * TILE_SIZE;
    const oy = cy * CHUNK_SIZE * TILE_SIZE;

    for (let y = 0; y < CHUNK_SIZE; y++) {
      for (let x = 0; x < CHUNK_SIZE; x++) {
        const type = tiles[y * CHUNK_SIZE + x];
        if (type === "Grass" || type === 2) continue;
        g.rect(ox + x * TILE_SIZE, oy + y * TILE_SIZE, TILE_SIZE, TILE_SIZE).fill(TILE_COLORS[type]);
      }
    }

    for (let y = 0; y < CHUNK_SIZE - 1; y++) {
      for (let x = 0; x < CHUNK_SIZE - 1; x++) {
        const xPos = ox + x * TILE_SIZE;
        const yPos = oy + y * TILE_SIZE;

        const tl = this.getVal(tiles, x, y);
        const tr = this.getVal(tiles, x + 1, y);
        const br = this.getVal(tiles, x + 1, y + 1);
        const bl = this.getVal(tiles, x, y + 1);
        
        this.drawSmoothCell(g, xPos, yPos, tl, tr, br, bl);
      }
    }

    this.tileContainer.addChild(g);
    this.chunks.set(key, g);
  }

  draw = (delta) => {
    if (!this.game?.my_player) return;
    const dt = delta.deltaMS * 0.001;

    this.game.players.forEach((player) => {
      let sprite = this.player_id_to_sprite[player.id];
      if (!sprite) return;

      if (sprite._renderX === undefined) {
        sprite._renderX = sprite.x;
        sprite._renderY = sprite.y;
      }

      const alpha = 1 - Math.pow(1 - 0.25, dt / 0.067);
      sprite._renderX += (player.x - sprite._renderX) * alpha;
      sprite._renderY += (player.y - sprite._renderY) * alpha;

      sprite.x = sprite._renderX;
      sprite.y = sprite._renderY;

      if (sprite.nameText) {
        sprite.nameText.x = sprite.x;
        sprite.nameText.y = sprite.y - 50;
      }
    });

    const dx = this.game.my_player.x - this.camera.x;
    const dy = this.game.my_player.y - this.camera.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const dir = Math.atan2(dy, dx);

    const speed = Math.min(dist * dt * 3.5, dist);

    this.camera.x += Math.cos(dir) * speed;
    this.camera.y += Math.sin(dir) * speed;

    const halfW = this.app.screen.width / 2;
    const halfH = this.app.screen.height / 2;

    this.world.x = halfW - this.camera.x;
    this.world.y = halfH - this.camera.y;
  };
}