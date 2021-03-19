'use strict';
/*
Proverbs 20:18:
   Bread obtained by falsehood is sweet to a man, But afterward his mouth will be filled with gravel.

We worked really hard for this project. Although we dont care if you enhance it and publish, we would care
if you copy it and claim our work as your own. Although it might feel good, to take the credit, you would ultimatly
regret it. But please feel free to change the files and publish putting your name up as well as ours.
We will also not get into legalities. but please dont take advantage that we dont use
legalities. Instead, treat us with respect like we treat you. 

Sincerely
The AJS Dev Team.

*/
var PlayerTracker = require('../core/PlayerTracker');

module.exports = class MinionPlayer extends PlayerTracker {
  constructor(gameServer, socket, owner) {
    super(gameServer, socket);
    // PlayerTracker.apply(this, Array.prototype.slice.call(arguments));
    this.color = gameServer.getRandomColor();

    // AI only
    this.gameState = 0;
    this.path = [];
    this.owner = owner
    this.isBot = true;
    this.predators = []; // List of cells that can eat this bot
    this.threats = []; // List of cells that can eat this bot but are too far away
    this.prey = []; // List of cells that can be eaten by this bot
    this.food = [];
    this.foodImportant = []; // Not used - Bots will attempt to eat this regardless of nearby prey/predators
    this.virus = []; // List of viruses
    this.rbuffer = 10;
    this.juke = false;
    this.updateIn = (Math.random() * 12) >> 0;

    this.target;
    this.targetVirus; // Virus used to shoot into the target

    this.ejectMass = 0; // Amount of times to eject mass
    this.oldPos = {
      x: 0,
      y: 0
    };

  }

// module.exports = MinionPlayer;
// MinionPlayer.prototype = new PlayerTracker();

// Functions

  getLowestCell() {
    // Gets the cell with the lowest mass
    if (this.cells.length <= 0) {
      return null; // Error!
    }

    // Starting cell
    var lowest = this.cells[0];
    for (let i = 1; i < this.cells.length; i++) {
      if (lowest.mass > this.cells[i].mass) {
        lowest = this.cells[i];
      }
    }
    return lowest;
  };

// Don't override, testing to use more accurate way.
  /*
   updateSightRange() { // For view distance
   var range = 1000; // Base sight range

   if (this.cells[0]) {
   range += this.cells[0].getSize() * 2.5;
   }

   this.sightRangeX = range;
   this.sightRangeY = range;
   }; */

  update() { // Overrides the update function from player tracker
  setTimeout(function() {
    // Remove nodes from visible nodes if possible
   for (var i = 0; i < this.nodeDestroyQueue.length; i++) {
       var index = this.visibleNodes.indexOf(this.nodeDestroyQueue[i]);
      if (index > -1) {
        this.visibleNodes.splice(index, 1);
       }
    }

    // Respawn if bot is dead
    if (this.cells.length <= 0) {
      this.gameServer.gameMode.onPlayerSpawn(this.gameServer, this);
      if (this.cells.length == 0) {
        // If the bot cannot spawn any cells, then disconnect it
        this.socket.close();
        return;
      }
    }
    if (!this.owner || this.owner.disconnect > -1 || this.owner.minioncontrol == false || this.gameServer.destroym) {
      this.socket.close();
      return;
    }


    // Update
    if ((this.tickViewBox <= 0) && (this.gameServer.running)) {
      this.visibleNodes = this.calcViewBox();
      if (this.rbuffer <= 0) {
      this.tickViewBox = this.gameServer.config.minionupdate;
      } else {
        this.tickViewBox = this.updateIn;
        this.rbuffer--;
      }
    } else {
      this.tickViewBox--;
      return;
    }

    // Calc predators/prey
    var cell = this.getLowestCell();
    if (cell) {
      var r = cell.getSize();
    } else {
      var r = 0;
    }
    this.clearLists();

    // Ignores targeting cells below this mass
    var ignoreMass = cell.mass / 5;

    // Loop
    for (var i in this.visibleNodes) {
      var check = this.visibleNodes[i];

      // Cannot target itself
      if ((!check) || (cell.owner == check.owner)) {
        continue;
      }

      var t = check.getType();
      switch (t) {
        case 0:
          // Cannot target teammates
          if (this.gameServer.gameMode.haveTeams) {
            if (check.owner.team == this.team) {
              continue;
            }
          }

          // Check for danger
          if (check.mass > (cell.mass * 1.33) && check.owner.mouse != this.owner.mouse) {
            // Predator
            var dist = this.getDist(cell, check) - (r + check.getSize());
            if (dist < 300) {
              this.predators.push(check);
              if ((this.cells.length == 1) && (dist < 0)) {
                this.juke = true;
              }
            }
            this.threats.push(check);
          }
          break;
        default:
          break;
      }
    }

    // Get gamestate
    var newState = this.getState(cell);
    if ((newState != this.gameState)) {
      // Clear target
      this.target = null;
    }
    this.gameState = newState;

    // Action
    this.decide(cell);

    this.nodeDestroyQueue = []; // Empty
}.bind(this), 0);
  };

// Custom

  clearLists() {
    this.predators = [];
    this.threats = [];
    this.prey = [];
    this.food = [];
    this.virus = [];
    this.juke = false;
  };

  getState(cell) {
    

    // Check for predators
    if (this.predators.length <= 0) {
     
        return 0;
      
    } else {
        // Run
        return 2;
      }
    

    // Bot wanders by default
    return 0;
  };

  decide(cell) {
    // The bot decides what to do based on gamestate

    switch (this.gameState) {
      case 0: // Wander

        this.mouse = this.owner.mouse;


        break;
      case 2: // Run from (potential) predators
        if (this.gameServer.config.minionavoid == 1) {
          var avoid = this.combineVectors(this.predators);
          //console.log("[Bot] "+cell.getName()+": Fleeing from "+avoid.getName());

          // Find angle of vector between cell and predator
          var deltaY = avoid.y - cell.position.y;
          var deltaX = avoid.x - cell.position.x;
          var angle = Math.atan2(deltaX, deltaY);

          // Now reverse the angle
          angle = this.reverseAngle(angle);

          // Direction to move
          var x1 = cell.position.x + (500 * Math.sin(angle));
          var y1 = cell.position.y + (500 * Math.cos(angle));

          this.mouse = {
            x: x1,
            y: y1
          };

          // Cheating
          if (cell.mass < 250) {
            cell.mass += 1;
          }

          if (this.juke) {
            // Juking
            this.gameServer.splitCells(this);
          }
        } else {
          this.mouse = this.owner.mouse;
        }
        break;
      default:
this.mouse = this.owner.mouse;
        break;
    }

    // Recombining
    if (this.cells.length > 1) {
      var r = 0;
      // Get amount of cells that can merge
      for (var i in this.cells) {
        if (this.cells[i].shouldRecombine) {
          r++;
        }
      }
      // Merge
      if (r >= 2) {
        this.mouse.x = this.centerPos.x;
        this.mouse.y = this.centerPos.y;
      }
    }

  };

// Finds the nearest cell in list
  findNearest(cell, list) {
    if (this.currentTarget) {
      // Do not check for food if target already exists
      return null;
    }

    // Check for nearest cell in list
    var shortest = list[0];
    var shortestDist = this.getDist(cell, shortest);
    for (var i = 1; i < list.length; i++) {
      var check = list[i];
      var dist = this.getDist(cell, check);
      if (shortestDist > dist) {
        shortest = check;
        shortestDist = dist;
      }
    }

    return shortest;
  };

  getRandom(list) {
    // Gets a random cell from the array
    var n = Math.floor(Math.random() * list.length);
    return list[n];
  };

  combineVectors(list) {
    // Gets the angles of all enemies approaching the cell
    var pos = {
      x: 0,
      y: 0
    };
    var check;
    for (var i = 0; i < list.length; i++) {
      check = list[i];
      pos.x += check.position.x;
      pos.y += check.position.y;
    }

    // Get avg
    pos.x = pos.x / list.length;
    pos.y = pos.y / list.length;

    return pos;
  };

  checkPath(cell, check) {
    // Checks if the cell is in the way

    // Get angle of vector (cell -> path)
    var v1 = Math.atan2(cell.position.x - this.mouse.x, cell.position.y - this.mouse.y);

    // Get angle of vector (virus -> cell)
    var v2 = this.getAngle(check, cell);
    v2 = this.reverseAngle(v2);

    // todo dry and simplify
    if ((v1 <= (v2 + .25)) && (v1 >= (v2 - .25))) {
      return true;
    } else {
      return false;
    }
  };

  getBiggest(list) {
    // Gets the biggest cell from the array
    var biggest = list[0];
    for (var i = 1; i < list.length; i++) {
      var check = list[i];
      if (check.mass > biggest.mass) {
        biggest = check;
      }
    }

    return biggest;
  };

  findNearbyVirus(cell, checkDist, list) {
    var r = cell.getSize() + 100; // Gets radius + virus radius
    for (var i = 0; i < list.length; i++) {
      var check = list[i];
      var dist = this.getDist(cell, check) - r;
      if (checkDist > dist) {
        return check;
      }
    }
    return false; // Returns a bool if no nearby viruses are found
  };

  checkPath(cell, check) {
    // Get angle of path
    var v1 = Math.atan2(cell.position.x - player.mouse.x, cell.position.y - player.mouse.y);

    // Get angle of vector (cell -> virus)
    var v2 = this.getAngle(cell, check);
    var dist = this.getDist(cell, check);

    var inRange = Math.atan((2 * cell.getSize()) / dist); // Opposite/adjacent
    console.log(inRange);
    if ((v1 <= (v2 + inRange)) && (v1 >= (v2 - inRange))) {
      // Path collides
      return true;
    }

    // No collide
    return false;
  };

  getDist(cell, check) {
    // Fastest distance - I have a crappy computer to test with :(
    var xd = (check.position.x - cell.position.x);
    xd = xd < 0 ? xd * -1 : xd; // Math.abs is slow

    var yd = (check.position.y - cell.position.y);
    yd = yd < 0 ? yd * -1 : yd; // Math.abs is slow

    return (xd + yd);
  };

  getAccDist(cell, check) {
    // Accurate Distance
    var xs = check.position.x - cell.position.x;
    xs = xs * xs;

    var ys = check.position.y - cell.position.y;
    ys = ys * ys;

    return Math.sqrt(xs + ys);
  };

  getAngle(c1, c2) {
    var deltaY = c1.position.y - c2.position.y;
    var deltaX = c1.position.x - c2.position.x;
    return Math.atan2(deltaX, deltaY);
  };

  reverseAngle(angle) {
    return (angle > Math.PI) ? angle - Math.PI : angle + Math.PI;
  };
}
