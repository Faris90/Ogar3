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
// Project imports
var BotPlayer = require('./BotPlayer');
var FakeSocket = require('./FakeSocket');
var PacketHandler = require('../core/PacketHandler');
var fs = require("fs"); // Import the util library

function BotLoader(gameServer) {
  this.gameServer = gameServer;
  this.loadNames();
}

module.exports = BotLoader;

BotLoader.prototype.getName = function () {
  var name = "";
  if (this.gameServer.config.botrealnames == 1) {
    if (this.realrandomNames.length > 0) {
      var index = Math.floor(Math.random() * this.realrandomNames.length);
      name = this.realrandomNames[index];
      this.realrandomNames.splice(index, 1);
    } else {
      name = "bot" + ++this.nameIndex;
      this.loadNames();
    }

  } else {
    // Picks a random name for the bot
    if (this.randomNames.length > 0) {
      var index = Math.floor(Math.random() * this.randomNames.length);
      name = this.randomNames[index];
      this.randomNames.splice(index, 1);
    } else {
      name = "bot" + ++this.nameIndex;
      this.loadNames();
    }
  }

  return name;
};

BotLoader.prototype.loadNames = function () {
  this.randomNames = [];
  this.realrandomNames = [];

  // Load names
  try {
        var fs = require("fs"); // Import the util library
        var path = require("path");
  } catch (e) {/* Nothing, use the default names */
  }
  // Read and parse the names - filter out whitespace-only names - fs.readFileSync is only used during server start
  try {
    this.realrandomNames = fs.readFileSync(path.join(__dirname, '../', 'realisticnames.txt'), "utf8").split(/[\r\n]+/).filter(function (x) {
      return x != ''; // filter empty names
    });
  } catch (e) {/* Nothing, use the default names */
  }
  // Read and parse the names - filter out whitespace-only names - fs.readFileSync is only used during server start
  try {
    this.randomNames = fs.readFileSync(path.join(__dirname, '../', 'botnames.txt'), "utf8").split(/[\r\n]+/).filter(function(x) {
      return x != ''; // filter empty names
    });
  } catch (e) {/* Nothing, use the default names */
  }

  this.nameIndex = 0;
};

BotLoader.prototype.addBot = function (arg) {
  let s = new FakeSocket(this.gameServer);
  s.playerTracker = new BotPlayer(this.gameServer, s);
  s.packetHandler = new PacketHandler(this.gameServer, s);
  // Add to client list
  for (var i in this.gameServer.plugins) {
    var plugin = this.gameServer.plugins[i];
        if (plugin.onaddbot && plugin.name && plugin.author && plugin.version) {
          try {
          plugin.onaddbot(this.gameServer, s, arg, this);
          } catch (e) {
            
            throw e;
          }
        }
  }
  this.gameServer.addClient(s);

  // Add to world
  s.packetHandler.setNickname(this.getName());
  
  
};
