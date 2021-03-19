'use strict';
var Mode = require('./Mode');
var FFA = require('./FFA'); // Base gamemode
function unlimitffa() {
 FFA.apply(this, Array.prototype.slice.call(arguments));

  this.ID = 6;
  this.name = "UnlimitFFA";
  this.specByLeaderboard = true;
}

module.exports = unlimitffa;
unlimitffa.prototype = new FFA();

// Gamemode Specific Functions
unlimitffa.prototype.onServerInit = function (gameServer) {
    gameServer.config.playerMaxCells = 64;
    gameServer.config.playerRecombineTime = 0;
    gameServer.config.playerFastDecay = 0;
    gameServer.config.fastdecayrequire = 9000;
    gameServer.config.FDmultiplyer = 2;
    gameServer.config.playerSpeed = 40;
    gameServer.config.splitSpeed = 82;
    gameServer.config.playerMinMassSplit = 10;
    gameServer.lleaderboard = true;
};

