import { Container, Graphics, Sprite, Text, TextStyle } from "pixi.js";
import { initDecoder } from "../packetHandler";

export default class Player {
  constructor(
    { id, name, x, y, weapon, aim },
    [playerTexture, arm1Texture, arm2Texture],
    world,
  ) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.aim = aim;
    this.lastAim = aim;
    this.visualAim = aim;
    this.attackAnim = 0;
    this.visualAim = this.aim ?? 0;
    this.animateRightArm = false;
    this.lastX = x;
    this.lastY = y;
    this.lerpX = x;
    this.lerpY = y;
    this.weapon = weapon;

    this.sprite;
    this.arm1Sprite;
    this.arm2Sprite;
    this.healthBarContainer;
    this.healthBarBackground;
    this.healthBar;
    this.nameLabel;

    this.initSprites([playerTexture, arm1Texture, arm2Texture]);

    world.addChild(this.sprite.arm1Sprite);
    world.addChild(this.sprite.arm2Sprite);
    world.addChild(this.sprite);

    this.initHealthBar(world);
    this.initNameLabel(
      this.name,
      new TextStyle({
        fontSize: 20,
        fontFamily: "GameFont",
        fontWeight: "normal",
        fill: "#fff",
        stroke: {
          color: "#454545",
          width: 6.7,
          join: "round",
        },
        align: "center",
        letterSpacing: 0.67,
      }),
      world
    );
  }

  initNameLabel(name, nameTextStyle, world) {
    const label = new Text({
      text: name,
      style: nameTextStyle,
    });
    label.anchor.set(0.5, 1);
    this.sprite.nameLabel = label;
    world.addChild(label);
  }

  initSprites([playerTexture, arm1Texture, arm2Texture]) {
    const container = new Container();

    const shadow = new Graphics();
    shadow.circle(0, 0, 40).fill(0x000000);
    shadow.alpha = 0.05;

    shadow.scale.set(0.9, 1);

    const playerSprite = new Sprite(playerTexture);
    playerSprite.anchor.set(0.5);
    playerSprite.width = playerSprite.height = 70;

    const arm1 = new Sprite(arm1Texture);
    const arm2 = new Sprite(arm2Texture);

    arm1.anchor.set(0.5);
    arm1.width = 50;
    arm1.height = 60;

    arm2.anchor.set(0.5);
    arm2.width = 50;
    arm2.height = 60;

    container.addChild(shadow);
    container.addChild(playerSprite);

    container.playerSprite = playerSprite;
    container.shadow = shadow;
    container.arm1Sprite = arm1;
    container.arm2Sprite = arm2;

    container._rx = this.x;
    container._ry = this.y;

    this.sprite = container;
  }

  update(delta, rotation, lerpAlpha) {
    this.sprite.rotation = rotation;

    // interpolate
    this.sprite._rx += (this.x - this.sprite._rx) * lerpAlpha;
    this.sprite._ry += (this.y - this.sprite._ry) * lerpAlpha;
    this.sprite.x = this.sprite._rx;
    this.sprite.y = this.sprite._ry;

    if (this.sprite.nameLabel) {
      this.sprite.nameLabel.x = this.sprite._rx;
      this.sprite.nameLabel.y = this.sprite._ry - 40;
    }

    this.healthBarContainer.x = this.sprite._rx;
    this.healthBarContainer.y = this.sprite._ry + 45;

    this.updateArms(rotation);

    this.attackAnim -= delta * 4;
    this.attackAnim = Math.max(0, Math.min(this.attackAnim, 1));

    let aimDelta = this.aim - this.visualAim;
    if (aimDelta > Math.PI) aimDelta -= Math.PI * 2;
    if (aimDelta < -Math.PI) aimDelta += Math.PI * 2;
    this.visualAim += aimDelta * lerpAlpha;
  }

  updateArms(
    rotation,
    restDistance = 25,
    punchDistance = 35,
    restAngle = Math.PI / 3,
  ) {
    const aim = rotation;

    let extension = Math.sin(this.attackAnim * Math.PI);

    if (this.sprite?.arm1Sprite) {
      const isPunching = this.animateRightArm;
      const currentExt = isPunching ? extension : 0;

      const dist = restDistance + (punchDistance - restDistance) * currentExt;

      const currentAngleOffset = -restAngle * (1 - currentExt);

      this.sprite.arm1Sprite.x =
        this.sprite._rx + dist * Math.cos(aim + currentAngleOffset);
      this.sprite.arm1Sprite.y =
        this.sprite._ry + dist * Math.sin(aim + currentAngleOffset);

      this.sprite.arm1Sprite.rotation = aim + (isPunching ? extension : 0);
    }

    if (this.sprite?.arm2Sprite) {
      const isPunching = !this.animateRightArm;
      const currentExt = isPunching ? extension : 0;

      const dist = restDistance + (punchDistance - restDistance) * currentExt;
      const currentAngleOffset = restAngle * (1 - currentExt);

      this.sprite.arm2Sprite.x =
        this.sprite._rx + dist * Math.cos(aim + currentAngleOffset);
      this.sprite.arm2Sprite.y =
        this.sprite._ry + dist * Math.sin(aim + currentAngleOffset);

      this.sprite.arm2Sprite.rotation = aim - (isPunching ? extension : 0);
    }
  }

  initHealthBar(world) {
    const W = 60, H = 6, R = 2;

    this.healthBarBg = new Graphics()
      .roundRect(-W / 2 - 3, 0 - 3, W + 6, H + 6, R + 2)
      .fill(0x333333);

    this.healthBarFg = new Graphics();
    this._hbW = W; this._hbH = H; this._hbR = R;
    this._drawBar(1.0);

    this.healthBarContainer = new Container();
    this.healthBarContainer.addChild(this.healthBarBg);
    this.healthBarContainer.addChild(this.healthBarFg);

    world.addChild(this.healthBarContainer);
  }

  _drawBar(ratio) {
    const { _hbW: W, _hbH: H, _hbR: R } = this;
    const color = ratio > 0.5 ? 0x8ecc51 : ratio > 0.25 ? 0xf0a30a : 0xe74c3c;
    const w = Math.max(0, W * ratio);
    this.healthBarFg.clear();
    if (w > 0) {
      this.healthBarFg.roundRect(-W / 2, 0, w, H, Math.min(R, w / 2)).fill(color);
    }
  }

  setHealth(current, max) {
    this._drawBar(Math.max(0, current / max));
  }
}
