// Library imports
// jxcore.tasks.setThreadCount(4);
var WebSocket = require('ws');
var querystring = require("querystring");
var http = require('http');
var finalhandler = require('finalhandler');
var fs = require("fs");
var myos = require("os");

var ini = require('./modules/ini.js');

// Project imports
var Packet = require('./packet');
var PlayerTracker = require('./PlayerTracker');
var PacketHandler = require('./PacketHandler');
var Entity = require('./entity');
var Gamemode = require('./gamemodes');
var BotLoader = require('./ai/BotLoader');
var Logger = require('./modules/log');
var serveStatic = require('serve-static');
var serve = serveStatic('./client/');
// GameServer implementation
function GameServer() {
    // Startup 
    this.run = true;
    this.lastNodeId = 1;
    this.lastPlayerId = 1;
    this.clients = [];
    this.nodes = [];
    this.nodesVirus = []; // Virus nodes
    this.nodesEjected = []; // Ejected mass nodes
    this.nodesPlayer = []; // Nodes controlled by players

    this.currentFood = 0;
    this.movingNodes = []; // For move engine
    this.leaderboard = [];
    this.lb_packet = new ArrayBuffer(0); // Leaderboard packet

    this.bots = new BotLoader(this);
    this.log = new Logger();
    this.commands;    // Command handler
    this.banned = []; // List of banned IPs

    // Main loop tick
    this.time = new Date();
    this.startTime = this.time;
    this.tick = 0;      // 1 second ticks of mainLoop
    this.tickMain = 0;  // 50 ms ticks, 20 of these = 1 leaderboard update
    this.tickSpawn = 0; // Used with spawning food
    this.master = 0;    // Used for Master Ping spam protection

    // Config
    this.sqlconfig = {
        host: '',
        user: '',
        password: '',
        database: '',
        table: ''
    };
    this.config = {                   // Border - Right: X increases, Down: Y increases (as of 2015-05-20)
        serverMaxConnections: 64,     // Maximum amount of connections to the server.
	    serverMaxConnPerIp: 9, 
        serverPort: 8080,            // Server port
        serverGamemode: 0,            // Gamemode, 0 = FFA, 1 = Teams
        serverResetTime: 0,          // Time in hours to reset (0 is off)
        serverName: 'Ogar3 Server',               // The name to display on the tracker (leave empty will show ip:port)
        serverAdminPass: '',          // Remote console commands password
        serverBots: 3,                // Amount of player bots to spawn
		serverVersion: 1,
        serverOldColors: 0,           // If the server uses colors from the original Ogar
        serverViewBaseX: 1024,        // Base view distance of players. Warning: high values may cause lag
        serverViewBaseY: 592,
        serverStatsPort: 88,          // Port for stats server. Having a negative number will disable the stats server.
        serverStatsUpdate: 60,        // Amount of seconds per update for the server stats
        serverLogLevel: 2,            // Logging level of the server. 0 = No logs, 1 = Logs the console, 2 = Logs console and ip connections
        gameLBlength: 10,             // Number of names to display on Leaderboard (Vanilla value: 10)
        borderLeft: 0,                // Left border of map (Vanilla value: 0)
        borderRight: 6000,            // Right border of map (Vanilla value: 11180.3398875)
        borderTop: 0,                 // Top border of map (Vanilla value: 0)
        borderBottom: 6000,           // Bottom border of map (Vanilla value: 11180.3398875)
        spawnInterval: 20,            // The interval between each food cell spawn in ticks (1 tick = 50 ms)
        foodSpawnAmount: 10,          // The amount of food to spawn per interval
        foodStartAmount: 100,         // The starting amount of food in the map
        foodMaxAmount: 500,           // Maximum food cells on the map
        foodMass: 1,                  // Starting food size (In mass)
		foodMaxMass: 4,
        virusMinAmount: 10,           // Minimum amount of viruses on the map.
        virusMaxAmount: 50,           // Maximum amount of viruses on the map. If this amount is reached, then ejected cells will pass through viruses.
        virusStartMass: 100,          // Starting virus size (In mass)
        virusFeedAmount: 7,           // Amount of times you need to feed a virus to shoot it
		motherCellMinMass: 200,
	    motherCellMaxMass: 2000,
        ejectMass: 12,                // Mass of ejected cells
        ejectMassLoss: 16,            // Mass lost when ejecting cells
        ejectSpeed: 160,              // Base speed of ejected cells
        ejectSpawnPlayer: 50,         // Chance for a player to spawn from ejected mass
        playerStartMass: 10,          // Starting mass of the player cell.
        playerMaxMass: 22500,         // Maximum mass a player can have
        playerSpeed: 30,							// Player base speed
		playerSplitSpeedMultiplier: 6,     // multiplier for splitting speed
		playerPopsplitSpeed: 1,
        playerMinMassEject: 32,       // Mass required to eject a cell
        playerMinMassSplit: 36,       // Mass required to split
		playerSmoothSplit: 1, 		  // Does player split smoothly?
        playerMaxCells: 16,           // Max cells the player is allowed to have
        playerRecombineTime: 30,      // Base amount of seconds before a cell is allowed to recombine
        playerMassDecayRate: .002,    // Amount of mass lost per second
        playerMinMassDecay: 9,        // Minimum mass for decay to occur
        playerMaxNickLength: 15,      // Maximum nick length
        playerDisconnectTime: 60,     // The amount of seconds it takes for a player cell to be removed after disconnection (If set to -1, cells are never removed)
        teamsCollision: 1,            //If teammates can collide with each other.
		tourneyMaxPlayers: 12,        // Maximum amount of participants for tournament style game modes
        tourneyPrepTime: 10,          // Amount of ticks to wait after all players are ready (1 tick = 1000 ms)
        tourneyEndTime: 30,           // Amount of ticks to wait after a player wins (1 tick = 1000 ms)
        tourneyTimeLimit: 20,         // Time limit of the game, in minutes.
        tourneyAutoFill: 0,           // If set to a value higher than 0, the tournament match will automatically fill up with bots after this amount of seconds
        tourneyAutoFillPlayers: 1,    // The timer for filling the server with bots will not count down unless there is this amount of real players
        chatMaxMessageLength: 70      // Maximum message length
    };
    // Parse config
    this.loadConfig();
    this.oldcolors = [{'r':235,'b':0,'g':75},{'r':225,'b':255,'g':125},{'r':180,'b':20,'g':7},{'r':80,'b':240,'g':170},{'r':180,'b':135,'g':90},{'r':195,'b':0,'g':240},{'r':150,'b':255,'g':18},{'r':80,'b':0,'g':245},{'r':165,'b':0,'g':25},{'r':80,'b':0,'g':145},{'r':80,'b':240,'g':170},{'r':55,'b':255,'g':92}]; 

    // Gamemodes
    this.gameMode = Gamemode.get(this.config.serverGamemode);
}

