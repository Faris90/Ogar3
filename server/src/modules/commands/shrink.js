'use strict';
module.exports = function (gameServer, split) {
  let borderDec = split[1];
  if (isNaN(borderDec)) {
    borderDec = 200;
  }
  gameServer.config.borderLeft += borderDec;
  gameServer.config.borderRight -= borderDec;
  gameServer.config.borderTop += borderDec;
  gameServer.config.borderBottom -= borderDec;

  gameServer.getWorld().getNodes().forEach((node)=> {
    if ((!node) || (node.getType() == 0)) return;

    // Move
    if (node.position.x < gameServer.config.borderLeft) {
      gameServer.removeNode(node);
    } else if (node.position.x > gameServer.config.borderRight) {
      gameServer.removeNode(node);
    } else if (node.position.y < gameServer.config.borderTop) {
      gameServer.removeNode(node);
    } else if (node.position.y > gameServer.config.borderBottom) {
      gameServer.removeNode(node);
    }
  });

  console.log("[Console] Successivly shrinked game. Size: " + (gameServer.config.borderRight - gameServer.config.borderLeft) + "," + (gameServer.config.borderBottom - gameServer.config.borderTop));

};
