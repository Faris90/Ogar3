var fs = require("fs");

module.exports = function (gameServer, split) {
  var start = parseInt(split[1]);
  var end = parseInt(split[2]);
  if (isNaN(start) || isNaN(end)) {
    console.log("[Console] Please specify a valid range!");
  }
  for (var h = start; h < end; h++) {
    var ip;
    for (var i in gameServer.clients) {
      if (gameServer.clients[i].playerTracker.pID == h) {
        var ip = gameServer.clients[i].playerTracker.socket.remoteAddress;
        break;
      }
    }
    if (gameServer.banned.indexOf(ip) == -1) {

      gameServer.banned.push(ip);
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

        var oldstring = fs.readFileSync("./banned.txt", "utf8");
        var string = "";
        for (var i in gameServer.banned) {
          var banned = gameServer.banned[i];
          if (banned != "") string = oldstring + "\n" + banned;
        }

        fs.writeFileSync('./banned.txt', string);
      }
    }
  }
};
