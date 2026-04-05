export default class Player {
  constructor({id, name, x, y, weapon, aim}) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.aim = aim;
    this.lastAim = aim;
    this.visualAim = aim;
    this.lastX = x;
    this.lastY = y;
    this.lerpX = x;
    this.lerpY = y;
    this.weapon = weapon;
  };
};