module.exports = GameServer;

GameServer.prototype.start = function() {
    // Logging
    this.log.setup(this);

		// Rcon Info
    if ( this.config.serverAdminPass != '' )
    {
        console.log("* \u001B[33mRcon enabled, passkey set to " + this.config.serverAdminPass + "\u001B[0m");
        console.log("* \u001B[33mTo use in chat type /rcon " + this.config.serverAdminPass + " <server command>\u001B[0m");
    }

		// My SQL erver
    if ( this.sqlconfig.host != '' )
    {
        console.log("* \u001B[33mMySQL config loaded Database set to " + this.sqlconfig.database + "." + this.sqlconfig.table + "\u001B[0m");
        MySQL = require("./modules/mysql");
        this.mysql = new MySQL();
        this.mysql.init(this.sqlconfig);
        this.mysql.connect();
        this.mysql.createTable(this.sqlconfig.table,this.sqlconfig.database);
    }

    // Gamemode configurations
    this.gameMode.onServerInit(this);
this.config.serverPort = process.env.PORT || this.config.serverPort;
// here
    // Start the server
    var hserver = http.createServer( function(req, res){
    res.setHeader('Access-Control-Allow-Origin', '*');
      var done = finalhandler(req, res)
	 // res.end({title:12})
      serve(req, res, done)
    });
hserver.listen(this.config.serverPort,"0.0.0.0",this.onHttpServerOpen.bind(this));
this.socketServer = new WebSocket.Server({server: hserver, perMessageDeflate: false});
    this.socketServer.on('connection', connectionEstablished.bind(this));

    // Properly handle errors because some people are too lazy to read the readme
    this.socketServer.on('error', function err(e) {
        switch (e.code) {
            case "EADDRINUSE": 
                console.log("[Error] Server could not bind to port! Please close out of Skype or change 'serverPort' in gameserver.ini to a different number.");
                break;
            case "EACCES": 
                console.log("[Error] Please make sure you are running Ogar with root privileges.");
                break;
            default:
                console.log("[Error] Unhandled error code: "+e.code);
                break;
        }
        process.exit(1); // Exits the program
    });

    function connectionEstablished(ws) {
        if (this.clients.length >= this.config.serverMaxConnections) { // Server full
            console.log("\u001B[33mClient tried to connect, but server player limit has been reached!\u001B[0m");
            ws.close();
            return;
        } else if (this.banned.indexOf(ws._socket.remoteAddress) != -1) { // Banned
            console.log("\u001B[33mClient " + ws._socket.remoteAddress + ", tried to connect but is banned!\u001B[0m");
            ws.close();
            return;
        }

				var origin = ws.upgradeReq.headers.origin;
	    if (this.config.serverMaxConnPerIp) {
            for (var cons = 1, i = 0, llen = this.clients.length; i < llen; i++) {
                if (this.clients[i].remoteAddress == ws._socket.remoteAddress) {
                    cons++;
                }
            }
            if (cons > this.config.serverMaxConnPerIp ) {
                ws.close();
                return;
            }
        }

        function close(error) {
            this.server.log.onDisconnect(this.socket.remoteAddress);
            var client = this.socket.playerTracker;
            console.log( "\u001B[31mClient Disconnect: " + this.socket.remoteAddress + ":" + this.socket.remotePort +" Error " + error + "\u001B[0m");
            var len = this.socket.playerTracker.cells.length;
            for (var i = 0; i < len; i++) {
                var cell = this.socket.playerTracker.cells[i];

                if (!cell) {
                    continue;
                }
                cell.calcMove = function() { return; }; // Clear function so that the cell cant move
                // this.server.removeNode(cell);
            }
            client.disconnect = this.server.config.playerDisconnectTime * 20;
            this.socket.sendPacket = function() {return;}; // Clear function so no packets are sent
        }
        ws.remoteAddress = ws._socket.remoteAddress;
        ws.remotePort = ws._socket.remotePort;
        this.log.onConnect(ws.remoteAddress); // Log connections
        console.log( "(" + this.clients.length + "/" + this.config.serverMaxConnections  + ") \u001B[32mClient connect: "+ws.remoteAddress+":"+ws.remotePort+" [origin "+origin+"]\u001B[0m");

        ws.playerTracker = new PlayerTracker(this, ws);
        ws.packetHandler = new PacketHandler(this, ws);
        ws.on('message', ws.packetHandler.handleMessage.bind(ws.packetHandler));

        var bindObject = { server: this, socket: ws };
        ws.on('error', close.bind(bindObject));
        ws.on('close', close.bind(bindObject));
        this.clients.push(ws);
        this.MasterPing();
    }
    this.startStatsServer(this.config.serverStatsPort);
};
GameServer.prototype.onHttpServerOpen = function() {
        // Spawn starting food
        this.startingFood();

        // Start Main Loop
        this.MasterPing();
        setInterval(this.MasterPing.bind(this), 1805000);
        setInterval(this.mainLoop.bind(this), 1);

        // Done
        console.log("* \u001B[33mListening on port " + this.config.serverPort + " \u001B[0m");
        console.log("* \u001B[33mCurrent game mode is " + this.gameMode.name + "\u001B[0m");

        // Player bots (Experimental)
		/*for (var i = 0;i < 20;i++) {
                this.bots.addNPC();
            }*/
        if (this.config.serverBots > 0) {
            for (var i = 0;i < this.config.serverBots;i++) {
                this.bots.addBot();
            }
            console.log("* \u001B[33mLoaded "+this.config.serverBots+" player bots\u001B[0m");
        }
        if (this.config.serverResetTime > 0 ) {
            console.log("* \u001B[33mAuto shutdown after "+this.config.serverResetTime+" hours\u001B[0m");
        }
        
        if ( this.config.serverVersion == 1 )
        		console.log("* \u001B[33mProtocol set to new, clients with version 561.20 and up can connect to this server\u001B[0m");
        if ( this.config.serverVersion == 0 )
        		console.log("* \u001B[33mProtocol set to old, clients with version 561.19 and older can connect to this server\u001B[0m");
    };
