module.exports = function (gameServer, split) {
  // Validation checks
  var id = parseInt(split[1]);
  if (isNaN(id)) {
    console.log("[Console] Please specify a valid player ID!");
    return;
  }

  if (!gameServer.clients[id]) {
    console.log("[Console] Client is nonexistent!");
    return;
  }

  gameServer.clients[id].playerTracker.massDecayMult = 1;
  gameServer.clients[id].playerTracker.actionMult = 0;
  gameServer.clients[id].playerTracker.actionDecayMult = 1;
  console.log("[Console] Successfully reset client's anti-team effect");
};
