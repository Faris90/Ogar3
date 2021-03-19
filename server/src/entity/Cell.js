'use strict';
Cell.spi = 0;
Cell.virusi = 255;
Cell.recom = 0;
function Cell(nodeId, owner, position, mass, gameServer) {
  this.nodeId = nodeId;
  this.owner = owner; // playerTracker that owns this cell
  this.color = {
    r: 0,
    g: Cell.virusi,
    b: 0
  };
  this.name = '';
  this.visible = true;
  this.position = position;
  this.watch = -1;
  this.mass = mass; // Starting mass of the cell
  this.cellType = -1; // 0 = Player Cell, 1 = Food, 2 = Virus, 3 = Ejected Mass
  this.spiked = Cell.spi; // If 1, then this cell has spikes around it
  this.wobbly = 0; // If 1 the cell has a very jiggly cell border

  this.killedBy; // Cell that ate this cell
  this.gameServer = gameServer;

  this.moveEngineTicks = 0; // Amount of times to loop the movement function
  this.moveEngineSpeed = 0;
  this.moveDecay = .75;
  this.angle = 0; // Angle of movement
}

module.exports = Cell;

// Fields not defined by the constructor are considered private and need a getter/setter to access from a different class

Cell.prototype.getId = function () {
  return this.nodeId;
};
Cell.prototype.getVis = function () {
  if (this.owner) {
    return this.owner.visible;
  } else {
    return this.visible;
  }
};
Cell.prototype.setVis = function (state, so) {
  if (!so && this.owner) {
    this.owner.visible = state;
  } else {
    this.visible = state;
  }
  return true;
};
Cell.prototype.quadSetup = function(gameServer) {
  this.gameServer = gameServer;
 var quad = this.getQuadrant(gameServer) 
    this.changeQuadrant(quad,gameServer);
  if (!quad) {
    setTimeout(function() {
      this.gameServer = gameServer;
 var quad = this.getQuadrant(gameServer) 
    this.changeQuadrant(quad,gameServer);
    }.bind(this), 500);
  }
}
Cell.prototype.changeQuadrant = function(quad, gameServer) {
  if (quad) {
gameServer.getWorld().removeQuadMap(this.quadrant,this.getId());
  gameServer.getWorld().setQuadMap(quad,this.getId());
 this.quadrant = quad;
  } else {
    console.log("[Quadmap] Change quad failed")
  }
};
Cell.prototype.getQuadrant = function(gameServer) {
  if (!gameServer && this.gameServer) gameServer = this.gameServer;
  var x = this.position.x;
  var y = this.position.y;
  var config = gameServer.config
  var borderH = Math.round((config.borderBottom + config.borderTop) / 2);
  var borderV = Math.round((config.borderRight + config.borderLeft) / 2);
  if (x > borderV && y > borderH) {
    return 4;
  } else if (x > borderV && y <= borderH) {
    return 1;
  } else if (x <= borderV && y > borderH) {
    return 3;
  } else if (x <= borderV && y <= borderH) {
    return 2;
  } else {
    return false;
  }
};
Cell.prototype.getName = function () {
  if (this.owner && !this.name) {
    return this.owner.name;
  } else {
    return this.name;
  }
};
Cell.prototype.setName = function (name, so) {
  if (!so && this.owner) {
    this.owner.name = name;
  } else {
    this.name = name;
  }
  return true;
};
Cell.prototype.getPremium = function () {
  if (this.owner) {
    return this.owner.premium;
  } else {
    return "";
  }
};

Cell.prototype.setColor = function (color) {
  this.color.r = color.r;
  this.color.b = color.b;
  this.color.g = color.g;
};

Cell.prototype.getColor = function () {
  return this.color;
};

Cell.prototype.getType = function () {
  return this.cellType;
};

Cell.prototype.getSize = function () {
  // Calculates radius based on cell mass
  return Math.ceil(Math.sqrt(100 * this.mass));
};

Cell.prototype.getSquareSize = function () {
  // R * R
  return (100 * this.mass) >> 0;
};