GameServer.prototype.getMode = function() {
    return this.gameMode;
};

GameServer.prototype.getNextNodeId = function() {
    // Resets integer
    if (this.lastNodeId > 2147483647) {
        this.lastNodeId = 1;
    }
    return this.lastNodeId++;
};

GameServer.prototype.getNewPlayerID = function() {
    // Resets integer
    if (this.lastPlayerId > 2147483647) {
        this.lastPlayerId = 1;
    }
    return this.lastPlayerId++;
};

GameServer.prototype.getRandomPosition = function() {
    return {
        x: Math.floor(Math.random() * (this.config.borderRight - this.config.borderLeft)) + this.config.borderLeft,
        y: Math.floor(Math.random() * (this.config.borderBottom - this.config.borderTop)) + this.config.borderTop
    };
};

GameServer.prototype.getRandomSpawn = function() {
    // Random spawns for players
    var pos;

    if (this.currentFood > 0) {
        // Spawn from food
        var node;
        for (var i = (this.nodes.length - 1); i > -1; i--) {
            // Find random food
            node = this.nodes[i];

            if (!node || node.inRange) {
                // Skip if food is about to be eaten/undefined
                continue;
            }

            if (node.getType() == 1) {
                pos = {x: node.position.x,y: node.position.y};
                this.removeNode(node);
                break;
            }
        }
    }

    if (!pos) {
        // Get random spawn if no food cell is found
        pos = this.getRandomPosition();
    }

    return pos;
};

