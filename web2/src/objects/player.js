export default class Player {
  constructor({id, name, x, y, weapon}) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.lastX = x;
    this.lastY = y;
    this.lerpX = x;
    this.lerpY = y;
    this.weapon = weapon;
  };
};
