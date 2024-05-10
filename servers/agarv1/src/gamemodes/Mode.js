// todo seems a bit buggy, some times crashes the server silently

var Entity = require('../entity');

function Mode() {
  this.ID = -1;
  this.name = "Blank";
  this.decayMod = 1.0; // Modifier for decay rate (Multiplier)
  this.packetLB = 49; // Packet id for leaderboard packet (48 = Text List, 49 = List, 50 = Pie chart)
  this.haveTeams = false; // True = gamemode uses teams, false = gamemode doesnt use teams

  this.specByLeaderboard = false; // false = spectate from player list instead of leaderboard
}

module.exports = Mode;

// Override these

Mode.prototype.onServerInit = function (gameServer) {
  // Called when the server starts
  gameServer.run = true;

};

Mode.prototype.onTick = function (gameServer) {
  // Called on every game tick
};

Mode.prototype.onChange = function (gameServer) {
  // Called when someone changes the gamemode via console commands
};

Mode.prototype.onPlayerInit = function (player) {
  // Called after a player object is constructed
};

Mode.prototype.onPlayerSpawn = function (gameServer, player) {
  if (gameServer.nospawn[player.socket.remoteAddress] != true) {
    // Called when a player is spawned
    player.color = gameServer.getRandomColor(); // Random color
    gameServer.spawnPlayer(player);
    gameServer.config.playerSafeSpawn = 1;
  }
};

Mode.prototype.pressQ = function (gameServer, player) {
for (var i in gameServer.plugins) {
        if (gameServer.plugins[i].beforeq && gameServer.plugins[i].name && gameServer.plugins[i].author && gameServer.plugins[i].version) {
          if (!gameServer.plugins[i].beforeq(player)) return;
        }
      }

   if (player.spectate) {
      player.freeRoam = !player.freeRoam;
    }
  
};

Mode.prototype.pressW = function (gameServer, player) {

      gameServer.ejectMass(player);

};

Mode.prototype.pressSpace = function (gameServer, player) {
      gameServer.splitCells(player);
    
};

Mode.prototype.onCellAdd = function (cell) {
  // Called when a player cell is added
};

Mode.prototype.onCellRemove = function (cell) {
  // Called when a player cell is removed

};

Mode.prototype.onCellMove = function (x1, y1, cell) {
  // Called when a player cell is moved
};

Mode.prototype.updateLB = function (gameServer) {
  // Called when the leaderboard update function is called
};
