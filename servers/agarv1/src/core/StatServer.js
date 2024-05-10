'use strict';
var http = require('http');

module.exports = class StatServer {
  constructor(gameServer, port, serverStatsUpdateTime, ismaster) {
    this.gameServer = gameServer;
    this.port = port;
    this.serverStatsUpdateTime = (serverStatsUpdateTime) ? serverStatsUpdateTime : 1;
    this.stats = "";
    this.interveral = undefined;
this.isMaster = ismaster;
  }

  start() {
    // Do not start the server if the port is negative
    if (this.port < 1 || this.gameServer.config.vps == 1 || !this.isMaster) {
      return;
    }
    // init stats
    this.update();

    // Show stats
    this.httpServer = http.createServer(function (req, res) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.writeHead(200);
      res.end(this.getStats());
    }.bind(this));

    this.httpServer.listen(this.port, function () {
      // Stats server
      console.log("[Game] Loaded stats server on port " + this.port);
      setInterval(this.update.bind(this), this.serverStatsUpdateTime * 1000);
    }.bind(this));
  }

  stop() {
    if (this.interveral) {
      clearInterval(this.interveral);
    }
    if (this.httpServer)
    this.httpServer.close()
  }

  update() {
    var players = 0;
    let clients = this.gameServer.getClients();
    clients.forEach(function (client) {
      if (client.playerTracker && client.playerTracker.cells.length > 0)
        players++
    });

    var s = {
      'current_players': clients.length,
      'alive': players,
      'spectators': clients.length - players,
      'max_players': this.gameServer.config.serverMaxConnections,
      'gamemode': this.gameServer.gameMode.name,
      'start_time': this.gameServer.startTime,
      'Server_uid': this.gameServer.uid
    };
    this.stats = JSON.stringify(s);
  }

  getStats() {
    return this.stats;
  }
};