GameServer.prototype.getRandomColor = function() {
	if(this.config.serverOldColors) {
    var index = Math.floor(Math.random() * this.oldcolors.length);
    var color = this.oldcolors[index];
    return {
        r: color.r,
        b: color.b,
        g: color.g
    }; 
    } else {
     var colorRGB = [0xFF, 0x07, (Math.random() * 256) >> 0];
        colorRGB.sort(function () { return 0.5 - Math.random() });
        return {
            r: colorRGB[0],
            b: colorRGB[1],
            g: colorRGB[2]
        };
	};
};

GameServer.prototype.addNode = function(node) {
    this.nodes.push(node);

    // Adds to the owning player's screen
    if (node.owner) {
        node.setColor(node.owner.color);
        node.owner.cells.push(node);
        node.owner.socket.sendPacket(new Packet.AddNode(node));
    }

    // Special on-add actions
    node.onAdd(this);

    // Add to visible nodes
    for (var i = 0; i < this.clients.length;i++) {
        client = this.clients[i].playerTracker;
        if (!client) {
            continue;
        }

        // client.nodeAdditionQueue is only used by human players, not bots
        // for bots it just gets collected forever, using ever-increasing amounts of memory
        if ('_socket' in client.socket && node.visibleCheck(client.viewBox,client.centerPos)) {
            client.nodeAdditionQueue.push(node);
        }
    }
};

GameServer.prototype.removeNode = function(node) {
    // Remove from main nodes list
    var index = this.nodes.indexOf(node);
    if (index != -1) {
        this.nodes.splice(index, 1);
    }

    // Remove from moving cells list
    index = this.movingNodes.indexOf(node);
    if (index != -1) {
        this.movingNodes.splice(index, 1);
    }

    // Special on-remove actions
    node.onRemove(this);

    // Animation when eating
    for (var i = 0; i < this.clients.length;i++) {
        client = this.clients[i].playerTracker;
        if (!client) {
            continue;
        }

        // Remove from client
        client.nodeDestroyQueue.push(node);
    }
};

GameServer.prototype.cellTick = function() {
    // Move cells
    this.updateMoveEngine();
}

GameServer.prototype.spawnTick = function() {
    // Spawn food
    this.tickSpawn++;
    if (this.tickSpawn >= this.config.spawnInterval) {
        this.updateFood();  // Spawn food
        this.virusCheck();  // Spawn viruses
        this.tickSpawn = 0; // Reset
    }
}

GameServer.prototype.gamemodeTick = function() {
    // Gamemode tick
    this.gameMode.onTick(this);
}

GameServer.prototype.cellUpdateTick = function() {
    // Update cells
    this.updateCells();
}

GameServer.prototype.mainLoop = function() {
    // Timer
    var local = new Date();
    this.tick += (local - this.time);
    this.time = local;

    // Default 50 (aka 50ms) if change here change movespeed as well
    if (this.tick >= 50) {
        // Loop main functions
        if (this.run) {
            this.cellTick();
            this.spawnTick();
            this.gamemodeTick();
            this.MasterPing();
        }

        // Update the client's maps
        this.updateClients();

        // Update cells/leaderboard loop
        this.tickMain++;
        if (this.tickMain >= 20) { // 1 Second
          this.cellUpdateTick();

            // Update leaderboard with the gamemode's method
            this.leaderboard = [];
            this.gameMode.updateLB(this);
            this.lb_packet = new Packet.UpdateLeaderboard(this.leaderboard,this.gameMode.packetLB);

            this.tickMain = 0; // Reset
        }

        // Check Bot Min Players
        var players = 0;
        this.clients.forEach(function(client) {
            if (client.playerTracker && !client.playerTracker.spectate)
                players++
        });
        if ( players < this.config.serverBots )
        {
            this.bots.addBot();
        }

        // Debug
        //console.log(this.tick - 50);

        // Auto Server Reset
        if( this.config.serverResetTime > 0 && ( local - this.startTime ) > ( this.config.serverResetTime * 3600000 ) )
        {
            this.exitserver();
        }

        // Reset
        this.tick = 0;
    }
};

