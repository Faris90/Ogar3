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
var PlayerTracker = require('../core/PlayerTracker.js');

module.exports = class BotPlayer extends PlayerTracker {

  constructor(gameServer, socket) {
    super(gameServer, socket);
    //PlayerTracker.apply(this, Array.prototype.slice.call(arguments));
    this.color = gameServer.getRandomColor();
    // AI only
    this.gameState = 0;
    this.path = [];

    this.predators = []; // List of cells that can eat this bot
    this.threats = []; // List of cells that can eat this bot but are too far away
    this.prey = []; // List of cells that can be eaten by this bot
    this.food = [];
    this.rbuffer = 10;
    this.isBot = true;
    this.foodImportant = []; // Not used - Bots will attempt to eat this regardless of nearby prey/predators
    this.virus = []; // List of viruses
    this.teamingwith = []; // player teamingwith
    this.teamStage = 0; // stage of teaming. 0 = off, 1 = init (shaking and giving mass), 2 = teamenabled, 3 = betrayal

    this.juke = true;

    this.target;
    this.teameject = 0;
    this.shake = 0;
    this.teamtimout = 30 // timout until team is gone
    this.targetVirus; // Virus used to shoot into the target
    this.updateIn = (Math.random() * 12) >> 0;
    this.ejectMass = 0; // Amount of times to eject mass
    this.oldPos = {
      x: 0,
      y: 0
    };
  }

//module.exports = BotPlayer;
//BotPlayer.prototype = new PlayerTracker();

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
  }

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
    // todo see if this is leaking memory
    if (this.cells.length <= 0) {
      if (this.gameServer.config.botrespawn == 1) {
        this.gameServer.gameMode.onPlayerSpawn(this.gameServer, this);
        if (this.cells.length == 0) {
          // If the bot cannot spawn any cells, then disconnect it
          this.socket.close();
          return;
        }
      } else {
        this.socket.close();
        return;
      }
    }

    // Update
    if ((this.tickViewBox <= 0) && (this.gameServer.running)) {
      this.visibleNodes = this.calcViewBox();
      if (this.gameServer.config.randomBotSmartness == 1) {
        this.tickViewBox = this.updateIn;
        
      } else {
        if (this.rbuffer <= 0) {
      this.tickViewBox = this.gameServer.config.botupdate;
        } else {
        this.tickViewBox = this.updateIn;
        this.rbuffer--;
        }
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
    var ignoreMass = cell.mass / 25;

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
          if (!check.owner.verify && this.gameServer.config.verify == 1) {

            continue;
          }
          var random = Math.floor(Math.random()*500);
          if (check.owner && random < 5 && Math.abs(check.owner.getScore() - this.getScore()) < 200 && this.teamStage == 0) {
            this.teamStage = 1;
            this.teamingwith = check.owner;
            this.teameject = 0;
          }

          // Check for danger
          if (cell.mass > (check.mass * 1.3) && check.owner != this.teamingwith) {
            // Add to prey list
            this.prey.push(check);
          } else if (check.mass > (cell.mass * 1.3) && check.owner != this.teamingwith) {
            // Predator
            var dist = this.getDist(cell, check) - (r + check.getSize());
            if (dist < 300) {
              this.predators.push(check);
              if ((this.cells.length == 1) && (dist < 0)) {
                this.juke = true;
              }
            }
            this.threats.push(check);
          } else if (check.owner != this.teamingwith) {
            this.threats.push(check);
          }
          break;
        case 1:
          this.food.push(check);
          break;
        case 2: // Virus
          if (!check.isMotherCell) this.virus.push(check); // Only real viruses! No mother cells
          // Can also be a threat
                if(cell.mass > (check.mass * 1.3)) {
                  if(dist < 40) {
                      this.threats.push(check);
                      this.predators.push(check);
                    }
                }
          break;
        case 3: // Ejected mass
          if (cell.mass > 20) {
            this.food.push(check);
          }
          break;
        default:
          break;
      }
    }

    // Get gamestate
    var newState = this.getState(cell);
    if ((newState != this.gameState) && (newState != 4)) {
      // Clear target
      this.target = null;
    }
    this.gameState = newState;

    // Action
    this.decide(cell);

    this.nodeDestroyQueue = []; // Empty
}.bind(this),0)
  }

