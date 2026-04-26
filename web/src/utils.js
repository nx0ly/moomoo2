import { uboSyncFunctionsSTD40 } from "pixi.js"

export default function utils() {
  this.findPlayerByID = (id) => {
    return this.game.players.find(player => player.id === id)
  }

  this.findObjectByID = (id) => {
    return this.game.objects.find(object => object.id === id)
  }

  return this
}

export function format(number) {
  if (number >= 1_000_000) return (number / 1_000_000).toFixed(1) + "m";
  if (number >= 1_000) return (number / 1_000).toFixed(1) + "k";
  return String(number);
}