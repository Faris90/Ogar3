'use strict';
var FFA = require('./FFA'); // Base gamemode
var Food = require('../entity/Food');
var FoodUp = require('../entity/Food').prototype.sendUpdate;

function Rainbow() {
  FFA.apply(this, Array.prototype.slice.call(arguments));
  this.ID = 20;
  this.name = "Rainbow FFA";
  this.specByLeaderboard = true;
  this.tticks = 0;
}

module.exports = Rainbow;
Rainbow.prototype = new FFA();

// Gamemode Specific Functions
Rainbow.prototype.onServerInit = function(gameServer) {
  Food.prototype.sendUpdate = function() {
    return true;
  };
  gameServer.lleaderboard = true;
  gameServer.config.rainbowMode = 1;
};

Rainbow.prototype.onChange = function() {
  // Reset
  Food.prototype.sendUpdate = FoodUp;
};
