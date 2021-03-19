module.exports = function(gameServer, split) {
  // Validation checks
  var id = parseInt(split[1]);
  if (isNaN(id)) {
    console.log("[Console] Please specify a valid player ID!");
    return;
  }

  var color = {
    r: 0,
    g: 0,
    b: 0
  };
  color.r = Math.max(Math.min(parseInt(split[2]), 255), 0);
  color.g = Math.max(Math.min(parseInt(split[3]), 255), 0);
  color.b = Math.max(Math.min(parseInt(split[4]), 255), 0);

  // Sets color to the specified amount
  for (var i in gameServer.clients) {
    if (gameServer.clients[i].playerTracker.pID == id) {
      var client = gameServer.clients[i].playerTracker;
      client.setColor(color); // Set color
      for (var j in client.cells) {
        client.cells[j].setColor(color);
      }
      if (client.name.length == 0) {
        console.log("Set the color of An unnamed cell to " + color.r + ", " + color.g + ", " + color.b);
        break;
      } else {
        console.log("Set the color of " + client.name + " to " + color.r + ", " + color.g + ", " + color.b);
        break;
      }
    }
  }
};
