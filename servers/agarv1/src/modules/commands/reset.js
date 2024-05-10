'use strict';
// todo this needs review
module.exports = function (gameServer, split) {
  var nodes = gameServer.getWorld().getNodes().toArray();
  for (let i = 0; i < nodes.length; i++) {
    gameServer.removeNode(nodes[i])
    
  } 
  gameServer.getWorld().clearAll();
  console.log("[Console] Reset the game");
};
