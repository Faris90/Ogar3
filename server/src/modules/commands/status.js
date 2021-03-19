module.exports = function (gameServer, split) {
  // Get amount of humans/bots
  var humans = 0,
    bots = 0;
  for (var i = 0; i < gameServer.clients.length; i++) {
    if ('_socket' in gameServer.clients[i]) {
      humans++;
    } else {
      bots++;
    }
  }
  //
  console.log("[Console] Connected players: " + gameServer.clients.length + "/" + gameServer.config.serverMaxConnections);
  console.log("[Console] Players: " + humans + " Bots: " + bots);
  console.log("[Console] Server has been running for " + process.uptime() + " seconds.");
  console.log("[Console] Current memory usage: " + process.memoryUsage().heapUsed / 1000 + "/" + process.memoryUsage().heapTotal / 1000 + " kb");
  console.log("[Console] Current game mode: " + gameServer.gameMode.name);
};
