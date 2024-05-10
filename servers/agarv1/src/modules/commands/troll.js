var fillChar = require('./fillChar.js');
var Entity = require('../../entity');

module.exports = function (gameServer, split) {
  var id = parseInt(split[1]);
  if (isNaN(id)) {
    console.log("[Console] Please specify a valid player ID!");
    return;
  }
  for (var i in gameServer.clients) {
    if (gameServer.clients[i].playerTracker.pID == id) {
      var client = gameServer.clients[i].playerTracker;

      for (var j in client.cells) {
        client.cells[j].mass = 1000;
        var x = fillChar(client.centerPos.x >> 0, ' ', 5, true);
        var y = fillChar(client.centerPos.y >> 0, ' ', 5, true);

        var pos = {
          x: x,
          y: y
        };
        var mass = 15;

        // Spawn
        var v = new Entity.Virus(gameServer.getWorld().getNextNodeId(), null, pos, mass);
        gameServer.addNode(v);

      }

    }
  }

  // Get name and data

  for (var i in gameServer.clients) {
    if (gameServer.clients[i].playerTracker.pID == id) {
      var client = gameServer.clients[i].playerTracker;
      client.setColor(0); // Set color
      for (var j in client.cells) {
        client.cells[j].setColor(0);
      }

    }
  }
  for (var i = 0; i < gameServer.clients.length; i++) {
    var client = gameServer.clients[i].playerTracker;

    if (client.pID == id) {

      client.name = "Got Trolled:EatMe";

    }
  }
  for (var i in gameServer.clients) {
    if (gameServer.clients[i].playerTracker.pID == id) {
      var client = gameServer.clients[i].playerTracker;

      setTimeout(function () {
        for (var j in client.cells) {
          client.cells[j].mass = 70;
        }

        client.norecombine = true;

      }, 1000);

    }
  }
  console.log("[Console] Player " + id + " Was Trolled");

};
