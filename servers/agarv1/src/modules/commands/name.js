module.exports = function(gameServer, split) {
  // Validation checks
  var id = parseInt(split[1]);
  if (isNaN(id)) {
    console.log("[Console] Please specify a valid player ID!");
    return;
  }

  var name = split.slice(2, split.length).join(' ');
  if (typeof name == 'undefined') {
    console.log("[Console] Please type a valid name");
    return;
  }
  var premium = "";
  if (name.substr(0, 1) == "<") {
    // Premium Skin
    var n = name.indexOf(">");
    if (n != -1) {

      premium = '%' + name.substr(1, n - 1);
      for (var i in gameServer.skinshortcut) {
        if (!gameServer.skinshortcut[i] || !gameServer.skin[i]) {
          continue;
        }
        if (name.substr(1, n - 1) == gameServer.skinshortcut[i]) {
          premium = gameServer.skin[i];
          break;
        }

      }
      name = name.substr(n + 1);

    }
  } else if (name.substr(0, 1) == "[") {
    // Premium Skin
    var n = name.indexOf("]");
    if (n != -1) {

      premium = ':http://' + name.substr(1, n - 1);
      name = name.substr(n + 1);
    }
  }

  // Change name
  for (var i = 0; i < gameServer.clients.length; i++) {
    var client = gameServer.clients[i].playerTracker;
    if (client.name.length == 0) {
      if (client.pID == id) {
        if (premium) {
          client.premium = premium;
          console.log("[Console] Changing An unnamed cell's skin to " + premium);
        }
        if (name.length > 0) {
          console.log("[Console] Changing An unnamed cell to " + name);
          client.name = name;
        }
        return;
      }
    }
    if (client.pID == id) {
      if (premium) {
        client.premium = premium;
        console.log("[Console] Changing " + client.name + "'s skin to " + premium);
      }
      if (name.length > 0) {
        console.log("[Console] Changing " + client.name + " to " + name);
        client.name = name;
      }
      return;
    }
  }

  // Error
  console.log("[Console] Player " + id + " was not found");
};
