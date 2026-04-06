export default function utils() {
  this.findPlayerByID = (id) => {
    return this.game.players.find(player => player.id === id)
  }

  this.findObjectByID = (id) => {
    return this.game.objects.find(object => object.id === id)
  }

  return this
}
