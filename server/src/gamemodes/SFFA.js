'use strict';
var Mode = require('./Mode');

function SFFA() {
  Mode.apply(this, Array.prototype.slice.call(arguments));

  this.ID = 7;
  this.name = "ShrinkingFFA";
  this.packetLB = 48;

  // Config (1 tick = 1000 ms)
  this.prepTime = 5; // Amount of ticks after the server fills up to wait until starting the game
  this.endTime = 15; // Amount of ticks after someone wins to restart the game
  this.autoFill = false;
  this.autoFillPlayers = 1;
  this.dcTime = 0;

  // Gamemode Specific Variables
  this.gamePhase = 0; // 0 = Waiting for players, 1 = Prepare to start, 2 = Game in progress, 3 = End
  this.contenders = [];
  this.stime = 60;
  this.maxContenders = 12;
  this.borderDec = 150;

  this.winner;
  this.timer;
  this.timeLimit = 3600; // in seconds
}

module.exports = SFFA;
SFFA.prototype = new Mode();

// Gamemode Specific Functions

SFFA.prototype.startGamePrep = function (gameServer) {
  this.gamePhase = 1;
  this.timer = this.prepTime; // 10 seconds
};

SFFA.prototype.startGame = function (gameServer) {
  gameServer.running = true;
  this.gamePhase = 2;
  this.getSpectate(); // Gets a random person to spectate
  gameServer.config.playerDisconnectTime = this.dcTime; // Reset config
};

SFFA.prototype.endGame = function (gameServer) {
  this.winner = this.contenders[0];
  this.gamePhase = 3;
  this.timer = this.endTime; // 30 Seconds
};

SFFA.prototype.endGameTimeout = function (gameServer) {
  gameServer.running = false;
  this.gamePhase = 4;
  this.timer = this.endTime; // 30 Seconds
};
SFFA.prototype.shrink = function (gameServer) {

  var config = gameServer.config;
  config.borderLeft += this.borderDec;
  config.borderRight -= this.borderDec;
  config.borderTop += this.borderDec;
  config.borderBottom -= this.borderDec;

   gameServer.getWorld().getNodes().forEach((node)=>{

    if ((!node) || (node.getType() == 0)) {
      return;
    }

    // Move
    if (node.position.x < config.borderLeft) {
      gameServer.removeNode(node);
    } else if (node.position.x > config.borderRight) {
      gameServer.removeNode(node);
    } else if (node.position.y < config.borderTop) {
      gameServer.removeNode(node);
    } else if (node.position.y > config.borderBottom) {
      gameServer.removeNode(node);
    }
  });

};

SFFA.prototype.fillBots = function (gameServer) {
  // Fills the server with bots if there arent enough players
  var fill = this.maxContenders - this.contenders.length;
  for (var i = 0; i < fill; i++) {
    gameServer.bots.addBot();
  }
};

SFFA.prototype.getSpectate = function () {
  // Finds a random person to spectate
  var index = Math.floor(Math.random() * this.contenders.length);
  this.rankOne = this.contenders[index];
};

SFFA.prototype.prepare = function (gameServer) {
  // Remove all cells
  gameServer.config.borderLeft = 0;
  gameServer.config.borderRight = 7500;
  gameServer.config.borderTop = 0;
  gameServer.config.borderBottom = 7500;

   gameServer.getWorld().getNodes().forEach((node)=>{
    if (!node) return;
    gameServer.removeNode(node);
    
  })

  gameServer.bots.loadNames();

  // Pauses the server
  gameServer.running = false;
  this.gamePhase = 0;

  // Get config values
  if (gameServer.config.tourneyAutoFill > 0) {
    this.timer = gameServer.config.tourneyAutoFill;
    this.autoFill = true;
    this.autoFillPlayers = gameServer.config.tourneyAutoFillPlayers;
  }
  // Handles disconnections
  this.dcTime = gameServer.config.playerDisconnectTime;
  gameServer.config.playerDisconnectTime = 0;
  gameServer.config.playerMinMassDecay = gameServer.config.playerStartMass;

  this.prepTime = gameServer.config.tourneyPrepTime;
  this.endTime = gameServer.config.tourneyEndTime;
  this.maxContenders = gameServer.config.tourneyMaxPlayers;

  // Time limit
  this.timeLimit = gameServer.config.tourneyTimeLimit * 60; // in seconds
};

SFFA.prototype.onPlayerDeath = function (gameServer) {
  // Nothing
};

