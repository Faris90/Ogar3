module.exports = function (gameServer, split) {
  console.log("[Console] Current banned IPs (" + gameServer.banned.length + ")");
  for (var i in gameServer.banned) {
    console.log(gameServer.banned[i]);
  }
};
