var GameMode = require('../../gamemodes');

module.exports = function (gameServer) {
  // Gets the current gamemode
  var gm = GameMode.get(gameServer.gameMode.ID, gameServer);

  // Replace functions
  gameServer.gameMode.packetLB = gm.packetLB;
  gameServer.gameMode.updateLB = gm.updateLB;
  console.log("[Console] Successfully reset leaderboard");
  setTimeout(function () {
    gameServer.lleaderboard = true;
  }, 2000);
};
