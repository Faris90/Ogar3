'use strict';
var Cell = require('./Cell');

function EjectedMass() {
  Cell.apply(this, Array.prototype.slice.call(arguments));

  this.cellType = 3;
  this.size = Math.ceil(Math.sqrt(100 * this.mass));
  this.squareSize = (100 * this.mass) >> 0; // not being decayed -> calculate one time
}

module.exports = EjectedMass;
EjectedMass.prototype = new Cell();

EjectedMass.prototype.getSize = function () {
  return this.size;
};

EjectedMass.prototype.getSquareSize = function () {
  return this.squareSize;
};

EjectedMass.prototype.calcMove = null; // Only for player controlled movement

// Main Functions

EjectedMass.prototype.sendUpdate = function () {
  // Whether or not to include this cell in the update packet
  return this.moveEngineTicks != 0;
};

EjectedMass.prototype.onRemove = function (gameServer) {
  // Remove from list of ejected mass
  gameServer.removeEjectedNode(this);
};

EjectedMass.prototype.onConsume = function (consumer, gameServer) {
  // Adds mass to consumer
  if (consumer.mass + this.mass > 5) consumer.addMass(this.mass); else consumer.mass = 10;
};

EjectedMass.prototype.onAutoMove = function (gameServer) {
  // Check for a beacon if experimental
  var beacons = gameServer._nodesBeacon;
  for (var i in beacons) {
    var beacon = beacons[i];
    if (beacon.quadrant != this.quadrant || !beacon) continue;
  if (gameServer.gameMode.ID === 8 && beacon && this.collisionCheck2(beacon.getSquareSize(), beacon.position)) {
    // The beacon has been feed
    beacon.feed(this, gameServer);
    return true;
  }
  }

  let virusNodes = gameServer.getVirusNodes();

    // Check for viruses
    var v = gameServer.getNearestVirus(this);
    if (v) { // Feeds the virus if it exists
      v.feed(this, gameServer);
      return true;
    }
  
};

EjectedMass.prototype.moveDone = function (gameServer) {
  this.onAutoMove(gameServer);
};

EjectedMass.prototype.onAdd = function (gameServer) {
  gameServer.addEjectedNodes(this);
};
