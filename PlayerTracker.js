var Packet = require('./packet');
var GameServer = require('./GameServer');

var fillChar = function (data, char, fieldLength, rTL) {
    var result = data.toString();
    if (rTL === true) {
        for (var i = result.length; i < fieldLength; i++)
            result = char.concat(result);
    }
    else {
        for (var i = result.length; i < fieldLength; i++)
            result = result.concat(char);
    }
    return result;
};

function stats2file(gameServer) {
    var fs = require('fs');
    var wstream = fs.createWriteStream('logs/playerlog.txt');
    wstream.write( 'OGar Server - Game Mode: ' + gameServer.gameMode.name + ' - ');
    wstream.write( 'Running Time: ' + parseInt( process.uptime() ) + 'sec\n');

    for (var i = 0; i < gameServer.clients.length; i++) {
        var client = gameServer.clients[i].playerTracker;
        var id = fillChar((client.pID), ' ', 5, true);

        // Get ip (15 digits length)
        var ip = "BOT";
        if (typeof gameServer.clients[i].remoteAddress != 'undefined' ) {
            ip = gameServer.clients[i].remoteAddress;
        }
        // ip = fillChar(ip, ' ', 15);

        var nick = '', cells = '', score = '', data = '';
        if ( ( client.hscore > 0 ) && ( client.cscore > 0 ) ) {
            nick  = fillChar((client.name == "") ? "An unnamed cell" : client.name, ' ', gameServer.config.playerMaxNickLength);
            cells = fillChar( parseInt(client.cscore), ' ', 2, true);
            score = fillChar( parseInt(client.hscore), ' ', 6, true);
            data = "0";
            if( client.cells.length > 0 ) data = "1";
            wstream.write('ID:' + id +  ', Nick: ' + nick + ', Score: ' + score + ', Cells: ' + cells + ', Status: ' + data  + ' IP: ' + ip + '\n');

            if( gameServer.sqlconfig.host != '' && ip != "BOT" && score > 100 )
                gameServer.mysql.writeScore(nick, ip, score,gameServer.sqlconfig.table);
        }
    }
    wstream.end();
}

module.exports = stats2file;

function PlayerTracker(gameServer, socket) {
    this.pID = -1;
    this.disconnect = -1; // Disconnection
    this.name = "";
    this.gameServer = gameServer;
    this.socket = socket;
    this.nodeAdditionQueue = [];
    this.nodeDestroyQueue = [];
    this.visibleNodes = [];
    this.cells = [];
    this.score = 0;  // Leaderboard
    this.hscore = 0; // High score
    this.cscore = 0; // Max Cells
    this.remoteAddress = "undefined";
    this.mouse = {x: 0, y: 0};
    this.tickLeaderboard = 0; //
    this.tickViewBox = 0;
    this.WriteInfo = 0; // Update for score file
    this.mouseCells = []; // For individual cell movement
    this.team = 0;
    this.spectate = true;
    this.spectatedPlayer = -1; // Current player that this player is watching

    // Viewing box
    this.sightRangeX = 0;
    this.sightRangeY = 0;
    this.centerPos = {x: 3000, y: 3000 };
    this.viewBox = {
        topY: 0,
        bottomY: 0,
        leftX: 0,
        rightX: 0,
        width: 0, // Half-width
        height: 0 // Half-height
    };

    // Gamemode function
    if (gameServer) {
        this.pID = gameServer.getNewPlayerID();
        gameServer.gameMode.onPlayerInit(this);
    }
}

module.exports = PlayerTracker;

// Setters/Getters

PlayerTracker.prototype.setName = function(name) {
    this.name = name;
};

PlayerTracker.prototype.getName = function() {
    return this.name;
};

PlayerTracker.prototype.getScore = function(reCalcScore) {
    if (reCalcScore) {
        var s = 0;
        for (var i = 0; i < this.cells.length; i++) {
            s += this.cells[i].mass;
            this.score = s;
            if ( s > this.hscore ) this.hscore = s;
        }
    }
    if ( this.cells.length > this.cscore ) this.cscore = this.cells.length;
    return this.score >> 0;
};