GameServer.prototype.exitserver = function() {
    console.log("Server Shutdown!");
    if ( this.sqlconfig.host != '' )
    {
        this.mysql.connect();
		}
		this.socketServer.close();
		process.exit(1);
		window.close();		
}

GameServer.prototype.updateClients = function() {
    for (var i = 0; i < this.clients.length; i++) {
        if (typeof this.clients[i] == "undefined") {
            continue;
        }
        this.clients[i].playerTracker.update();
    }
};

GameServer.prototype.startingFood = function() {
    // Spawns the starting amount of food cells
    for (var i = 0; i < this.config.foodStartAmount; i++) {
        this.spawnFood();
    }
};

GameServer.prototype.updateFood = function() {
    var toSpawn = Math.min(this.config.foodSpawnAmount,(this.config.foodMaxAmount-this.currentFood));
    for (var i = 0; i < toSpawn; i++) {
        this.spawnFood();
    }
};

GameServer.prototype.spawnFood = function() {
    var f = new Entity.Food(this.getNextNodeId(), null, this.getRandomPosition(), Math.floor(Math.random() * this.config.foodMaxMass) + this.config.foodMass);
    f.setColor(this.getRandomColor());
    this.addNode(f);
    this.currentFood++;
};

GameServer.prototype.spawnPlayer = function(player,pos,mass) {
    if (pos == null) { // Get random pos
        pos = this.getRandomSpawn();//pos = this.getRandomPosition();
    }
    if (mass == null) { // Get starting mass
        mass = this.config.playerStartMass;
    }
    // Spawn player and add to world
    var cell = new Entity.PlayerCell(this.getNextNodeId(), player, pos, mass);

    if ( '_socket' in player.socket )
    {
        var zname = player.name;
        if ( zname === "" ) zname = "Un Named";
/*
 *       var packet = new Packet.BroadCast(zname + " joined the game!");
 *       for (var i = 0; i < this.clients.length; i++) {
 *           this.clients[i].sendPacket(packet);
 *       }
 */
        if( this.config.serverResetTime > 0 )
        {
            var packet = new Packet.BroadCast("Remember, This server auto restarts after " + this.config.serverResetTime  + " hours uptime!");
            player.socket.sendPacket(packet);
        }

        console.log( "\u001B[36m" + zname + " joined the game\u001B[0m");
    }

    this.addNode(cell);

    // Set initial mouse coords
    player.mouse = {x: pos.x, y: pos.y};
};

GameServer.prototype.virusCheck = function() {
    // Checks if there are enough viruses on the map
    if (this.nodesVirus.length < this.config.virusMinAmount) {
        // Spawns a virus
        var pos = this.getRandomPosition();
        var virusSquareSize = ( ( this.config.virusStartMass  ) * 110) >> 0;

        // Check for players
        for (var i = 0; i < this.nodesPlayer.length; i++) {
            var check = this.nodesPlayer[i];

            if (check.mass < this.config.virusStartMass) {
                continue;
            }

            // New way
            var squareR = check.getSquareSize(); // squared Radius of checking player cell
            var dx = check.position.x - pos.x;
            var dy = check.position.y - pos.y;
            if (dx * dx + dy * dy + virusSquareSize <= squareR)  return; // Collided
        }

        // Check for other virus
        for (var i = 0; i < this.nodesVirus.length; i++) {
            var check = this.nodesVirus[i];
            var squareR = check.getSquareSize();
            var dx = check.position.x - pos.x;
            var dy = check.position.y - pos.y;
            if (dx * dx + dy * dy + virusSquareSize <= squareR)  return; // Collided
        }

        // Spawn if no cells are colliding
        var v = new Entity.Virus(this.getNextNodeId(), null, pos, this.config.virusStartMass);
        this.addNode(v);
    }
};