SFFA.prototype.formatTime = function (time) {
  if (time < 0) {
    return "0:00";
  }
  // Format
  var min = Math.floor(this.timeLimit / 60);
  var sec = this.timeLimit % 60;
  sec = (sec > 9) ? sec : "0" + sec.toString();
  return min + ":" + sec;
};
SFFA.prototype.formatsTime = function (time) {
  if (time < 0) {
    return "0:00";
  }
  // Format
  var min = Math.floor(this.stime / 60);
  var sec = this.stime % 60;
  sec = (sec > 9) ? sec : "0" + sec.toString();
  return min + ":" + sec;
};

// Override

SFFA.prototype.onServerInit = function (gameServer) {
  gameServer.overideauto = true;
  gameServer.config.borderLeft = 0;
  gameServer.config.borderRight = 6400;
  gameServer.config.borderTop = 0;
  gameServer.config.borderBottom = 6400;
  this.prepare(gameServer);
};

SFFA.prototype.onPlayerSpawn = function (gameServer, player) {
  if (gameServer.nospawn[player.socket.remoteAddress] != true) {
    // Only spawn players if the game hasnt started yet

    player.color = gameServer.getRandomColor(); // Random color
    this.contenders.push(player); // Add to contenders list
    gameServer.spawnPlayer(player);

    if (this.contenders.length == this.maxContenders) {
      // Start the game once there is enough players
      this.startGamePrep(gameServer);
    }
  }
};

SFFA.prototype.onCellRemove = function (cell) {
  var owner = cell.owner,
    human_just_died = false;

  if (owner.cells.length <= 0) {
    // Remove from contenders list
    var index = this.contenders.indexOf(owner);
    if (index != -1) {
      if ('_socket' in this.contenders[index].socket) {
        human_just_died = true;
      }
    }

    // Victory conditions
    var humans = 0;
    for (var i = 0; i < this.contenders.length; i++) {
      if ('_socket' in this.contenders[i].socket) {
        humans++;
      }
    }

    // the game is over if:
    // 1) there is only 1 player left, OR
    // 2) all the humans are dead, OR
    // 3) the last-but-one human just died
    if (humans == 0 && this.gamePhase == 2) {
      this.endGame(cell.owner.gameServer);
    } else {
      // Do stuff
      this.onPlayerDeath(cell.owner.gameServer);
    }
  }
};

SFFA.prototype.updateLB = function (gameServer) {
  var lb = gameServer.leaderboard;

  switch (this.gamePhase) {
    case 0:
      lb[0] = "Waiting for";
      lb[1] = "players: ";
      lb[2] = this.contenders.length + "/" + this.maxContenders;
      if (this.autoFill) {
        if (this.timer <= 0) {
          this.fillBots(gameServer);
        } else if (this.contenders.length >= this.autoFillPlayers) {
          this.timer--;
        }
      }
      break;
    case 1:
      lb[0] = "Game starting in";
      lb[1] = this.timer.toString();
      lb[2] = "Good luck!";
      if (this.timer <= 0) {
        // Reset the game
        this.startGame(gameServer);
      } else {
        this.timer--;
      }

      break;
    case 2:
      lb[0] = "Players Alive";
      lb[1] = this.contenders.length + " ";
      lb[2] = "Time Limit:";
      lb[3] = this.formatTime(this.timeLimit);
      lb[4] = "Map Size:";
      lb[5] = (gameServer.config.borderRight - gameServer.config.borderLeft) + "," + (gameServer.config.borderBottom - gameServer.config.borderTop);
      lb[6] = "Shrinking in";
      lb[7] = this.formatsTime(this.stime);
      if (this.timeLimit < 0) {
        // Timed out
        this.endGameTimeout(gameServer);
      } else {
        this.timeLimit--;
      }
      if (this.stime <= 0) {
        this.shrink(gameServer);
        this.stime = 60;
      } else {
        this.stime--
      }
      break;
    case 3:
      lb[0] = "All humans died";
      lb[1] = "Restarting Game";
      lb[2] = "---------------";
      if (this.timer <= 0) {
        // Reset the game
        this.onServerInit(gameServer);
        // Respawn starting food
        gameServer.startingFood();
      } else {
        lb[3] = "Game restarting in";
        lb[4] = this.timer.toString();
        this.timer--;
      }
      break;
    case 4:
      lb[0] = "Time Limit";
      lb[1] = "Reached!";
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
    default:
      break;
  }
};
