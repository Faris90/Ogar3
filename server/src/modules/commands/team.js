module.exports = function (gameServer, split) {
  var id = parseInt(split[1]);
  var team = split[2];
  var tteam = 0;
  var colors = [{
    'r': 223,
    'g': 0,
    'b': 0
  }, {
    'r': 0,
    'g': 223,
    'b': 0
  }, {
    'r': 0,
    'g': 0,
    'b': 223
  },];
  if (team) {
    if (team == "r") {
      tteam = 0;
    }
    if (team == "g") {
      tteam = 1;
    }
    if (team == "b") {
      tteam = 2;
    }

  } else {
    console.log("[Console] Please specify a team (r,g,b)");
    return;
  }
  if (isNaN(id)) {
    console.log("[Console] Please specify a valid player ID!");
    return;
  }

  for (var i in gameServer.clients) {
    if (gameServer.clients[i].playerTracker.pID == id) {
      var client = gameServer.clients[i].playerTracker;

      client.team = tteam;
      client.setColor(colors[tteam]); // Set color
      for (var j in client.cells) {
        client.cells[j].setColor(colors[tteam]);
      }

      console.log("[Console] Successively changed the players team");
      break;
    }
  }

};