GameServer.prototype.updateMoveEngine = function() {
    // Move player cells
    var len = this.nodesPlayer.length;
    for (var i = 0; i < len; i++) {
        var cell = this.nodesPlayer[i];

        // Do not move cells that have already been eaten or have collision turned off
        if (!cell) { //  || (cell.ignoreCollision)) {
            continue;
        }

        var client = cell.owner;

        cell.calcMove(client.mouse.x, client.mouse.y, this);

        // Check if cells nearby
        var list = this.getCellsInRange(cell);
        for (var j = 0; j < list.length ; j++) {
            var check = list[j];

            // if we're deleting from this.nodesPlayer, fix outer loop variables; we need to update its length, and maybe 'i' too
            if (check.cellType == 0) {
                len--;
                if (check.nodeId < cell.nodeId) {
                    i--;
                }
            }

            // Consume effect
            check.onConsume(cell,this);

            // Remove cell
            check.setKiller(cell);
            this.removeNode(check);
        }
    }

    // A system to move cells not controlled by players (ex. viruses, ejected mass)
    len = this.movingNodes.length;
    for (var i = 0; i < len; i++) {
        var check = this.movingNodes[i];

        // Recycle unused nodes
        while ((typeof check == "undefined") && (i < this.movingNodes.length)) {
            // Remove moving cells that are undefined
            this.movingNodes.splice(i, 1);
            check = this.movingNodes[i];
        }

        if (i >= this.movingNodes.length) {
            continue;
        }

        if (check.moveEngineTicks > 0) {
            check.onAutoMove(this);
            // If the cell has enough move ticks, then move it
            check.calcMovePhys(this.config);
        } else {
            // Auto move is done
            check.moveDone(this);
            // Remove cell from list
            var index = this.movingNodes.indexOf(check);
            if (index != -1) {
                this.movingNodes.splice(index, 1);
            }
        }
    }
};

GameServer.prototype.setAsMovingNode = function(node) {
    this.movingNodes.push(node);
};
GameServer.prototype.sendMSG = function(client,msg) {
	var packet = new Packet.BroadCast(msg);
            client.socket.sendPacket(packet);
}
GameServer.prototype.splitCells = function(client) {
    var len = client.cells.length;
    for (var i = 0; i < len; i++) {
        if (client.cells.length >= this.config.playerMaxCells) {
            // Player cell limit
            continue;
        }

        var cell = client.cells[i];
        if (!cell) {
            continue;
        }

        if (cell.mass < this.config.playerMinMassSplit) {
            continue;
        }

        // Get angle
        var deltaY = client.mouse.y - cell.position.y;
        var deltaX = client.mouse.x - cell.position.x;
        var angle = Math.atan2(deltaX,deltaY);

        // Get starting position
        var size = cell.getSize()/2;
        var startPos = {
            x: cell.position.x + ( size * Math.sin(angle) ),
            y: cell.position.y + ( size * Math.cos(angle) )
        };
        // Calculate mass and speed of splitting cell
       // Calculate mass and speed of splitting cell
        var splitSpeed = cell.getSpeed() * this.config.playerSplitSpeedMultiplier;
        var newMass = cell.mass / 2;
        cell.mass = newMass;
        // Create cell
        var split = new Entity.PlayerCell(this.getNextNodeId(), client, startPos, newMass);
        split.setAngle(angle);
        split.setMoveEngineData(splitSpeed, 32, 0.85);
        split.calcMergeTime(this.config.playerRecombineTime);
		if(this.config.playerSmoothSplit) {
		split.ignoreCollision = true;
        split.restoreCollisionTicks = 8;
		}
        // split.owner.name = client.owner.name;

        // Add to moving cells list
        this.addNode(split); // moved this here,. to see if it needs be aded, before move...
        this.setAsMovingNode(split);
    }
};

GameServer.prototype.ejectMass = function(client) {
    for (var i = 0; i < client.cells.length; i++) {
        var cell = client.cells[i];

        if (!cell) {
            continue;
        }

        if (cell.mass < this.config.playerMinMassEject) {
            continue;
        }

        var deltaY = client.mouse.y - cell.position.y;
        var deltaX = client.mouse.x - cell.position.x;
        var angle = Math.atan2(deltaX,deltaY);

        // Get starting position
        var size = cell.getSize() + 5;
        var startPos = {
            x: cell.position.x + ( (size + this.config.ejectMass) * Math.sin(angle) ),
            y: cell.position.y + ( (size + this.config.ejectMass) * Math.cos(angle) )
        };

        // Remove mass from parent cell
        cell.mass -= this.config.ejectMassLoss;
        // Randomize angle
        angle += (Math.random() * .4) - .2;

        // Create cell
        var ejected = new Entity.EjectedMass(this.getNextNodeId(), null, startPos, this.config.ejectMass);
        ejected.setAngle(angle);
        ejected.setMoveEngineData(this.config.ejectSpeed, 20);
        ejected.setColor(cell.getColor());

        this.addNode(ejected);
        this.setAsMovingNode(ejected);
    }
};

