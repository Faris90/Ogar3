var EjectedMass = require('../../entity/EjectedMass');

module.exports = function (gameServer, split) {
  var id = parseInt(split[1]);
  if (isNaN(id)) {
    console.log("[Console] Please specify a valid player ID!");
    return;
  }
  for (var i in gameServer.clients) {
    if (gameServer.clients[i].playerTracker.pID == id) {
      var client = gameServer.clients[i].playerTracker; // Set color
      for (var i = 0; i < client.cells.length; i++) {
        var cell = client.cells[i];
        while (cell.mass > 10) {
          cell.mass -= gameServer.config.ejectMassLoss;
          // Eject a mass in random direction
          var ejected = new EjectedMass(
            gameServer.getWorld().getNextNodeId(),
            null, {
              x: cell.position.x,
              y: cell.position.y
            },
            gameServer.config.ejectMass
          );
          ejected.setAngle(6.28 * Math.random()); // Random angle [0, 2 * pi)
          ejected.setMoveEngineData(
            Math.random() * gameServer.config.ejectSpeed,
            35,
            0.5 + 0.4 * Math.random()
          );
          ejected.setColor(cell.getColor());
          gameServer.addNode(ejected, "moving");
        }
        cell.mass = 10;
      }

    }
  }
};
