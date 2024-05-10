var GameMode = require('../../gamemodes');
var fs = require("fs");

module.exports = function (gameServer, split) {
  // Get ip
  var ip = split[1];
  if (split[1] == "record") {
    if (split[2] = "clear") {
      fs.writeFileSync(__dirname + '/../banned.txt', "");
      console.log("[Console] Cleared recorded banlist");
      return;
    }

    var oldstring = "";
    var string = "";
    for (var i in gameServer.banned) {
      var banned = gameServer.banned[i];
      if (banned != "") {

        string = oldstring + "\n" + banned;
        oldstring = string;
      }
    }

    fs.writeFileSync(__dirname + '/../banned.txt', string);
    console.log("[Console] Successfully recorded banlist");
    return;
  }
  if (gameServer.whlist.indexOf(ip) == -1) {
    if (gameServer.banned.indexOf(ip) == -1) {
      gameServer.banned.push(ip);
      console.log("[Console] Added " + ip + " to the banlist");
      // Remove from game
      var newLB = [];
      newLB[0] = "The Ban Hammer";
      newLB[1] = "Has Spoken!";
      newLB[2] = "A Player has been";
      newLB[3] = "Banned with IP";
      newLB[4] = ip;
      // Clears the update leaderboard function and replaces it with our own
      gameServer.lleaderboard = false;
      gameServer.gameMode.packetLB = 48;
      gameServer.gameMode.specByLeaderboard = false;
      gameServer.gameMode.updateLB = function (gameServer) {
        gameServer.leaderboard = newLB
      };
      setTimeout(function () {
        var gm = GameMode.get(gameServer.gameMode.ID, gameServer);

        // Replace functions
        gameServer.gameMode.packetLB = gm.packetLB;
        gameServer.gameMode.updateLB = gm.updateLB;
        setTimeout(function () {
          gameServer.lleaderboard = true;
        }, 2000);
      }, 14000);
      for (var i in gameServer.clients) {
        var c = gameServer.clients[i];
        if (!c.remoteAddress) {
          continue;
        }
        if (c.remoteAddress == ip) {

          //this.socket.close();
          c.close(); // Kick out
        }
      }
      if (gameServer.config.autobanrecord == 1) {

        var oldstring = fs.readFileSync(__dirname + "/../banned.txt", "utf8");
        var string = "";
        for (var i in gameServer.banned) {
          var banned = gameServer.banned[i];
          if (banned != "") string = oldstring + "\n" + banned;
        }

        fs.writeFileSync(__dirname + '/../banned.txt', string);
      }
    } else {
      console.log("[Console] That IP is already banned");
    }
  } else {

    console.log("[Console] That IP is whitelisted");
  }
};
