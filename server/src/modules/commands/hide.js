module.exports = function (gameServer, split) {
  var id = parseInt(split[1]);
  if (isNaN(id)) {
    console.log("[Console] Please specify a valid player ID!");
    return;
  }

  for (var i in gameServer.clients) {
    if (gameServer.clients[i].playerTracker.pID == id) {
      var client = gameServer.clients[i].playerTracker;

      client.visible = !client.visible;
      if (!client.visible) {
        console.log("[Console] hid player " + id);

      } else {
        console.log("[Console] Unhid player " + id);
      }

      break;
    }
  }
};