Cell.prototype.addMass = function (n) {
  //todo needs to surpass for a longer duration (timout?)
  var client = this.owner;
  var gameServer = this.owner.gameServer;
  if (!client.verify && gameServer.config.verify == 1) {


  } else {

    if (this.mass + n > this.owner.gameServer.config.playerMaxMass && this.owner.cells.length < this.owner.gameServer.config.playerMaxCells) {

      this.mass = this.mass + n;
      this.mass = this.mass/2;
      var randomAngle = Math.random() * 6.28; // Get random angle
      this.owner.gameServer.autoSplit(this.owner, this, randomAngle, this.mass, gameServer.config.autoSplitSpeed);
    } else {
      this.mass += n;
      var th = this;

      setTimeout(function () {
        th.mass = Math.min(th.mass, th.owner.gameServer.config.playerMaxMass);

      }, 1000);

    }
  }
};
Cell.prototype.getSpeed = function () {
  // Old formula: 5 + (20 * (1 - (this.mass/(70+this.mass))));
  // Based on 50ms ticks. If updateMoveEngine interval changes, change 50 to new value
  if (this.owner.customspeed > 0) {
    return this.owner.customspeed * Math.pow(this.mass, -1.0 / 4.5) * 50 / 40;

  } else {
    return this.owner.gameServer.config.playerSpeed * Math.pow(this.mass, -1.0 / 4.5) * 50 / 40;
  }
};

Cell.prototype.setAngle = function (radians) {
  this.angle = radians;
};

Cell.prototype.getAngle = function () {
  return this.angle;
};

Cell.prototype.setMoveEngineData = function (speed, ticks, decay) {
  this.moveEngineSpeed = speed;
  this.moveEngineTicks = ticks;
  this.moveDecay = isNaN(decay) ? 0.75 : decay;
};

Cell.prototype.getEatingRange = function () {
  return 0; // 0 for ejected cells
};

Cell.prototype.getKiller = function () {
  return this.killedBy;
};

Cell.prototype.setKiller = function (cell) {
  this.killedBy = cell;
};

// Functions

Cell.prototype.collisionCheck = function (bottomY, topY, rightX, leftX) {
  // Collision checking
  if (this.position.y > bottomY) {
    return false;
  }

  if (this.position.y < topY) {
    return false;
  }

  if (this.position.x > rightX) {
    return false;
  }

  if (this.position.x < leftX) {
    return false;
  }

  return true;
};

// This collision checking function is based on CIRCLE shape
Cell.prototype.collisionCheck2 = function (objectSquareSize, objectPosition) {
  // IF (O1O2 + r <= R) THEN collided. (O1O2: distance b/w 2 centers of cells)
  // (O1O2 + r)^2 <= R^2
  // approximately, remove 2*O1O2*r because it requires sqrt(): O1O2^2 + r^2 <= R^2

  var dx = this.position.x - objectPosition.x;
  var dy = this.position.y - objectPosition.y;
  if (Cell.recom == 0) {
    return (dx * dx + dy * dy + this.getSquareSize() <= objectSquareSize);
  } else {
    return (dx * dx + dy * dy <= objectSquareSize);
  }
};

Cell.prototype.visibleCheck = function (box, centerPos) {
  // Checks if this cell is visible to the player
  return this.collisionCheck(box.bottomY, box.topY, box.rightX, box.leftX);
};