PlayerTracker.prototype.setColor = function(color) {
    this.color.r = color.r;
    this.color.b = color.b;
    this.color.g = color.g;
};

PlayerTracker.prototype.getTeam = function() {
    return this.team;
};

// Functions

PlayerTracker.prototype.update = function() {
// Actions buffer (So that people cant spam packets)
    if (this.socket.packetHandler.pressSpace) { // Split cell
        this.gameServer.gameMode.pressSpace(this.gameServer,this);
        this.socket.packetHandler.pressSpace = false;
    }

    if (this.socket.packetHandler.pressW) { // Eject mass
        this.gameServer.gameMode.pressW(this.gameServer,this);
        this.socket.packetHandler.pressW = false;
    }

    if (this.socket.packetHandler.pressQ) { // Q Press
        this.gameServer.gameMode.pressQ(this.gameServer,this);
        this.socket.packetHandler.pressQ = false;
    }

    var updateNodes = []; // Nodes that need to be updated via packet

    // Remove nodes from visible nodes if possible
    var d = 0;
    while (d < this.nodeDestroyQueue.length) {
        var index = this.visibleNodes.indexOf(this.nodeDestroyQueue[d]);
        if (index > -1) {
            this.visibleNodes.splice(index, 1);
            d++; // Increment
        } else {
            // Node was never visible anyways
            this.nodeDestroyQueue.splice(d,1);
        }
    }

    // Get visible nodes every 400 ms
    var nonVisibleNodes = []; // Nodes that are not visible
    if (this.tickViewBox <= 0) {
        var newVisible = this.calcViewBox();

        // Compare and destroy nodes that are not seen
        for (var i = 0; i < this.visibleNodes.length; i++) {
            var index = newVisible.indexOf(this.visibleNodes[i]);
            if (index == -1) {
                // Not seen by the client anymore
                nonVisibleNodes.push(this.visibleNodes[i]);
            }
        }

        // Add nodes to client's screen if client has not seen it already
        for (var i = 0; i < newVisible.length; i++) {
            var index = this.visibleNodes.indexOf(newVisible[i]);
            if (index == -1) {
                updateNodes.push(newVisible[i]);
            }
        }
        this.visibleNodes = newVisible;
        // Reset Ticks
        this.tickViewBox = 4;
    } else {
        this.tickViewBox--;
        // Add nodes to screen
        for (var i = 0; i < this.nodeAdditionQueue.length; i++) {
            var node = this.nodeAdditionQueue[i];
            this.visibleNodes.push(node);
            updateNodes.push(node);
        }
    }

    // Update moving nodes
    for (var i = 0; i < this.visibleNodes.length; i++) {
        var node = this.visibleNodes[i];
        if (node.sendUpdate()) {
            // Sends an update if cell is moving
            updateNodes.push(node);
        }
    }

    // Send packet
    this.socket.sendPacket(new Packet.UpdateNodes(this.nodeDestroyQueue, updateNodes, nonVisibleNodes,this.gameServer.config.serverVersion));

    this.nodeDestroyQueue = []; // Reset destroy queue
    this.nodeAdditionQueue = []; // Reset addition queue

    // Update leaderboard
    if (this.tickLeaderboard <= 0) {
        this.socket.sendPacket(this.gameServer.lb_packet);
        this.tickLeaderboard = 25; // 20 ticks = 1 second
        this.WriteInfo--;
    } else {
        this.tickLeaderboard--;
    }

    // Write Score File
    if (this.WriteInfo <= 0) {
        stats2file(this.gameServer);
        this.WriteInfo = 12;
    }

    // Handles disconnections
    if ( this.disconnect > 0 ) {
        // Player has disconnected... remove it when the timer hits -1
        this.disconnect--;
        if ( this.cells.length ) {
            // Remove all client cells
            var len = this.cells.length;
            for (var i = 0; i < len; i++) {
                var cell = this.socket.playerTracker.cells[0];
                if (!cell) {
                    continue;
                }
                this.gameServer.removeNode(cell);
            }
        }
        if ( this.disconnect == 0 ) {
            // Remove from client list
            var index = this.gameServer.clients.indexOf(this.socket);
            if (index != -1) {
                this.gameServer.clients.splice(index,1);
            }
        }
    }
};