// Custom

  clearLists() {
    this.predators = [];
    this.threats = [];
    this.prey = [];
    this.food = [];
    this.virus = [];
    this.juke = false;
  }

  getState(cell) {
    // Continue to shoot viruses
    
    
    
    if (this.gameState == 4) {
      return 4;
    }
    if (this.teamStage == 1) {
      return 6;
    }

    // Check for predators
    if (this.predators.length <= 0) {
      if (this.prey.length > 0) {
        return 3;
      } else if (this.food.length > 0) {
        return 1;
      }
    } else if (this.threats.length > 0) {
      if ((this.cells.length == 1) && (cell.mass > 180)) {
        var t = this.getBiggest(this.threats);
        var tl = this.findNearbyVirus(t, 500, this.virus);
        if (tl != false && t.getType() !== 2) {
          this.target = t;
          this.targetVirus = tl;
          return 4;
          } else {
          // Run if we hit a virus
          return 2;
        }
      } else {
        // Run
        return 2;
      }
    }

    // Bot wanders by default
    return 0;
  }

  decide(cell) {
    // The bot decides what to do based on gamestate

    switch (this.gameState) {
      case 0: // Wander

        if (1 == 2) {
          this.mouse = this.gameServer.miniontarget;

        } else {

          //console.log("[Bot] "+cell.getName()+": Wandering");
          if ((this.centerPos.x == this.mouse.x) && (this.centerPos.y == this.mouse.y)) {
            // Get a new position
            let nodes = this.gameServer.getWorld().getNodes();
            let nodeKeys = nodes.keys();
            var index = Math.floor(Math.random() * nodeKeys.length);
            var randomNode = nodes.get(nodeKeys[index]);
            var pos = {
              x: 0,
              y: 0
            };

            if ((randomNode.getType() == 3) || (randomNode.getType() == 1)) {
              pos.x = randomNode.position.x;
              pos.y = randomNode.position.y;
            } else {
              // Not a food/ejected cell
              pos = this.gameServer.getRandomPosition();
            }

            // Set bot's mouse coords to this location
            this.mouse = {
              x: pos.x,
              y: pos.y
            };
          }
        }
        break;
      case 1: // Looking for food
        if (1 == 2) {
          this.mouse = this.gameServer.miniontarget;

        } else {
          //console.log("[Bot] "+cell.getName()+": Getting Food");
          this.target = this.findNearest(cell, this.food);

          this.mouse = {
            x: this.target.position.x,
            y: this.target.position.y
          };
        }
        break;
      case 2: // Run from (potential) predators
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
        //if (cell.mass < 250) {
          //cell.mass += 1;
        //}

        if (this.juke) {
          // Juking
          this.gameServer.splitCells(this);
        }

        break;
      case 3: // Target prey
        if (1 == 2) {
          this.mouse = this.gameServer.miniontarget;

        } else {
          if ((!this.target) || (cell.mass < (this.target.mass * 1.3)) || (this.visibleNodes.indexOf(this.target) == -1)) {
            this.target = this.getBiggest(this.prey);
          }
          //console.log("[Bot] "+cell.getName()+": Targeting "+this.target.getName());

          this.mouse = {
            x: this.target.position.x,
            y: this.target.position.y
          };

          var massReq = 1.3 * (this.target.mass * 2); // Mass required to splitkill the target

          if ((cell.mass > massReq) && (this.cells.length <= this.gameServer.config.botmaxsplit)) { // Will not split into more than 2 cells
            var splitDist = (20 * (cell.getSpeed () * 5)) + (cell.getSize() * 1.75); // Distance needed to splitkill
            var distToTarget = this.getAccDist(cell, this.target); // Distance between the target and this cell

            if (splitDist >= distToTarget) {
              if ((this.threats.length > 0) && (this.getBiggest(this.threats).mass > (cell.mass))) {
                // Dont splitkill when there are cells that can possibly eat you after the split
                break;
              }
              // Splitkill
              this.gameServer.splitCells(this);
            }
          }
        }
        break;
      case 4: // Shoot virus
        if (1 == 2) {
          this.mouse = this.gameServer.miniontarget;

        } else {
          if ((!this.target) || (!this.targetVirus) || (!this.cells.length == 1) || (this.visibleNodes.indexOf(this.target) == -1) || (this.visibleNodes.indexOf(this.targetVirus) == -1)) {
            this.gameState = 0; // Reset
            this.target = null;
            break;
          }

          // Make sure target is within range
          var dist = this.getDist(this.targetVirus, this.target) - (this.target.getSize() + 100);
          if (dist > 500) {
            this.gameState = 0; // Reset
            this.target = null;
            break;
          }

          // Find angle of vector between target and virus
          var angle = this.getAngle(this.target, this.targetVirus);

          // Now reverse the angle
          var reversed = this.reverseAngle(angle);

          // Get this bot cell's angle
          var ourAngle = this.getAngle(cell, this.targetVirus);

          // Check if bot cell is in position
          if ((ourAngle <= (reversed + .25)) && (ourAngle >= (reversed - .25))) {
            // In position!
            this.mouse = {
              x: this.targetVirus.position.x,
              y: this.targetVirus.position.y
            };

            // Shoot
            for (var v = 0; v < 7; v++) {
              this.gameServer.ejectMass(this);
            }

            // Back to starting pos
            this.mouse = {
              x: cell.position.x,
              y: cell.position.y
            };

            // Cleanup
            this.gameState = 0; // Reset
            this.target = null;
          } else {
            // Move to position
            var r = cell.getSize();
            var x1 = this.targetVirus.position.x + ((350 + r) * Math.sin(reversed));
            var y1 = this.targetVirus.position.y + ((350 + r) * Math.cos(reversed));
            this.mouse = {
              x: x1,
              y: y1
            };
          }

          // console.log("[Bot] "+cell.getName()+": Targeting (virus) "+this.target.getName());
        }
        break;
        case 6: // init team
        if (this.teamtimout < 1) {
             this.teamtimout = 30;
             this.teamStage = 0;
             this.teameject = 0;
             // console.log("team timeout");
           } else {
           this.teamtimout --;
           }
        var ok = false;
        for (var i in this.teamingwith.cells) {
          
         var des = this.getAccDist(cell, this.teamingwith.cells[i]) 
         
         if (des < 100 + this.teamingwith.cells[i].mass) {
           var avoid = this.teamingwith.cells[i].position
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
           
         }
         if (des < 700 + this.teamingwith.cells[i].mass) {
           var ok = true;
           // console.log("ok true")
         break;
         }
        }
        if (ok) {
          if (this.teameject < 5 && cell.mass > 100) {
            this.mouse = this.teamingwith.centerPos;
            this.gameServer.ejectMass(this);
           // console.log("ejecting");
           this.teameject ++
          }
         
        } else {
          this.mouse = this.teamingwith.centerPos;
          
        }
        
        break;
      default:

        //console.log("[Bot] "+cell.getName()+": Idle "+this.gameState);
        this.target = this.findNearest(cell, this.food);

        this.mouse = {
          x: this.target.position.x,
          y: this.target.position.y
        };
        this.gameState = 1;

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

  }

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
  }

  getRandom(list) {
    // Gets a random cell from the array
    var n = Math.floor(Math.random() * list.length);
    return list[n];
  }

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
  }

  checkPath(cell, check) {
    // Checks if the cell is in the way

    // Get angle of vector (cell -> path)
    var v1 = Math.atan2(cell.position.x - this.mouse.x, cell.position.y - this.mouse.y);

    // Get angle of vector (virus -> cell)
    var v2 = this.getAngle(check, cell);
    v2 = this.reverseAngle(v2);

    if ((v1 <= (v2 + .25) ) && (v1 >= (v2 - .25) )) {
        return true;
    } else {
        return false;
    }
}

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
  }

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
  }

  checkPath(cell, check) {
    // Get angle of path
    var v1 = Math.atan2(cell.position.x - this.mouse.x, cell.position.y - this.mouse.y);

    // Get angle of vector (cell -> virus)
    var v2 = this.getAngle(cell, check);
    var dist = this.getDist(cell, check);

    var inRange = Math.atan((2 * cell.getSize()) / dist); // Opposite/adjacent
    // console.log(inRange);
    if ((v1 <= (v2 + inRange)) && (v1 >= (v2 - inRange))) {
      // Path collides
      return true;
    }

    // No collide
    return false;
  }

  getDist(cell, check) {
    // Fastest distance - I have a crappy computer to test with :(
    var xd = (check.position.x - cell.position.x);
    xd = xd < 0 ? xd * -1 : xd; // Math.abs is slow

    var yd = (check.position.y - cell.position.y);
    yd = yd < 0 ? yd * -1 : yd; // Math.abs is slow

    return (xd + yd);
  }

  getAccDist(cell, check) {
    // Accurate Distance
    var xs = check.position.x - cell.position.x;
    xs = xs * xs;

    var ys = check.position.y - cell.position.y;
    ys = ys * ys;

    return Math.sqrt(xs + ys);
  }

  getAngle(c1, c2) {
    var deltaY = c1.position.y - c2.position.y;
    var deltaX = c1.position.x - c2.position.x;
    return Math.atan2(deltaX, deltaY);
  }

  reverseAngle(angle) {
    if (angle > Math.PI) {
      angle -= Math.PI;
    } else {
      angle += Math.PI;
    }
    return angle;
  }
};
