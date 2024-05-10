module.exports = function (gameServer, split) {
  var toRemove = parseInt(split[1]);
  if (isNaN(toRemove)) {
    toRemove = -1; // Kick all bots if user doesnt specify a number
  }

  var removed = 0;
  var i = 0;
  while (i < gameServer.clients.length && removed != toRemove) {
    if (typeof gameServer.clients[i].remoteAddress == 'undefined') { // if client i is a bot kick him
      var client = gameServer.clients[i].playerTracker;
      var len = client.cells.length;
      for (var j = 0; j < len; j++) {
        gameServer.removeNode(client.cells[0]);
      }
      removed++;
      i++;
    } else
      i++;
  }
  if (toRemove == -1)
    console.log("[Console] Killed all bots (" + removed + ")");
  else if (toRemove == removed)
    console.log("[Console] Killed " + toRemove + " bots");
  else
    console.log("[Console] Only " + removed + " bots could be killed");
};