Cell.prototype.calcMovePhys = function (config) {
  // Movement engine (non player controlled movement)
  var speed = this.moveEngineSpeed;
  var r = this.getSize();
  this.moveEngineSpeed *= this.moveDecay; // Decaying speed
  this.moveEngineTicks--;

  // Calculate new position
  var sin = Math.sin(this.angle);
  var cos = Math.cos(this.angle);
  if (this.cellType == 3) {
    //movement and collision check for ejected mass cells
    var collisionDist = r * 2; // Minimum distance between the 2 cells (allow cells to go a little inside eachother before moving them a.k.a cell squishing)
    var maxTravel = r; //check inbetween places for collisions (is needed when cell still has high speed) - max inbetween move before next collision check is cell radius
    var totTravel = 0;
    var xd = 0;
    var yd = 0;
    do {
      totTravel = Math.min(totTravel + maxTravel, speed);
      var x1 = this.position.x + (totTravel * sin) + xd;
      var y1 = this.position.y + (totTravel * cos) + yd;
      if (this.gameServer && this.gameServer.config.collideEjected == 1) {
        this.gameServer.getEjectedNodes().forEach((cell)=> { // needs to be simplified
        if (cell.quadrant != this.quadrant) return;
          if (this.nodeId == cell.getId()) return;
          if (!this.simpleCollide(x1, y1, cell, collisionDist)) return;

          var dist = this.getDist(x1, y1, cell.position.x, cell.position.y);
          if (dist < collisionDist) { // Collided
            var newDeltaY = cell.position.y - y1;
            var newDeltaX = cell.position.x - x1;
            var newAngle = Math.atan2(newDeltaX, newDeltaY);
            var move = (collisionDist - dist + 5) / 2; //move cells each halfway until they touch
            let xmove = move * Math.sin(newAngle);
            let ymove = move * Math.cos(newAngle);
            cell.position.x += xmove >> 0;
            cell.position.y += ymove >> 0;
            xd += -xmove;
            yd += -ymove;
            if (cell.moveEngineTicks == 0) {
              cell.setMoveEngineData(0, 1); //make sure a collided cell checks again for collisions with other cells
              this.gameServer.getWorld().setNodeAsMoving(cell.getId(), cell);
              //if (!this.gameServer.getMovingNodes().has(cell.getId())) {
              //  this.gameServer.setAsMovingNode(cell.getId());
              //}
            }
            if (this.moveEngineTicks == 0) {
              this.setMoveEngineData(0, 1); //make sure a collided cell checks again for collisions with other cells
            }
          }
        });
      }
    }

    while (totTravel < speed);
    x1 = this.position.x + (speed * sin) + xd;
    y1 = this.position.y + (speed * cos) + yd;

  } else {
    //movement for viruses
    var x1 = this.position.x + (speed * sin);
    var y1 = this.position.y + (speed * cos);
  }

  // Border check - Bouncy physics
  var radius = 40;
  if ((x1 - radius) < config.borderLeft) {
    // Flip angle horizontally - Left side
    this.angle = 6.28 - this.angle;
    x1 = config.borderLeft + radius;
  }
  if ((x1 + radius) > config.borderRight) {
    // Flip angle horizontally - Right side
    this.angle = 6.28 - this.angle;
    x1 = config.borderRight - radius;
  }
  if ((y1 - radius) < config.borderTop) {
    // Flip angle vertically - Top side
    this.angle = (this.angle <= 3.14) ? 3.14 - this.angle : 9.42 - this.angle;
    y1 = config.borderTop + radius;
  }
  if ((y1 + radius) > config.borderBottom) {
    // Flip angle vertically - Bottom side
    this.angle = (this.angle <= 3.14) ? 3.14 - this.angle : 9.42 - this.angle;
    y1 = config.borderBottom - radius;
  }

  // Set position
  this.position.x = x1 >> 0;
  this.position.y = y1 >> 0;
  if (this.gameServer) this.quadUpdate(this.gameServer)
};

// Override these

Cell.prototype.sendUpdate = function () {
  // Whether or not to include this cell in the update packet
  return true;
};

Cell.prototype.onConsume = function (consumer, gameServer) {
  // Called when the cell is consumed
};

Cell.prototype.onAdd = function (gameServer) {
  // Called when this cell is added to the world
};

Cell.prototype.onRemove = function (gameServer) {
  // Called when this cell is removed
};

Cell.prototype.onAutoMove = function (gameServer) {
  // Called on each auto move engine tick
};

Cell.prototype.moveDone = function (gameServer) {
  // Called when this cell finished moving with the auto move engine
};
Cell.prototype.simpleCollide = function (x1, y1, check, d) {
  // Simple collision check
  var len = d >> 0; // Width of cell + width of the box (Int)

  return (this.abs(x1 - check.position.x) < len) &&
    (this.abs(y1 - check.position.y) < len);
};

Cell.prototype.abs = function (x) {
  return x < 0 ? -x : x;
};
Cell.prototype.quadUpdate = function(gameServer) {
   var quad = false;
  quad = this.getQuadrant(gameServer);
  if (quad && quad != this.quadrant) this.changeQuadrant(quad,gameServer);
};

Cell.prototype.getDist = function (x1, y1, x2, y2) {
  var xs = x2 - x1;
  xs = xs * xs;

  var ys = y2 - y1;
  ys = ys * ys;

  return Math.sqrt(xs + ys);
};
