var Cell = require('./Cell');

function MovingCell() {
    Cell.apply(this, Array.prototype.slice.call(arguments));

    this.cellType = 1;
    this.size = Math.ceil(Math.sqrt(100 * this.mass));
    this.squareSize = (100 * this.mass) >> 0; // not being decayed -> calculate one time
    this.shouldSendUpdate = false;
   
    this.setMoveEngineData(2 + 4 * Math.random(), Infinity, 1);
    if (this.gameServer.config.foodMassGrow &&
        this.gameServer.config.foodMassGrowPossibility > Math.floor(Math.random() * 101)) {
        this.grow();
    }
}

module.exports = MovingCell;
MovingCell.prototype = new Cell();

MovingCell.prototype.getSize = function() {
    return this.size;
};

MovingCell.prototype.getSquareSize = function() {
    return this.squareSize;
};

MovingCell.prototype.calcMove = null; // Food has no need to move

// Main Functions

MovingCell.prototype.grow = function() {
    setTimeout(function() {
        this.mass++; // food mass increased, we need to recalculate its size and squareSize, and send update to client side
        this.size = Math.ceil(Math.sqrt(100 * this.mass));
        this.squareSize = (100 * this.mass) >> 0;
        this.shouldSendUpdate = true;

        if (this.mass < this.gameServer.config.foodMassLimit) {
            this.grow();
        }
    }.bind(this), this.gameServer.config.foodMassTimeout * 1000);
};

MovingCell.prototype.sendUpdate = function() {
    // Whether or not to include this cell in the update packet
    if (this.moveEngineTicks == 0) {
        return false;
    }
    if (this.shouldSendUpdate) {
        this.shouldSendUpdate = false;
        return true;
    }
    return true;
};

MovingCell.prototype.onRemove = function(gameServer) {
    gameServer.currentFood--;
};

MovingCell.prototype.onConsume = function(consumer, gameServer) {
    consumer.addMass(this.mass);
};
