module.exports = function (gameServer, split) {
  // Validation checks
  var id = parseInt(split[1]);
  var count = parseInt(split[2]);
  if (isNaN(id)) {
    console.log("[Console] Please specify a valid player ID!");
    return;
  }
  if (isNaN(count)) {
    console.log("[Console] Since you did not specify split count, We will split the person into 16 cells");
    count = 4;
  }
  if (count > gameServer.config.playerMaxCells) {
    console.log("[Console]" + amount + "Is greater than the max cells, split into the max cell amount");
    count = gameServer.config.playerMaxCells;
  }
  for (var i in gameServer.clients) {
    if (gameServer.clients[i].playerTracker.pID == id) {
      var client = gameServer.clients[i].playerTracker;
      for (var i = 0; i < count; i++) {
        gameServer.splitCells(client);
      }
      console.log("[Console] Forced " + client.name + " to split cells");
      break;
    }
  }
};