GameServer.prototype.newCellVirused = function(client, parent, angle, mass, speed) {
    // Starting position
    var startPos = {
        x: parent.position.x,
        y: parent.position.y
    };

    // Create cell
    newCell = new Entity.PlayerCell(this.getNextNodeId(), client, startPos, mass);
    newCell.setAngle(angle);
    newCell.setMoveEngineData(speed * this.config.playerPopsplitSpeed, 15);
    newCell.calcMergeTime(this.config.playerRecombineTime);
    newCell.ignoreCollision = true;  // Turn off collision

    // Add to moving cells list
    this.addNode(newCell);
    this.setAsMovingNode(newCell);
};

GameServer.prototype.shootVirus = function(parent) {
    var parentPos = {
        x: parent.position.x,
        y: parent.position.y,
    };

    var newVirus = new Entity.Virus(this.getNextNodeId(), null, parentPos, this.config.virusStartMass);
    newVirus.setAngle(parent.getAngle());
    newVirus.setMoveEngineData(200, 20);

    // Add to moving cells list
    this.addNode(newVirus);
    this.setAsMovingNode(newVirus);
};

GameServer.prototype.getCellsInRange = function(cell) {
    var list = new Array();
	var squareR = cell.getSquareSize(); // Get cell squared radius
	/*var r = 85;
	 var topY = cell.position.y - r;
    var bottomY = cell.position.y + r;
	
    var leftX = cell.position.x - r;
    var rightX = cell.position.x + r;*/

    // Loop through all cells that are visible to the cell. There is probably a more efficient way of doing this but whatever
    var len = cell.owner.visibleNodes.length;
    for (var i = 0;i < len;i++) {
        var check = cell.owner.visibleNodes[i];

        if (typeof check === 'undefined') {
            continue;
        }

        // if something already collided with this cell, don't check for other collisions
        if (check.inRange) {
            continue;
        }

        // Can't eat itself
        if (cell.nodeId == check.nodeId) {
            continue;
        }

        // Can't eat cells that have collision turned off
        if ((cell.owner == check.owner) && (cell.ignoreCollision)) {
            continue;
        }

        // AABB Collision
       /* if (!check.collisionCheck(bottomY,topY,rightX,leftX)) {
            continue;
        }*/
		if (!check.collisionCheck2(squareR, cell.position)) {
            continue;
        }

        // Cell type check - Cell must be bigger than this number times the mass of the cell being eaten
        var multiplier = 1.25;

        switch (check.getType()) {
            case 1: // Food cell
                list.push(check);
                check.inRange = true; // skip future collision checks for this food
                continue;
            case 2: // Virus
                multiplier = 1.33;
                break;
            case 0: // Players
                // Can't eat self if it's not time to recombine yet
                if (check.owner == cell.owner) {
                    if ((cell.recombineTicks > 0) || (check.recombineTicks > 0)) {
                        continue;
                    }

                    multiplier = 1.00;
                }

                // Can't eat team members
                if (this.gameMode.haveTeams) {
                    if (!check.owner) { // Error check
                        continue;
                    }

                    if ((check.owner != cell.owner) && (check.owner.getTeam() == cell.owner.getTeam())) {
                        continue;
                    }
                }
                break;
            default:
                break;
        }

        // Make sure the cell is big enough to be eaten.
        if ((check.mass * multiplier) > cell.mass) {
            continue;
        }

        // Eating range
        var xs = Math.pow(check.position.x - cell.position.x, 2);
        var ys = Math.pow(check.position.y - cell.position.y, 2);
        var dist = Math.sqrt( xs + ys );

        var eatingRange = cell.getSize() - check.getEatingRange(); // Eating range = radius of eating cell + 40% of the radius of the cell being eaten
        if (dist > eatingRange) {
            // Not in eating range
            continue;
        }

        // Add to list of cells nearby
        list.push(check);

        // Something is about to eat this cell; no need to check for other collisions with it
        check.inRange = true;
    }
    return list;
};

GameServer.prototype.getNearestVirus = function(cell) {
    // More like getNearbyVirus
    var virus = null;
    var r = 100; // Checking radius

    var topY = cell.position.y - r;
    var bottomY = cell.position.y + r;

    var leftX = cell.position.x - r;
    var rightX = cell.position.x + r;

    // Loop through all viruses on the map. There is probably a more efficient way of doing this but whatever
    var len = this.nodesVirus.length;
    for (var i = 0;i < len;i++) {
        var check = this.nodesVirus[i];

        if (typeof check === 'undefined') {
            continue;
        }

        if (!check.collisionCheck(bottomY,topY,rightX,leftX)) {
            continue;
        }

        // Add to list of cells nearby
        virus = check;
        break; // stop checking when a virus found
    }
    return virus;
};

