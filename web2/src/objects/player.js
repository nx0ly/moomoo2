import { Sprite, Text, TextStyle } from "pixi.js";
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
    this.attackAnim = 1;
    this.visualAim = this.aim ?? 0;
    this.animateRightArm = true;
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

    this.initHealthBar();
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
    );
  }

  initNameLabel(name, nameTextStyle) {
    const label = new Text({
      text: name,
      style: nameTextStyle,
    });
    label.anchor.set(0.5, 1);
    this.sprite.nameLabel = label;
  }

  initHealthBar() {
    this.healthBarContainer = new Sprite();
    this.healthBarBackground = new Sprite();
    this.healthBar = new Sprite();

    this.healthBarContainer.addChild(this.healthBarBackground);
    this.healthBarContainer.addChild(this.healthBar);

    this.healthBarBackground.width = 100;
    this.healthBarBackground.height = 10;
    this.healthBarBackground.tint = 0x525252;

    this.healthBar.width = 100;
    this.healthBar.height = 10;
    this.healthBar.tint = 0x8ecc51;

    this.healthBarContainer.anchor.set(0.5);
    this.healthBarContainer.x = 0;
    this.healthBarContainer.y = -30;

    this.sprite.addChild(this.healthBarContainer);
  }

  initSprites([playerTexture, arm1Texture, arm2Texture]) {
    this.sprite = new Sprite(playerTexture);
    this.sprite.arm1Sprite = new Sprite(arm1Texture);
    this.sprite.arm2Sprite = new Sprite(arm2Texture);

    this.sprite.arm1Sprite.anchor.set(0.5);
    this.sprite.arm1Sprite.width = 50;
    this.sprite.arm1Sprite.height = 60;

    this.sprite.arm2Sprite.anchor.set(0.5);
    this.sprite.arm2Sprite.width = 50;
    this.sprite.arm2Sprite.height = 60;

    this.sprite._rx = this.x;
    this.sprite._ry = this.y;

    this.sprite.anchor.set(0.5);
    this.sprite.width = this.sprite.height = 70;
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
}
