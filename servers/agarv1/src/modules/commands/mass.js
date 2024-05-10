module.exports = function(gameServer, split) {
  // Validation checks
  var id = parseInt(split[1]);
  if (isNaN(id)) {
    console.log("[Console] Please specify a valid player ID!");
    return;
  }

  var amount = Math.max(parseInt(split[2]), 10);
  if (isNaN(amount)) {
    console.log("[Console] Please specify a valid number");
    return;
  }

  // Sets mass to the specified amount
  for (var i in gameServer.clients) {
    if (gameServer.clients[i].playerTracker.pID == id) {
      var client = gameServer.clients[i].playerTracker;
      for (var j in client.cells) {
        client.cells[j].mass = amount;
      }

      if (client.name.length == 0) {
        console.log("[Console] Set mass of An unnamed cell to " + amount);
        break;
      } else {
        console.log("[Console] Set mass of " + client.name + " to " + amount);
        break;
      }
    }
  }
};
