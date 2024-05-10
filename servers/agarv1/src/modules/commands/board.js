var GameMode = require('../../gamemodes');

module.exports = function (gameServer, split) {
  var newLB = [];
  for (var i = 1; i < split.length; i++) {
    newLB[i - 1] = split[i];
  }

  // Clears the update leaderboard function and replaces it with our own
  gameServer.lleaderboard = false;
  gameServer.gameMode.packetLB = 48;
  gameServer.gameMode.specByLeaderboard = false;
  gameServer.gameMode.updateLB = function (gameServer) {
    gameServer.leaderboard = newLB
  };
  console.log("[Console] Successfully changed leaderboard values");
};
