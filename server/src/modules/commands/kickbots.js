'use strict';
module.exports = function (gameServer, split) {
  let toRemove = parseInt(split[1]);
  toRemove = isNaN(toRemove) ? -1 : toRemove;
  let removed = gameServer.kickBots(toRemove);

  if (toRemove == -1) {
    console.log("[Console] Kicked all bots (" + removed + ")");
    return;
  }
gameServer.sbo -= removed;
  console.log("[Console] Kicked " + toRemove + " bots");
  return;
};
