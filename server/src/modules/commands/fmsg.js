var GameMode = require('../../gamemodes');

module.exports = function (gameServer, split) {
  var newLB = [];
  var n = [];
  gameServer.overideauto = true;
  gameServer.run = false; // Switches the pause state

  for (var i = 1; i < split.length; i++) {
    newLB[i - 1] = split[i];
  }
  for (var i = 0; i < gameServer.clients.length; i++) {
    var client = gameServer.clients[i].playerTracker;
    n[i] = client.name;

    if (client) {
      client.name = "Look At Leaderboard";
    }

  }
  gameServer.lleaderboard = false;
  gameServer.gameMode.packetLB = 48;
  gameServer.gameMode.specByLeaderboard = false;
  gameServer.gameMode.updateLB = function (gameServer) {
    gameServer.leaderboard = newLB
  };
  console.log("[ForceMSG] The message has been broadcast");
  setTimeout(function () {
    var gm = GameMode.get(gameServer.gameMode.ID, gameServer);

    // Replace functions
    gameServer.gameMode.packetLB = gm.packetLB;
    gameServer.gameMode.updateLB = gm.updateLB;

    for (var i = 0; i < gameServer.clients.length; i++) {
      var client = gameServer.clients[i].playerTracker;

      if (client) {
        client.name = n[i];
      }

    }
    gameServer.overideauto = false;
    gameServer.run = true;
    console.log("[ForceMSG] The game has been reset");
    setTimeout(function () {
      gameServer.lleaderboard = true;
    }, 2000);
  }, 6500);
};
