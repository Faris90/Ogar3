module.exports = function (gameServer, split) {
  var id = parseInt(split[1]);
  if (isNaN(id)) {
    console.log("[Console] Please specify a valid player ID!");
    return;
  }

  // Make sure the input values are numbers
  var pos = {
    x: parseInt(split[2]),
    y: parseInt(split[3])
  };
  if (isNaN(pos.x) || isNaN(pos.y)) {
    console.log("[Console] Invalid coordinates");
    return;
  }

  // Spawn
  for (var i in gameServer.clients) {
    if (gameServer.clients[i].playerTracker.pID == id) {
      var client = gameServer.clients[i].playerTracker;
      for (var j in client.cells) {
        client.cells[j].position.x = pos.x;
        client.cells[j].position.y = pos.y;
      }

      console.log("[Console] Teleported " + client.name + " to (" + pos.x + " , " + pos.y + ")");
      break;
    }
  }
};
