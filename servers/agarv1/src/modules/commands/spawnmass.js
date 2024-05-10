module.exports = function (gameServer, split) {
  var id = parseInt(split[1]);
  var mass = parseInt(split[2]);
  if (isNaN(id)) {
    console.log("[Console] Please specify a valid player ID!");
    return;
  }
  if (isNaN(mass)) {
    console.log("[Console] Please specify a valid mass!");
    return;
  }

  for (var i in gameServer.clients) {
    if (gameServer.clients[i].playerTracker.pID == id) {
      var client = gameServer.clients[i].playerTracker;

      client.spawnmass = mass;

    }
  }
  console.log("[Console] Player " + id + " now spawns with " + mass + " Mass");
};
