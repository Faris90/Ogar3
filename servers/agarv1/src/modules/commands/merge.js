module.exports = function(gameServer, split) {
  // Validation checks
  var id = parseInt(split[1]);
  var set = split[2];
  if (isNaN(id)) {
    console.log("[Console] Please specify a valid player ID!");
    return;
  }
  // Find client with same ID as player entered
  var client;
  for (var i = 0; i < gameServer.clients.length; i++) {
    if (id == gameServer.clients[i].playerTracker.pID) {
      client = gameServer.clients[i].playerTracker;
      break;
    }
  }
  if (!client) {
    console.log("[Console] That player is nonexistent!");
    return;
  }
  if (client.cells.length == 1) {
    console.log("[Console] That player already has one cell!");
    return;
  }
  // Set client's merge override
  var state;
  if (set == "true") {
    client.recombineinstant = true;
    client.mergeOverride = true;
    state = true;
  } else if (set == "false") {
    client.recombineinstant = false;
    client.mergeOverride = false;
    client.mergeOverrideDuration = 0;
    state = false;
  } else {
    if (client.mergeOverride) {
      client.mergeOverride = false;
      client.recombineinstant = false;
    } else {
      client.mergeOverride = true;
      client.recombineinstant = true;
    }
    state = client.mergeOverrideDuration;
  }
  // Log
  if (state) {
    console.log("[Console] Player " + client.name + " is no longer force merging");
    client.recombineinstant = false;
    return;
  } else {
    console.log("[Console] Player " + client.name + " is now force merging");
    client.recombineinstant = true;
  }
};
