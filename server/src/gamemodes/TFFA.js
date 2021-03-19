'use strict';
var Mode = require('./Mode');

function TFFA() {
  Mode.apply(this, Array.prototype.slice.call(arguments));

  this.ID = 3;
  this.name = "Timed Free For All";
  this.packetLB = 48;

  // Config (1 tick = second)
  this.endTime = 15; // Amount of seconds after someone wins to restart the game

  // Gamemode Specific Variables
  this.gamePhase = 0; // 0 = Game Paused, 1 = Game stopped, 2 = Game in progress, 3 = Time limit reached
  this.contenders = [];
  this.maxContenders = 0;

  this.winner;
  this.timer;
  this.timeLimit = 3600; // in seconds
}

module.exports = TFFA;
TFFA.prototype = new Mode();

// Gamemode Specific Functions

TFFA.prototype.startGame = function (gameServer) {
  gameServer.running = true;
  this.gamePhase = 2;
  this.getSpectate(); // Gets a random person to spectate
};

TFFA.prototype.endGame = function (gameServer) {
  this.winner = this.contenders[0];
  this.gamePhase = 1;
  this.timer = this.endTime; // 30 Seconds
};

TFFA.prototype.endGameTimeout = function (gameServer) {
  gameServer.running = false;
  this.gamePhase = 3;
  this.timer = this.endTime; // 30 Seconds
};

TFFA.prototype.getSpectate = function () {
  // Finds a random person to spectate
  var index = Math.floor(Math.random() * this.contenders.length);
  this.rankOne = this.contenders[index];
};

TFFA.prototype.prepare = function (gameServer) {
  // Remove all cells
gameServer.getWorld().getNodes().forEach((node)=>{
    if (!node) return;
    gameServer.removeNode(node);
    
  })
 

  gameServer.bots.loadNames();

  // Pauses the server
  gameServer.running = false;
  this.gamePhase = 0;

  // Handles disconnections
  gameServer.config.playerMinMassDecay = gameServer.config.playerStartMass;

  this.endTime = gameServer.config.ffaTimeLimit;
  this.maxContenders = gameServer.config.serverMaxConnections;

  // Time limit
  this.timeLimit = gameServer.config.ffaTimeLimit * 60; // in seconds
};

TFFA.prototype.onPlayerDeath = function (gameServer) {
  // Nothing
};

TFFA.prototype.formatTime = function (time) {
  if (time < 0) {
    return "0:00";
  }
  // Format
  var min = Math.floor(this.timeLimit / 60);
  var sec = this.timeLimit % 60;
  sec = (sec > 9) ? sec : "0" + sec.toString();
  return min + ":" + sec;
};

// Override

TFFA.prototype.onServerInit = function (gameServer) {
  gameServer.overideauto = true;
  this.prepare(gameServer);
};

TFFA.prototype.onPlayerSpawn = function (gameServer, player) {
  if (gameServer.nospawn[player.socket.remoteAddress] != true) {
    // Random color
    player.color = gameServer.getRandomColor();

    // Set up variables
    var pos, startMass;

    // Check if there are ejected mass in the world.
    let nodesEjected = gameServer.getEjectedNodes();
    if (nodesEjected.length > 0) {
      var index = Math.floor(Math.random() * 100) + 1;
      if (index <= gameServer.config.ejectSpawnPlayer) {
        // Get ejected cell
        var index = Math.floor(Math.random() * nodesEjected.length);
        var e = nodesEjected[index];

        // Remove ejected mass
        gameServer.removeNode(e);

        // Inherit
        pos = {
          x: e.position.x,
          y: e.position.y
        };
        startMass = e.mass;

        var color = e.getColor();
        player.setColor({
          'r': color.r,
          'g': color.g,
          'b': color.b
        });
      }
    }
    //Add player to Contender list
    this.contenders.push(player);
    // Spawn player
    gameServer.spawnPlayer(player, pos, startMass);

    if (this.contenders.length > 0) {
      // Start the game once there is at least 1 player
      this.startGame(gameServer);
    }
  }
};

TFFA.prototype.onCellRemove = function (cell) {
  var owner = cell.owner,
    human_just_died = false;

  if (owner.cells.length <= 0) {
    // Remove from contenders list
    var index = this.contenders.indexOf(owner);
    if (index != -1) {
      if ('_socket' in this.contenders[index].socket) {
        human_just_died = true;
      }
      this.contenders.splice(index, 1);
    }
    this.onPlayerDeath(cell.owner.gameServer);
  }
};

TFFA.prototype.updateLB = function (gameServer) {
  var lb = gameServer.leaderboard;

  switch (this.gamePhase) {
    case 0:
      lb[0] = "Waiting for";
      lb[1] = "players...";
      break;
    case 1:
      if (this.timer <= 0) {
        // Reset the game
        this.onServerInit(gameServer);
        // Respawn starting food
        gameServer.startingFood();
      } else {
        lb[2] = "Game restarting in: ";
        lb[3] = this.timer.toString();
        this.timer--;
      }
      break;
    case 2:
      lb[0] = "Players Remaining";
      lb[1] = "Alive:";
      lb[2] = this.contenders.length + "/" + this.maxContenders;
      lb[3] = "Time Limit:";
      lb[4] = this.formatTime(this.timeLimit);
      if (this.timeLimit < 0) {
        // Timed out
        this.endGameTimeout(gameServer);
      } else {
        this.timeLimit--;
      }
      break;
    case 3:
      lb[0] = "Time Limit";
      lb[1] = "Has Been Reached!";
      if (this.timer <= 0) {
        // Reset the game
        this.onServerInit(gameServer);
        // Respawn starting food
        gameServer.startingFood();
      } else {
        lb[2] = "Game restarting in";
        lb[3] = this.timer.toString();
        this.timer--;
      }
      break;
    default:
      break;
  }
};