GameServer.prototype.updateCells = function() {
    if (!this.run) {
        // Server is paused
        return;
    }

    // Loop through all player cells
    var massDecay = 1 - (this.config.playerMassDecayRate * this.gameMode.decayMod);
    for (var i = 0; i < this.nodesPlayer.length; i++) {
        var cell = this.nodesPlayer[i];

        if (!cell) {
            continue;
        }

        if (cell.recombineTicks > 0) {
            // Recombining
            cell.recombineTicks--;
        }

        // Mass decay
        if (cell.mass >= this.config.playerMinMassDecay) {
            cell.mass *= massDecay;
        }
    }
};

GameServer.prototype.loadConfig = function() {
    try {
        // Load the contents of the config file
        var load = ini.parse(fs.readFileSync('./app/gameserver.ini', 'utf-8'));

        for (var obj in load) {
            if ( obj.substr(0,2) != "//" ) this.config[obj] = load[obj];
        }
    } catch (err) {
        console.log("\u001B[33mConfig not found... Generating new config\u001B[0m");
        // Create a new config
        fs.writeFileSync('./app/gameserver.ini', ini.stringify(this.config));
    }

    try {
        // Load the contents of the mysql config file
        var load = ini.parse(fs.readFileSync('./mysql.ini', 'utf-8'));
        for (var obj in load) {
            if ( obj.substr(0,2) != "//" ) this.sqlconfig[obj] = load[obj];
        }
    } catch (err) {
        // Noting to do...
    }
};

GameServer.prototype.switchSpectator = function(player) {
    var zname = player.name;
    if ( zname === "" ) zname = "Client";
    console.log("\u001B[35m" + zname  +" joined spectators\u001B[0m" );

    if (this.gameMode.specByLeaderboard) {
        player.spectatedPlayer++;
        if (player.spectatedPlayer == this.leaderboard.length) {
            player.spectatedPlayer = 0;
        }
    } else {
        // Find next non-spectator with cells in the client list
        var oldPlayer = player.spectatedPlayer + 1;
        var count = 0;
        while (player.spectatedPlayer != oldPlayer && count != this.clients.length) {
            if (oldPlayer == this.clients.length) {
                oldPlayer = 0;
                continue;
            }
            if (!this.clients[oldPlayer]) {
                // Break out of loop in case client tries to spectate an undefined player
                player.spectatedPlayer = -1;
                break;
            }
            if (this.clients[oldPlayer].playerTracker.cells.length > 0) {
                break;
            }
            oldPlayer++;
            count++;
        }
        if (count == this.clients.length) {
            player.spectatedPlayer = -1;
        } else {
            player.spectatedPlayer = oldPlayer;
        }
    }
};

GameServer.prototype.MasterPing = function() {
    try {
    fs.renameSync('./client/api/stats.txt', './client/api/stats.txt.bak');
    fs.appendFileSync('./client/api/stats.txt',String(this.stats));
    } catch(error) {
        fs.appendFileSync('./client/api/stats.txt',String(this.stats));
    }
}

// Stats server
GameServer.prototype.startStatsServer = function(port) {
    // Do not start the server if the port is negative
    if (port < 1) {
        return;
    }

    // Create stats
    this.stats = "Test";
    this.getStats();

    // Show stats
    this.httpServer = http.createServer(function(req, res) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.writeHead(200);
        res.end(this.stats);
    }.bind(this));

    this.httpServer.listen(port, function() {
        // Stats server
        console.log("* \u001B[33mLoaded stats server on port " + port + "\u001B[0m");
        setInterval(this.getStats.bind(this), this.config.serverStatsUpdate * 1000);
    }.bind(this));
}

GameServer.prototype.getStats = function() {
    for(var i=0, humans=0, bots=0, players=0, spectate=0, client; i<this.clients.length; i++)
        client = this.clients[i].playerTracker, -1 == client.disconnect && ("_socket"in this.clients[i] ? client.spectate ? spectate++:humans++:bots++,players++);

    var s = {
        'current_players': players,
        'alive': humans,
        'spectators': spectate,
        'max_players': this.config.serverMaxConnections,
        'gamemode': this.gameMode.name,
        'start_time': this.startTime,
        'title': this.config.serverName
    };
    this.stats = JSON.stringify(s);
};

WebSocket.prototype.sendPacket = function(packet) {
    // Send only if the buffer is empty
    if (this.readyState == WebSocket.OPEN && (this._socket.bufferSize == 0)) {
        try {
            this.send(packet.build(), {binary: true});
        } catch (e) {
            // console.log("\u001B[31m[Socket Error] " + e + "\u001B[0m");
        }
    } else {
        // Remove socket
        this.emit('close');
        this.removeAllListeners();
    }
};
