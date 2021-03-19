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
// Project imports
var BotPlayer = require('./MinionPlayer');
var FakeSocket = require('./minionSocket');
var PacketHandler = require('../core/PacketHandler');

function MinionLoader(gameServer) {
  this.gameServer = gameServer;
  this.loadNames();
}

module.exports = MinionLoader;

// todo bad constructor name?
MinionLoader.prototype.getName = function () {
  return this.gameServer.minionname;
};

MinionLoader.prototype.loadNames = function () {
  this.randomNames = [];

  // Load names
  try {
    var fs = require("fs"); // Import the util library

    // Read and parse the names - filter out whitespace-only names
    // fs.readFileSync is only used during server start
    this.randomNames = fs.readFileSync("./botnames.txt", "utf8").split(/[\r\n]+/).filter(function (x) {
      return x != ''; // filter empty names
    });
  } catch (e) {
    // Nothing, use the default names
  }

  this.nameIndex = 0;
};

MinionLoader.prototype.addBot = function (owner, name, arg) {
  var fakeSocket = new FakeSocket(this.gameServer);
  fakeSocket.playerTracker = new BotPlayer(this.gameServer, fakeSocket, owner);
  fakeSocket.packetHandler = new PacketHandler(this.gameServer, fakeSocket);

for (var i in this.gameServer.plugins) {
    var plugin = this.gameServer.plugins[i];
        if (plugin.onaddminion && plugin.name && plugin.author && plugin.version) {
          try {
          plugin.onaddminion(this.gameServer, fakeSocket, arg, this);
          } catch (e) {
            
            throw e;
          }
        }
  }
  // Add to client list
  this.gameServer.clients.push(fakeSocket);
  if (!name || typeof name == "undefined") name = "minion";
  // Add to world
  fakeSocket.packetHandler.setNickname(name);
  
  
};
