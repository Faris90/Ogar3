var fs = require("fs");

module.exports = function (gameServer, split) {
  var ip = split[1]; // Get ip
  var index = gameServer.banned.indexOf(ip);
  if (index > -1) {
    gameServer.banned.splice(index, 1);
    console.log("Unbanned " + ip);
    if (gameServer.config.autobanrecord == 1) {
      var oldstring = "";
      var string = "";
      for (var i in gameServer.banned) {
        var banned = gameServer.banned[i];
        if (banned != "") {

          string = oldstring + "\n" + banned;
          oldstring = string;
        }
      }


      fs.writeFileSync('./banned.txt', string);
    }
  } else {
    console.log("That IP is not banned");
  }
};
