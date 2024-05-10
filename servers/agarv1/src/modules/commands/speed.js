module.exports = function (gameServer, split) {
  var id = parseInt(split[1]);
  var speed = parseInt(split[2]);
  if (isNaN(id)) {
    console.log("[Console] Please specify a valid player ID!");
    return;
  }
  if (isNaN(speed)) {
    console.log("[Console] Please specify a valid speed!");
    return;
  }

  for (var i in gameServer.clients) {
    if (gameServer.clients[i].playerTracker.pID == id) {
      var client = gameServer.clients[i].playerTracker;

      client.customspeed = speed;

    }
  }
  console.log("[Console] Player " + id + "'s base speed is now " + speed);
};
