module.exports = function (gameServer, split) {
  if (split[1] == "login") {
  var id = parseInt(split[2]);
  if (isNaN(id)) {
    console.log("[Console] Please specify a valid player ID!");
    return;
  }

  for (var i in gameServer.clients) {
    if (gameServer.clients[i].playerTracker.pID == id) {
      var client = gameServer.clients[i].playerTracker;

      client.isAdmin = true;
      console.log("[Console] Logged in " + client.name + " as admin");
     

      break;
    }
  }
} else if (split[1] == "logout") {
    var id = parseInt(split[2]);
  if (isNaN(id)) {
    console.log("[Console] Please specify a valid player ID!");
    return;
  }

  for (var i in gameServer.clients) {
    if (gameServer.clients[i].playerTracker.pID == id) {
      var client = gameServer.clients[i].playerTracker;

      client.isAdmin = false;
      console.log("[Console] Logged out " + client.name + " as admin");
     

      break;
    }
  }
  
}
};
