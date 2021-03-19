var fs = require("fs");

module.exports = function (gameServer, split) {
  if (split[1]) var c = split[1].toLowerCase(); else var c = "";
  var ip = split[2];
  if (c == "add") {
    if (gameServer.opbyip.indexOf(ip) == -1) {
      gameServer.opbyip.push(ip);
      console.log("[Console] Added " + ip + " to the opbyip list");
    } else {
      console.log("[Console] That ip is already listed");
    }
  } else if (c == "remove") {
    var index = gameServer.opbyip.indexOf(ip);
    if (index > -1) {
      gameServer.opbyip.splice(index, 1);

      console.log("[Console] Removed " + ip + " from the opbyip list");
    } else {
      console.log("[Console] That ip is already not in the list");

    }
  } else if (c == "list") {
    for (var i in gameServer.opbyip) {
      console.log(gameServer.opbyip[i]);

    }
  } else if (c == "clear") {
    gameServer.opbyip = [];
    console.log("[Console] Cleared opbyip list");
  } else if (c == "record") {
    if (split[2] == "clear") {
      fs.writeFileSync(__dirname + '/../opbyip.txt', '');
      console.log("[Console] Succesfully cleared recorded opbyip");
    } else {

      var oldstring = "";
      var string = "";
      for (var i in gameServer.opbyip) {
        var opbyip = gameServer.opbyip[i];
        if (opbyip != "") {

          string = oldstring + "\n" + opbyip;
          oldstring = string;
        }
      }

      fs.writeFileSync(__dirname + '/../opbyip.txt', string);
      console.log("[Console] Succesfully recorded opbyip");
    }
  } else {
    console.log("[Console] Please type in a valid command, add, remove, list, clear, record");
  }
};
