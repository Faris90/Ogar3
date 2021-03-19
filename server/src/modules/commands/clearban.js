var fs = require("fs");

module.exports = function (gameServer, split) {
  console.log("[Console] Cleared " + gameServer.banned.length + " IP's");
  gameServer.banned = [];
  if (gameServer.config.autobanrecord == 1) {


    fs.writeFileSync('./banned.txt', "");
  }
};
