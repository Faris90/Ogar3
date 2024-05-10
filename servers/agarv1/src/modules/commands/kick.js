module.exports = function (gameServer, split) {
  var id = parseInt(split[1]);
  if (isNaN(id)) {
    console.log("[Console] Please specify a valid player ID!");
    return;
  }

  for (var i in gameServer.clients) {
    if (gameServer.clients[i].playerTracker.pID == id) {
      var client = gameServer.clients[i].playerTracker;
      var len = client.cells.length;
      for (var j = 0; j < len; j++) {
        gameServer.removeNode(client.cells[0]);
      }
      if (client.socket.remoteAddress) {
        client.nospawn = true;
      } else {
        client.socket.close();
      }
      if (!gameServer.clients[i].remoteAddress) {
          gameServer.sbo --;
          
        }
      console.log("[Console] Kicked " + client.name);
      break;
    }
  }
};
