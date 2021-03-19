'use strict';
var Cell = require('./Cell');
var Virus = require('./Virus');
var Food = require('./Food');

function MotherCell() { // Temporary - Will be in its own file if Zeach decides to add this to vanilla
  Cell.apply(this, Array.prototype.slice.call(arguments));

  this.cellType = 2; // Copies virus cell
  this.color = {
    r: 190 + Math.floor(30 * Math.random()),
    g: 70 + Math.floor(30 * Math.random()),
    b: 85 + Math.floor(30 * Math.random())
  };
  this.spiked = 1;
  this.mass = 222;
}

module.exports = MotherCell;
MotherCell.prototype = new Cell(); // Base

MotherCell.prototype.getEatingRange = function () {
  return this.getSize() * 0.5;
};

MotherCell.prototype.update = function(gameServer) {
    if (Math.random() * 100 > 97) {
        var maxFood = Math.random() * 2; // Max food spawned per tick
        var i = 0; // Food spawn counter
        while (i < maxFood) {
            // Only spawn if food cap hasn't been reached
            if (gameServer.currentFood < gameServer.config.foodMaxAmount * 100) {
                this.spawnFood(gameServer);
            }

            // Increment
            i++;
        }
    }
    if (gameServer.config.motherCellMassProtection == 1 && this.mass > gameServer.config.motherCellMaxMass) this.mass -= 20
    if (this.mass > 222) {
        // Always spawn food if the mother cell is larger than 222
        var cellSize = gameServer.config.foodMass;
        var remaining = this.mass - 222;
        var maxAmount = Math.min(Math.floor(remaining / cellSize), 2);
        for (var i = 0; i < maxAmount; i++) {
            this.spawnFood(gameServer);
            this.mass -= cellSize;
        }
    }
};

MotherCell.prototype.checkEat = function (gameServer) {
  var safeMass = this.mass * .9;
  var r = this.getSize(); // The box area that the checked cell needs to be in to be considered eaten

  // Loop for potential prey
 
  gameServer.getWorld().getNodes('player').forEach((check)=> {
  if (check.quadrant != this.quadrant || !check) return;

    if (check.mass > safeMass) {
      // Too big to be consumed
      return;
    }

    // Calculations
    var len = r - (check.getSize() / 2) >> 0;
    if ((this.abs(this.position.x - check.position.x) < len) && (this.abs(this.position.y - check.position.y) < len)) {
      // A second, more precise check
      var xs = Math.pow(check.position.x - this.position.x, 2);
      var ys = Math.pow(check.position.y - this.position.y, 2);
      var dist = Math.sqrt(xs + ys);

      if (r > dist) {
        // Eats the cell
        gameServer.removeNode(check);
        this.mass += check.mass;
      }
    }
  });
  gameServer.getWorld().getNodes('moving').forEach((check)=> {
if (check.quadrant != this.quadrant || !check) return;
///    	if ((check.getType() == 1) || (check.mass > safeMass)) {
///            // Too big to be consumed/ No player cells
    if ((check.getType() == 0) || (check.getType() == 1) || (check.mass > safeMass)) {
      // Too big to be consumed / No player cells / No food cells
      return;
    }

    // Calculations
    var len = r >> 0;
    if ((this.abs(this.position.x - check.position.x) < len) && (this.abs(this.position.y - check.position.y) < len)) {
///
      // A second, more precise check
      var xs = Math.pow(check.position.x - this.position.x, 2);
      var ys = Math.pow(check.position.y - this.position.y, 2);
      var dist = Math.sqrt(xs + ys);
      if (r > dist) {
///
        // Eat the cell
        gameServer.removeNode(check);
       this.mass += check.mass;
      }
    }
  });
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
  f.setColor(gameServer.getRandomColor());

  gameServer.addNode(f);
  gameServer.currentFood++;

  // Move engine
  f.angle = angle;
  var dist = (Math.random() * 8) + 8; // Random distance
  f.setMoveEngineData(dist, 20, 0.85);

  gameServer.getWorld().setNodeAsMoving(f.getId(), f);
};

MotherCell.prototype.onConsume = Virus.prototype.onConsume; // Copies the virus prototype function

MotherCell.prototype.onAdd = function (gameServer) {
  gameServer._nodesMother.push(this); // Temporary
};

MotherCell.prototype.onRemove = function (gameServer) {
  var index = gameServer._nodesMother.indexOf(this);
  if (index != -1) {
    gameServer._nodesMother.splice(index, 1);
  }
};

MotherCell.prototype.visibleCheck = function (box, centerPos) {
  // Checks if this cell is visible to the player
  var cellSize = this.getSize();
  var lenX = cellSize + box.width >> 0; // Width of cell + width of the box (Int)
  var lenY = cellSize + box.height >> 0; // Height of cell + height of the box (Int)

  return (this.abs(this.position.x - centerPos.x) < lenX) && (this.abs(this.position.y - centerPos.y) < lenY);
};
