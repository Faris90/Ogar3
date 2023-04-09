var Cell = require('./Cell');
var Virus = require('./Virus');
var Food = require('./Food');

function MotherCell() { // Temporary - Will be in its own file if Zeach decides to add this to vanilla
    Cell.apply(this, Array.prototype.slice.call(arguments));

    this.cellType = 2; // Copies virus cell
    this.skin = '%gas';
    this.name = '';
    this.color = {
        r: 200 + Math.floor(Math.random() * 30),
        g: 70  + Math.floor(Math.random() * 30),
        b: 70  + Math.floor(Math.random() * 30)
    };
    this.spiked = 1;
}

module.exports = MotherCell;
MotherCell.prototype = new Cell(); // Base

MotherCell.prototype.getEatingRange = function() {
    return this.getSize() * 0.5;
};

MotherCell.prototype.feed = function(gameServer) {
    // Add mass
    this.mass += 0.25;

    // Spawn food
    var maxFood = 10; // Max food spawned per tick
    var i = 0; // Food spawn counter
    //while ((this.mass > 100) && (i < maxFood))  {
        // Only spawn if food cap hasn been reached
       // if (gameServer.currentFood < 500) {
            this.spawnFood(gameServer);
			// Incrementers
        this.mass--;
        i++;
        //}

        
    //}
};

MotherCell.prototype.checkEat = function(gameServer) {
    var safeMass = this.mass * 0.9;
    var r = this.getSize(); // The box area that the checked cell needs to be in to be considered eaten

    // Loop for potential prey
    for (var i in gameServer.nodesPlayer) {
        var check = gameServer.nodesPlayer[i];

        if (check.mass > safeMass) {
            // Too big to be consumed
            continue;
        }

        // Calculations
        var len = r - (check.getSize() / 2) >> 0; 
        if ((this.abs(this.position.x - check.position.x) < len) && (this.abs(this.position.y - check.position.y) < len)) {
            // A second, more precise check
            var xs = Math.pow(check.position.x - this.position.x, 2);
            var ys = Math.pow(check.position.y - this.position.y, 2);
            var dist = Math.sqrt( xs + ys );

            if (r > dist) {
                // Un-juggernaut if player was juggernaut
                if(check.owner.juggernaut) {
                    check.owner.makeNotJuggernaut();
                }
                // Eats the cell
                gameServer.removeNode(check);
                this.mass += check.mass;
            }
        }
    }
    for (var i in gameServer.movingNodes) {
        var check = gameServer.movingNodes[i];

        if ((check.getType() == 1) || (check.mass > safeMass)) {
            // Too big to be consumed/ No player cells
            continue;
        }

        // Calculations
        var len = r >> 0;
        if ((this.abs(this.position.x - check.position.x) < len) && (this.abs(this.position.y - check.position.y) < len)) {
            // Eat the cell
            gameServer.removeNode(check);
            this.mass += check.mass;
        }
    }

    // Don't let mother cells get too big.  They'll just be a black hole instead
    if(this.mass > gameServer.gameMode.motherCellMaxMass) {
        this.mass = gameServer.gameMode.motherCellMaxMass;
        // Spit out a virus if not too many viruses
        if(gameServer.nodesVirus.length < gameServer.config.virusMaxAmount) {
            this.setAngle(Math.random() * 6.28);
            gameServer.shootVirus(this);
            this.mass -= gameServer.config.virusStartMass;
        }
    }
};

MotherCell.prototype.abs = function(n) {
    // Because Math.abs is slow
    return (n < 0) ? -n: n;
};

MotherCell.prototype.spawnFood = function(gameServer) {
    // Get starting position
    var angle = Math.random() * 6.28; // (Math.PI * 2) ??? Precision is not our greatest concern here
    var r = this.getSize();
    var pos = {
        x: this.position.x + ( r * Math.sin(angle) ),
        y: this.position.y + ( r * Math.cos(angle) )
    };

    // Spawn food
    var f = new Food(gameServer.getNextNodeId(), null, pos, gameServer.config.foodMass, gameServer);
    f.setColor(gameServer.getRandomColor());

    gameServer.addNode(f);
    gameServer.currentFood++;

    // Move engine
    f.angle = angle;
    var dist = (Math.random() * 10) + 22; // Random distance
    f.setMoveEngineData(dist,15);

    gameServer.setAsMovingNode(f);
};

MotherCell.prototype.onConsume = Virus.prototype.onConsume; // Copies the virus prototype function

MotherCell.prototype.onAdd = function(gameServer) {
    gameServer.nodesVirus.push(this);// Temporary
};

MotherCell.prototype.onRemove = function(gameServer) {
    var index = gameServer.nodesVirus.indexOf(this);
    if (index != -1) {
        gameServer.nodesVirus.splice(index, 1);
    } else {
        console.log("[Warning] Tried to remove a non existing virus!");
    }
};

MotherCell.prototype.visibleCheck = function(box,centerPos) {
    // Checks if this cell is visible to the player
    var cellSize = this.getSize();
    var lenX = cellSize + box.width >> 0; // Width of cell + width of the box (Int)
    var lenY = cellSize + box.height >> 0; // Height of cell + height of the box (Int)

    return (this.abs(this.position.x - centerPos.x) < lenX) && (this.abs(this.position.y - centerPos.y) < lenY);
};
