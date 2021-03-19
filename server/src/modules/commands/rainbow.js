module.exports = function (gameServer, split) {
  var id = parseInt(split[1]);
  if (isNaN(id)) {
    console.log("[Console] Please specify a player!");
    return;
  }
  for (var i in gameServer.clients) {
    if (gameServer.clients[i].playerTracker.pID == id) {
      var client = gameServer.clients[i].playerTracker;
      if (client.rainbowon) {
        client.rainbowon = false;
        for (var j in client.cells) {
         gameServer.getWorld().getNodes("rainbow").delete(client.cells[j].getId())
          client.cells[j].color = client.color;
        }
        console.log("[Console] Removed rainbow effect for " + client.name);
      } else {
        client.rainbowon = true;
        for (var j in client.cells) {
          gameServer.addRainbowNode(client.cells[j]);
        }
        console.log("[Console] Added rainbow effect for " + client.name);
      }
      break;
    }
  }

};
