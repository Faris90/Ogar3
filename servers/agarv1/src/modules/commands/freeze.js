module.exports = function (gameServer, split) {
  var id = parseInt(split[1]);
  if (isNaN(id)) {
    console.log("[Console] Please specify a valid player ID!");
    return;
  }

  for (var i in gameServer.clients) {
    if (gameServer.clients[i].playerTracker.pID == id) {
      var client = gameServer.clients[i].playerTracker;

      client.frozen = !client.frozen;
      if (client.frozen) {
        console.log("[Console] Froze player " + id);

      } else {
        console.log("[Console] Unfroze player " + id);
      }

      break;
    }
  }

};
