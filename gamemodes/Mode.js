var Cell = require('../entity/Cell');
function Mode() {
    this.ID = -1;

    this.name = "Blank";
    this.decayMod = 1.0; // Modifier for decay rate (Multiplier)
    this.packetLB = 49; // Packet id for leaderboard packet (48 = Text List, 49 = List, 50 = Pie chart)
    this.haveTeams = false; // True = gamemode uses teams, false = gamemode doesnt use teams
 this.nodesMother = [];
    this.tickMother = 0;
    this.tickMotherS = 0;

    // Config
    this.motherCellMass = 200;
    this.motherUpdateInterval = 5; // How many ticks it takes to update the mother cell (1 tick = 50 ms)
    this.motherSpawnInterval = 100; // How many ticks it takes to spawn another mother cell - Currently 5 seconds
    this.motherMinAmount = 5;
    this.specByLeaderboard = false; // false = spectate from player list instead of leaderboard

}

module.exports = Mode;

// Override these

Mode.prototype.onServerInit = function(gameServer) {
    // Called when the server starts
    gameServer.run = true;
};

Mode.prototype.onTick = function(gameServer) {
    // Called on every game tick
};
Mode.prototype.updateViruses = function(gameServer) {
    for (var i in gameServer.nodesVirus) {
        var virus = gameServer.nodesVirus[i];

        // Checks
        virus.virusTick(gameServer);

    }
}
Mode.prototype.onTick = function(gameServer) {
    // Called on every game tick

};
Mode.prototype.virusTick = function(gameServer) {
    // Called on every game tick
	    // virus Cell updates
    if (this.tickvirus >= this.virusUpdateInterval) {
        this.updateViruses(gameServer);
        this.tickvirus = 0;
    } else {
        this.tickvirus++;
    }
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
//mothercells
Mode.prototype.updateMotherCells = function(gameServer) {
    //console.log('ok????')
	for (var i in this.nodesMother) {
        var mother = this.nodesMother[i];

        // Checks
        mother.update(gameServer);
        mother.checkEat(gameServer);
    }
}

Mode.prototype.spawnMotherCell = function(gameServer) {
    // Checks if there are enough mother cells on the map
    if (this.nodesMother.length < this.motherMinAmount) {
        // Spawns a mother cell
        var pos =  gameServer.getRandomPosition();

        // Check for players
        for (var i = 0; i < gameServer.nodesPlayer.length; i++) {
            var check = gameServer.nodesPlayer[i];

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
        var m = new MotherCell(gameServer.getNextNodeId(), null, pos, this.motherCellMass);
        gameServer.addNode(m);
    }
};
// new cell
function MotherCell() { // Temporary - Will be in its own file if Zeach decides to add this to vanilla
    Cell.apply(this, Array.prototype.slice.call(arguments));
    this.cellType = 2; // Copies virus cell
    this.color = {r: 205, g: 85, b: 100};
    this.spiked = 1;
}

MotherCell.prototype = new Cell(); // Base

MotherCell.prototype.getEatingRange = function() {
    return this.getSize() * .5;
};
MotherCell.prototype.checkEat = function(gameServer) {
    var safeMass = this.mass * .9;
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
}
MotherCell.prototype.update = function(gameServer) {
    // Add mass
    this.mass += .25;

    // Spawn food
    var maxFood = 10; // Max food spawned per tick
    var i = 0; // Food spawn counter
    while ((this.mass > gameServer.gameMode.motherCellMass) && (i < maxFood))  {
        // Only spawn if food cap hasn been reached
        if (gameServer.currentFood < gameServer.config.foodMaxAmount) {
            this.spawnFood(gameServer);
			this.mass--;
        }
        // Incrementers

        i++;
    }
}
Mode.prototype.onChange = function(gameServer) {
    // Called when someone changes the gamemode via console commands
};

Mode.prototype.onPlayerInit = function(player) {
    // Called after a player object is constructed
};

Mode.prototype.onPlayerSpawn = function(gameServer,player) {
    // Called when a player is spawned
    player.color = gameServer.getRandomColor(); // Random color
    gameServer.spawnPlayer(player);
};

Mode.prototype.pressQ = function(gameServer,player) {
    // Called when the Q key is pressed
    if (player.spectate) {
        gameServer.switchSpectator(player);
    }
};

Mode.prototype.pressW = function(gameServer,player) {
    // Called when the W key is pressed
    gameServer.ejectMass(player);
};

Mode.prototype.pressSpace = function(gameServer,player) {
    // Called when the Space bar is pressed
    gameServer.splitCells(player);
};

Mode.prototype.onCellAdd = function(cell) {
    // Called when a player cell is added
};

Mode.prototype.onCellRemove = function(cell) {
    // Called when a player cell is removed
};

Mode.prototype.onCellMove = function(x1,y1,cell) {
	// Called when a player cell is moved
};

Mode.prototype.updateLB = function(gameServer) {
    // Called when the leaderboard update function is called
};

