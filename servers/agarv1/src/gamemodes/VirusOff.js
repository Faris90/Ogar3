'use strict';
var FFA = require('./FFA'); // Base gamemode

function VirusOff() {
  FFA.apply(this, Array.prototype.slice.call(arguments));

  this.ID = 4;
  this.name = "Virus Off";
  this.specByLeaderboard = true;
}

module.exports = VirusOff;
VirusOff.prototype = new FFA();

// Gamemode Specific Functions
VirusOff.prototype.onServerInit = function (gameServer) {
  gameServer.lleaderboard = true;
  gameServer.spawnv = 0;

};
