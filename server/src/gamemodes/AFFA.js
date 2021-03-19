var FFA = require('./FFA'); // Base gamemode


function AFFA() {
  FFA.apply(this, Array.prototype.slice.call(arguments));

  this.ID = 9;
  this.name = "Anonymous FFA";
  this.specByLeaderboard = true;
}



module.exports = AFFA;
Experimental.prototype = new FFA();

AFFA.prototype.onServerInit = function (gameServer) {
  gameServer.lleaderboard = true
  gameServer.config.randomnames = 1;
  gameServer.config.allowChat = 0;
};
