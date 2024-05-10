'use strict';
var FFA = require('./FFA'); // Base gamemode
var Cell = require('../entity/Cell');
var Food = require('../entity/Food');
var Virus = require('../entity/Virus');
var VirusFeed = require('../entity/Virus').prototype.feed;

function Blackhole() {
  FFA.apply(this, Array.prototype.slice.call(arguments));

  this.ID = 22;
  this.name = "Blackhole";
  this.specByLeaderboard = true;

  // Gamemode Specific Variables
  this.nodesMother = [];
  this.tickMother = 0;
  this.tickMotherS = 0;

  // Config
  this.motherCellMass = 14000;
  this.motherUpdateInterval = 5; // How many ticks it takes to update the mother cell (1 tick = 50 ms)
  this.motherSpawnInterval = 100; // How many ticks it takes to spawn another mother cell - Currently 5 seconds
  this.motherMinAmount = 1;
}

module.exports = Blackhole;
Blackhole.prototype = new FFA();

// Gamemode Specific Functions
Blackhole.prototype.updateMotherCells = function (gameServer) {
  for (var i in this.nodesMother) {
    var mother = this.nodesMother[i];

    // Checks
    mother.update(gameServer);
    mother.checkEat(gameServer);
  }
};

Blackhole.prototype.spawnMotherCell = function (gameServer) {
  // Checks if there are enough mother cells on the map
  if (this.nodesMother.length != 1) {
    // Spawns a mother cell

    var pos = {
      x: gameServer.config.borderRight / 2,
      y: gameServer.config.borderBottom / 2
    };
    // var pos =  gameServer.getRandomPosition();

    // Spawn if no cells are colliding
    var m = new MotherCell(gameServer.getWorld().getNextNodeId(), null, pos, this.motherCellMass);
    gameServer.addNode(m);
    console.log("Black Hole Spawned");
  }
};

// Override
Blackhole.prototype.onServerInit = function (gameServer) {
  // Called when the server starts
  gameServer.run = true;
  gameServer.lleaderboard = true;
  // Special virus mechanics
  Virus.prototype.feed = function (feeder, gameServer) {
    gameServer.removeNode(feeder);
    // Pushes the virus
    this.setAngle(feeder.getAngle()); // Set direction if the virus explodes
    this.moveEngineTicks = 5; // Amount of times to loop the movement function
    this.moveEngineSpeed = 30;

    var index = gameServer.movingNodes.indexOf(this);
    if (index == -1) {
      gameServer.movingNodes.push(this);
    }
  };

  // Override this
  gameServer.getRandomSpawn = gameServer.getRandomPosition;
};

Blackhole.prototype.onTick = function (gameServer) {
  // Mother Cell updates
  if (this.tickMother >= this.motherUpdateInterval) {
    this.updateMotherCells(gameServer);
    this.tickMother = 0;
  } else {
    this.tickMother++;
  }
  // Mother Cell Spawning
  if (this.tickMotherS >= this.motherSpawnInterval) {
    this.spawnMotherCell(gameServer);
    this.tickMotherS = 0;
  } else {
    this.tickMotherS++;
  }
};

Blackhole.prototype.onChange = function (gameServer) {
  // Remove all mother cells
  for (var i in this.nodesMother) {
    gameServer.removeNode(this.nodesMother[i]);
  }
  // Add back default functions
  Virus.prototype.feed = VirusFeed;
  gameServer.getRandomSpawn = require('../GameServer').prototype.getRandomSpawn;
};

// New cell type
function MotherCell() {
  // Temporary - Will be in its own file if Zeach decides to add this to vanilla
  Cell.apply(this, Array.prototype.slice.call(arguments));
  this.cellType = 2; // Copies virus cell
  this.color = {
    r: 10,
    g: 10,
    b: 10
  };
  this.spiked = 0;
  this.wobbly = 1;
}

MotherCell.prototype = new Cell(); // Base

MotherCell.prototype.getEatingRange = function () {
  return this.getSize() * .5;
};

MotherCell.prototype.update = function (gameServer) {
  // Add mass
  this.mass += .25;

  // Spawn food
  var maxFood = 30; // Max food spawned per tick
  var i = 0; // Food spawn counter
  while ((this.mass > gameServer.gameMode.motherCellMass) && (i < maxFood)) {
    // Only spawn if food cap hasn been reached
    if (gameServer.currentFood < gameServer.config.foodMaxAmount) {
      this.spawnFood(gameServer);
    }
    // Incrementers
    this.mass--;
    i++;
  }
};

MotherCell.prototype.checkEat = function (gameServer) {
  var safeMass = 500000;
  var r = this.getSize(); // The box area that the checked cell needs to be in to be considered eaten

  let nodes = gameServer.getWorld().getNodes();
  
  for (var i in nodes) {
    var check = nodes[i];
    if (typeof check != 'object') continue;
    // Calculations
    var len = r - (check.getSize() / 2) >> 0;
    if ((this.abs(this.position.x - check.position.x) < len) && (this.abs(this.position.y - check.position.y) < len)) {
      // A second, more precise check
      var xs = Math.pow(check.position.x - this.position.x, 2);
      var ys = Math.pow(check.position.y - this.position.y, 2);
      var dist = Math.sqrt(xs + ys);
      if (r > dist && dist > 100) {
        // Eats the cell
        gameServer.removeNode(check);
        // this.mass += check.mass;
      }
    }
  }
};

MotherCell.prototype.abs = function (n) {
  // Because Math.abs is slow
  return (n < 0) ? -n : n;
};

MotherCell.prototype.spawnFood = function (gameServer) {
  // Get starting position
  var angle = Math.random() * 6.28; // (Math.PI * 2) ??? Precision is not our greatest concern here
  var r = this.getSize();
  var pos = {
    x: this.position.x + (r * Math.sin(angle)),
    y: this.position.y + (r * Math.cos(angle))
  };

  // Spawn food
  var f = new Food(gameServer.getWorld().getNextNodeId(), null, pos, gameServer.config.foodMass, gameServer);
  f.setColor = {
    r: 10,
    b: 10,
    g: 10
  };

  gameServer.addNode(f);
  gameServer.currentFood++;

  // Move engine
  f.angle = angle;
  var dist = (Math.random() * (gameServer.config.borderBottom / 20)) + 60; // Random distance
  f.setMoveEngineData(dist, 20);

  gameServer.getWorld().setNodeAsMoving(f.getId(), f);
};

MotherCell.prototype.onConsume = Virus.prototype.onConsume; // Copies the virus prototype function

MotherCell.prototype.onAdd = function (gameServer) {
  gameServer.gameMode.nodesMother.push(this); // Temporary
};

MotherCell.prototype.onRemove = function (gameServer) {
  var index = gameServer.gameMode.nodesMother.indexOf(this);
  if (index != -1) {
    gameServer.gameMode.nodesMother.splice(index, 1);
  }
};

MotherCell.prototype.visibleCheck = function (box, centerPos) {
  // Checks if this cell is visible to the player
  var cellSize = (this.getSize() * 4);
  var lenX = cellSize + box.width >> 0; // Width of cell + width of the box (Int)
  var lenY = cellSize + box.height >> 0; // Height of cell + height of the box (Int)
  return (this.abs(this.position.x - centerPos.x) < lenX) && (this.abs(this.position.y - centerPos.y) < lenY);
};