// Viewing box
PlayerTracker.prototype.updateSightRange = function() { // For view distance
    var totalSize = 1.0;
    var len = this.cells.length;

    for (var i = 0; i < len;i++) {
        if (!this.cells[i]) {
            continue;
        }
        totalSize += this.cells[i].getSize();
    }

    var factor = Math.pow(Math.min(64.0 / totalSize, 1), 0.4);
    this.sightRangeX = this.gameServer.config.serverViewBaseX / factor;
    this.sightRangeY = this.gameServer.config.serverViewBaseY / factor;
};

PlayerTracker.prototype.updateCenter = function() { // Get center of cells
    var len = this.cells.length;

    if (len <= 0) {
        return; // End the function if no cells exist
    }

    var X = 0;
    var Y = 0;
    for (var i = 0; i < len ;i++) {
        if (!this.cells[i]) {
            continue;
        }

        X += this.cells[i].position.x;
        Y += this.cells[i].position.y;
    }

    this.centerPos.x = X / len >> 0;
    this.centerPos.y = Y / len >> 0;
};

PlayerTracker.prototype.calcViewBox = function() {
    if (this.spectate) {
        // Spectate mode
        return this.getSpectateNodes();
    }

    // Main function
    this.updateSightRange();
    this.updateCenter();

    // Box
    this.viewBox.topY = this.centerPos.y - this.sightRangeY;
    this.viewBox.bottomY = this.centerPos.y + this.sightRangeY;
    this.viewBox.leftX = this.centerPos.x - this.sightRangeX;
    this.viewBox.rightX = this.centerPos.x + this.sightRangeX;
    this.viewBox.width = this.sightRangeX;
    this.viewBox.height = this.sightRangeY;

    var newVisible = [];
    for (var i = 0; i < this.gameServer.nodes.length ;i++) {
        node = this.gameServer.nodes[i];

        if (!node) {
            continue;
        }

        if (node.visibleCheck(this.viewBox,this.centerPos)) {
            // Cell is in range of viewBox
            newVisible.push(node);
        }
    }
    return newVisible;
};

PlayerTracker.prototype.getSpectateNodes = function() {
    var specPlayer;

    if (this.gameServer.getMode().specByLeaderboard) {
        this.spectatedPlayer = Math.min(this.gameServer.leaderboard.length - 1, this.spectatedPlayer);
        specPlayer = this.spectatedPlayer == -1 ? null : this.gameServer.leaderboard[this.spectatedPlayer];
    } else {
        this.spectatedPlayer = Math.min(this.gameServer.clients.length - 1, this.spectatedPlayer);
        specPlayer = this.spectatedPlayer == -1 ? null : this.gameServer.clients[this.spectatedPlayer].playerTracker;
    }

    if (specPlayer) {
        // If selected player has died/disconnected, switch spectator and try again next tick
        if (specPlayer.cells.length == 0) {
            this.gameServer.switchSpectator(this);
            return [];
        }

        // Get spectated player's location and calculate zoom amount
        var specZoom = Math.sqrt(100 * specPlayer.score);
        specZoom = Math.pow(Math.min(40.5 / specZoom, 1.0), 0.4) * 0.6;
        // TODO: Send packet elsewhere so it is send more often
        this.socket.sendPacket(new Packet.UpdatePosition(specPlayer.centerPos.x, specPlayer.centerPos.y, specZoom));
        // TODO: Recalculate visible nodes for spectator to match specZoom
        return specPlayer.visibleNodes.slice(0,specPlayer.visibleNodes.length);
    } else {
        return []; // Nothing
    }
};
