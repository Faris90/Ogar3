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
  // If the virus mass was not specified, spawn it with the default mass value.
  if (isNaN(mass)) {
    mass = gameServer.config.virusStartMass;
  }

  // Spawn
  var v = new Entity.Virus(gameServer.getWorld().getNextNodeId(), null, pos, mass);
  gameServer.addNode(v);
  console.log("[Console] Spawned 1 virus at coordinates (" + pos.x + " , " + pos.y + ") with a mass of " + mass + " ");
};
