var Entity = require('../../entity');

module.exports = function (gameServer, split) {
  var pos = {
    x: parseInt(split[1]),
    y: parseInt(split[2])
  };
  var mass = parseInt(split[3]);

  // Make sure the input values are numbers
  if (isNaN(pos.x) || isNaN(pos.y)) {
    console.log("[Console] Invalid coordinates");
    return;
  }

  if (isNaN(mass)) {
    mass = gameServer.config.foodStartMass;
  }

  // Spawn
  var f = new Entity.Food(gameServer.getWorld().getNextNodeId(), null, pos, mass, gameServer);
  f.setColor(gameServer.getRandomColor());
  gameServer.addNode(f);
  gameServer.currentFood++;
  console.log("[Console] Spawned 1 food cell at (" + pos.x + " , " + pos.y + ")");
};
