'use strict';
var FFA = require('./FFA'); // Base gamemode
var Cell = require('../entity/Cell');
var MotherCell = require('../entity/MotherCell');
var MovingVirus = require('../entity/MovingVirus');
var StickyCell = require('../entity/StickyCell');
var Beacon = require('../entity/Beacon');

function Experimental2() {
  FFA.apply(this, Array.prototype.slice.call(arguments));

  this.ID = 8;
  this.name = "Experimental 2";
  this.specByLeaderboard = true;

  // Gamemode Specific Variables
  this.tickMother = 0;
  this.tickMotherS = 0;

  // Config
  this.motherCellMass = 200;
  this.motherCellMaxMass = 400;
  this.motherSpawnInterval = 100; // How many ticks it takes to spawn another mother cell - Currently 5 seconds
  this.motherMinAmount = 5;

  this.movingVirusMass = 100;
  this.movingVirusMinAmount = 10;

  this.stickyMass = 75;
  this.stickyMinAmount = 3;
  this.stickyUpdateInterval = 1;
  this.tickSticky = 0;

  this.beaconMass = 500;
}

module.exports = Experimental2;
Experimental2.prototype = new FFA();

// Gamemode Specific Functions




Experimental2.prototype.spawnMotherCell = function (gameServer) {
  // Checks if there are enough mother cells on the map
  if (gameServer._nodesMother.length < this.motherMinAmount) {
    // Spawns a mother cell
    var pos = gameServer.getRandomPosition();

    // Check for players
    let nodesPlayer = gameServer.getPlayerNodes();
    for (var i = 0; i < nodesPlayer.length; i++) {
      var check = nodesPlayer[i];

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

Experimental2.prototype.spawnMovingVirus = function (gameServer) {
  // Checks if there are enough moving viruses on the map
  if (gameServer.movingVirusCount < this.movingVirusMinAmount) {
    // Spawns a mother cell
    var pos = gameServer.getRandomPosition();

    // Check for players
    let nodesPlayer = gameServer.getPlayerNodes();
    for (var i = 0; i < nodesPlayer.length; i++) {
      var check = nodesPlayer[i];

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
    var m = new MovingVirus(gameServer.getWorld().getNextNodeId(),
      null,
      pos,
      this.movingVirusMass + Math.floor(50 * Math.random())
    );
    
    gameServer.addNode(m, 'moving');
  }
};

Experimental2.prototype.spawnStickyCell = function (gameServer) {
  // Checks if there are enough mother cells on the map
  if (gameServer._nodesSticky.length < this.stickyMinAmount) {
    // Spawns a mother cell
    var pos = gameServer.getRandomPosition();

    // Check for players
    let nodesPlayer = gameServer.getPlayerNodes();
    for (var i = 0; i < nodesPlayer.length; i++) {
      var check = nodesPlayer[i];

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
    var m = new StickyCell(gameServer.getWorld().getNextNodeId(), null, pos, this.stickyMass);
    //gameServer.movingNodes.push(m);
    gameServer.addNode(m, 'moving');
  }
};

// Override

Experimental2.prototype.onServerInit = function (gameServer) {
  // Called when the server starts
  gameServer.run = true;
  gameServer.lleaderboard = true;

  // Override this
  gameServer.getRandomSpawn = gameServer.getRandomPosition;
};

Experimental2.prototype.onTick = function (gameServer) {
  // Create a beacon if one doesn't exist
  if (!this.beacon) {
    this.beacon = new Beacon(gameServer.getWorld().getNextNodeId(),
      null,
      gameServer.getRandomPosition(),
      this.beaconMass);
    gameServer.addNode(this.beacon);
  }



  // Mother Cell Spawning
  if (this.tickMotherS >= this.motherSpawnInterval) {
    this.spawnMotherCell(gameServer);
    this.spawnMovingVirus(gameServer);
    this.spawnStickyCell(gameServer);
    this.tickMotherS = 0;
  } else {
    this.tickMotherS++;
  }
};

Experimental2.prototype.onChange = function (gameServer) {
  // Remove all mother cells
  for (var i in gameServer._nodesMother) {
    gameServer.removeNode(gameServer._nodesMother);
  }
  // Add back default functions
  gameServer.getRandomSpawn = require('../GameServer').prototype.getRandomSpawn;
};
