var GameMode = require('../../gamemodes');

module.exports = function (gameServer, split) {
  var delay = parseInt(split[1] * 1000);
  var dur = parseInt(split[2] * 1000);
  var re = parseInt(split[3]);
  var newLB = [];
  if (isNaN(delay)) {
    console.log("[Console] Please specify a valid delay!");
    return;
  }
  if (isNaN(dur)) {
    console.log("[Console] Please specify a valid duration!");
    return;
  }
  if (isNaN(re)) {
    console.log("[Console] Please specify a valid times to repeat!");
    return;
  }
  for (var i = 4; i < split.length; i++) {
    newLB[i - 4] = split[i];
  }
  console.log("[PMSG] Your request has been sent");
  console.log(delay + " " + dur + " " + re);
  var r = 1;
  gameServer.pmsg = 1;
  pmsgt = setInterval(function () {
    gameServer.lleaderboard = false;
    gameServer.gameMode.packetLB = 48;
    gameServer.gameMode.specByLeaderboard = false;
    gameServer.gameMode.updateLB = function (gameServer) {
      gameServer.leaderboard = newLB
    };
    console.log("[PMSG] The message has been broadcast " + r + "/" + re);
    var gm = GameMode.get(gameServer.gameMode.ID, gameServer);
    setTimeout(function () {
      // Replace functions
      gameServer.gameMode.packetLB = gm.packetLB;
      gameServer.gameMode.updateLB = gm.updateLB;
      setTimeout(function () {
        gameServer.lleaderboard = true;
      }, 2000);
      console.log("[PMSG] The board has been reset");
      r++;
      if (r > re) {
        console.log("[PMSG] Done");
        clearInterval(pmsgt);
      }

    }, dur);

  }, delay);

};
