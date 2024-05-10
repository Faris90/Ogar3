module.exports = function(gameServer, split) {
  var id = parseInt(split[1]);
  if (isNaN(id)) {
    console.log("[Console] Please specify a valid player ID!");
    return;
  }

  var count = 0;
  for (var i in gameServer.clients) {
    if (gameServer.clients[i].playerTracker.pID == id) {
      var client = gameServer.clients[i].playerTracker;
      var len = client.cells.length;
      for (var j = 0; j < len; j++) {
        gameServer.removeNode(client.cells[0]);
        count++;
      }

      if (client.name.length == 0) {
        console.log("[Console] Killed An unnamed cell and removed " + count + " cells");
        break;
      } else {
        console.log("[Console] Killed " + client.name + " and removed " + count + " cells");
        break;
      }
    }
  }
};
