module.exports = function (gameServer, split) {
  console.log("[Console] Current UniBanned IPs (" + gameServer.uniban.length + ")");
  for (var i in gameServer.uniban) {
    console.log(gameServer.uniban[i]);
  }
};
