var GameMode = require('../../gamemodes');

module.exports = function (gameServer, split) {
  console.log("High Score announce system started");
  setInterval(function () {
    var topScore = Math.floor(gameServer.topscore) + " ";
    var oldTopScores = Math.floor(gameServer.oldtopscores.score) + " ";
    var newLB = [];
    newLB[0] = "Highscore:";
    newLB[1] = gameServer.topusername;
    newLB[2] = "Withscore:";
    newLB[3] = topScore;
    newLB[4] = "------------";
    newLB[6] = "Previous Top Score";
    newLB[7] = oldTopScores;
    newLB[8] = "By:";
    newLB[9] = gameServer.oldtopscores.name;
    gameServer.lleaderboard = false;
    gameServer.gameMode.packetLB = 48;
    gameServer.gameMode.specByLeaderboard = false;
    gameServer.gameMode.updateLB = function (gameServer) {
      gameServer.leaderboard = newLB;
    };
    console.log("[Console] Successfully set leaderboard");
    setTimeout(function () {
      var gm = GameMode.get(gameServer.gameMode.ID, gameServer);

      // Replace functions
      gameServer.gameMode.packetLB = gm.packetLB;
      gameServer.gameMode.updateLB = gm.updateLB;

      setTimeout(function () {
        gameServer.lleaderboard = true;
      }, 2000);
      console.log("[Console] Successfully reset leaderboard");

    }, gameServer.config.anounceDuration * 1000);

  }, gameServer.config.anounceDelay * 1000);
};
