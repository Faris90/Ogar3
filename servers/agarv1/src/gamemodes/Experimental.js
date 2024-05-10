'use strict';
var FFA = require('./FFA'); // Base gamemode
var Cell = require('../entity/Cell');
var Food = require('../entity/Food');
var Virus = require('../entity/Virus');
var VirusFeed = require('../entity/Virus').prototype.feed;
var MotherCell = require('../entity/MotherCell');

function Experimental() {
  FFA.apply(this, Array.prototype.slice.call(arguments));

  this.ID = 2;
  this.name = "Experimental";
  this.specByLeaderboard = true;

  // Gamemode Specific Variables
  this.nodesMother = [];
  this.tickMother = 0;
  this.tickMotherS = 0;

  // Config
  this.motherCellMass = 222;
  this.motherSpawnInterval = 100; // How many ticks it takes to spawn another mother cell - Currently 5 seconds

}

module.exports = Experimental;
Experimental.prototype = new FFA();

// Gamemode Specific Functions


Experimental.prototype.spawnMotherCell = function (gameServer) {
  // Checks if there are enough mother cells on the map
  if (gameServer._nodesMother.length < this.motherMinAmount) {
    // Spawns a mother cell
    var pos = gameServer.getRandomPosition();

    // Check for players
    let nodesPlayer = gameServer.getPlayerNodes();
    for (var i = 0; i < nodesPlayer.length; i++) {
      var check = nodesPlayer[i];
if (!check) {
  continue;
}


      var r = check.getSize(); // Radius of checking player cell

      // Collision box
      var topY = check.position.y - r;
      var bottomY = check.position.y + r;
      var leftX = check.position.x - r;
      var rightX = check.position.x + r;

      // Check for collisions
      if (pos.y > bottomY) {
        continue;
      }

      if (pos.y < topY) {
        continue;
      }

      if (pos.x > rightX) {
        continue;
      }

      if (pos.x < leftX) {
        continue;
      }

      // Collided
      return;
    }

    // Spawn if no cells are colliding
    var m = new MotherCell(gameServer.getWorld().getNextNodeId(), null, pos, this.motherCellMass);
    gameServer.addNode(m);
  }
};

// Override

Experimental.prototype.onServerInit = function (gameServer) {
  // Called when the server starts
  gameServer.running = true;
  var mapSize = gameServer.config.borderLeft + gameServer.config.borderRight +
    gameServer.config.borderTop + gameServer.config.borderRight;

  this.motherMinAmount = Math.ceil(mapSize / 3194.382825); // 7 mother cells for agar.io map size
  gameServer.lleaderboard = true;
  // Special virus mechanics
  Virus.prototype.feed = function (feeder, gameServer) {
    gameServer.removeNode(feeder);
    // Pushes the virus
    this.setAngle(feeder.getAngle()); // Set direction if the virus explodes
    this.moveEngineTicks = 10; // Amount of times to loop the movement function
    this.moveEngineSpeed = 28;

    var index = gameServer.getWorld().getNodes('moving').toArray().indexOf(this);
    if (index == -1) {
      gameServer.world.setNode(this.getId(),this,"moving");
    }
  };

  // Override this
  // TODO CRITICAL VERY BAD
  gameServer.getRandomSpawn = gameServer.getRandomPosition;
};

Experimental.prototype.onTick = function (gameServer) {

  // Mother Cell Spawning
  if (this.tickMotherS >= this.motherSpawnInterval) {
    this.spawnMotherCell(gameServer);
    this.tickMotherS = 0;
  } else {
    this.tickMotherS++;
  }
};

Experimental.prototype.onChange = function (gameServer) {
  // Remove all mother cells
  for (var i in gameServer._nodesMother) {
    gameServer.removeNode(gameServer._nodesMother[i]);
  }
  // Add back default functions
  Virus.prototype.feed = VirusFeed;

  // TODO CRITICAL VERY BAD
  gameServer.getRandomSpawn = require('../GameServer').prototype.getRandomSpawn;
};
