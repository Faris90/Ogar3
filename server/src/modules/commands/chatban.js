
module.exports = function (gameServer, split) {
  var id = parseInt(split[1]);
  if (isNaN(id)) {
    console.log("[Console] Please specify a valid player ID!");
    return;
  }

  for (var i in gameServer.clients) {
    if (gameServer.clients[i].playerTracker.pID == id) {
      var client = gameServer.clients[i].playerTracker;

      client.chatAllowed = !client.chatAllowed;
      if (client.chatAllowed) {
        gameServer.pm(id," You are no longer banned from chatting");
        console.log("[Console] Allowed player " + id + " To chat");

      } else {
        console.log("[Console] Banned player " + id + " From chat");
        gameServer.pm(id," You are now banned from chatting");
      }

      break;
    }
  }

};
