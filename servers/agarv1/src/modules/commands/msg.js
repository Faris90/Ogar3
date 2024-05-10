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
  console.log("[MSG] The message has been broadcast");
  setTimeout(function () {
    var gm = GameMode.get(gameServer.gameMode.ID, gameServer);

    // Replace functions
    gameServer.gameMode.packetLB = gm.packetLB;
    gameServer.gameMode.updateLB = gm.updateLB;
    console.log("[MSG] The board has been reset");
    setTimeout(function () {
      gameServer.lleaderboard = true;
    }, 2000);

  }, 14000);
};
