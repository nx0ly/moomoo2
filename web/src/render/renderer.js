import { Application, Assets, Container, Graphics, Sprite } from "pixi.js";
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

    this.lastCleanupTime = 0;
    this.cleanupInterval = 1000;
    
    this.drawGrid(this.grid, 16384, 16384, 64);
  }

  drawGrid(g, w, h, s) {
    g.clear();
    const lineStyle = { width: 4, color: 0x000000, alpha: 0.06 };
    for (let x = 0; x <= w; x += s) {
      g.moveTo(x, 0).lineTo(x, h).stroke(lineStyle);
    }
    for (let y = 0; y <= h; y += s) {
      g.moveTo(0, y).lineTo(w, y).stroke(lineStyle);
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
    
    this.textures.player_texture = playerAsset;
    this.textures.fish_texture = fishAsset;

    this.app.stage.addChild(this.world);
    this.app.stage.addChild(this.ui);
    this.app.ticker.add(this.draw);
  }

  draw = (ticker) => {
    const myPlayer = this.game?.my_player;
    if (!myPlayer) return;

    const now = performance.now();
    const delta = ticker.deltaMS * 0.001;
    const interpolationAlpha = 1 - Math.pow(0.75, delta / 0.067);

    const camDx = myPlayer.x - this.camera.x;
    const camDy = myPlayer.y - this.camera.y;
    this.camera.x += camDx * delta * 4;
    this.camera.y += camDy * delta * 4;

    this.world.x = (this.app.screen.width >> 1) - this.camera.x;
    this.world.y = (this.app.screen.height >> 1) - this.camera.y;

    const players = this.game.players;
    for (let i = 0; i < players.length; i++) {
      const p = players[i];
      let s = this.player_id_to_sprite[p.id];

      if (!s) {
        s = new Sprite(this.textures.player_texture);
        s.anchor.set(0.5);
        s.width = s.height = 70;
        this.player_id_to_sprite[p.id] = s;
        this.world.addChild(s);
        s._rx = p.x; s._ry = p.y;
      }

      s._rx += (p.x - s._rx) * interpolationAlpha;
      s._ry += (p.y - s._ry) * interpolationAlpha;
      s.x = s._rx;
      s.y = s._ry;
    }
    
    for (let i = 0; i < this.animals.length; i++) {
      const a = this.animals[i];
      let s = this.animal_id_to_sprite[a.sid];

      if (!s) {
        s = new Sprite(this.textures.fish_texture);
        s.anchor.set(0.5);
        
        s.width = s.height = 128; 
        
        s._rx = a.x; 
        s._ry = a.y;
        this.animal_id_to_sprite[a.sid] = s;
        this.world.addChild(s);
      }

      const dx = a.x - s.x;
      const dy = a.y - s.y;

      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        s.rotation = Math.atan2(dy, dx);
      }

      s._rx += (a.x - s._rx) * interpolationAlpha;
      s._ry += (a.y - s._ry) * interpolationAlpha;
      s.x = s._rx;
      s.y = s._ry;
      
      s._lastSeen = now;
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