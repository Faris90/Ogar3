var fs = require("fs");

module.exports = function (gameServer) {
  gameServer.configService.load();
  gameServer.reloadClientPacket();
  console.log("[Console] Reloaded the config files successfully");
};
