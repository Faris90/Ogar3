module.exports = function (gameServer, split) {
  if (split[1] == "destroy") {
    gameServer.destroym = true;
    for (var i in gameServer.clients) {
      if (gameServer.clients[i]) {
        var client = gameServer.clients[i];
        if (client.owner && !client.socket.remoteAddress) {
          client.socket.close();
        } else {
        
        gameServer.clients[i].playerTracker.minioncontrol = false;
        }

      }
    }
    console.log("[Console] Succesfully destroyed all minions");
    return;
  }
  var id = parseInt(split[1]);
  var name = split[3];
  var add = parseInt(split[2]);
  gameServer.minion = true;

  if (isNaN(id)) {
    console.log("[Console] Please specify a valid id!");
    return;
  }
  if (!name) {
    name = "minion";
  }


  for (var i in gameServer.clients) {
    if (gameServer.clients[i].playerTracker.pID == id) {
      var client = gameServer.clients[i].playerTracker;
      if (client.minioncontrol == true && isNaN(add)) {
        client.minioncontrol = false;
        client.mi = 0;
        if (client.oldname) client.name = client.oldname;
        console.log("[Console] Succesfully removed minions for " + client.name);
      } else {


        if (isNaN(add)) {
          add = 1; // Adds 1 bot if user doesnt specify a number
        }
        gameServer.destroym = false;
        gameServer.livestage = 2;
        gameServer.liveticks = 0;
        client.minioncontrol = true;
        for (var i = 0; i < add; i++) {
          gameServer.minions.addBot(client, name);
        }
        console.log("[Console] Succesfully added " + add + " minions for " + client.name);
      }
      break;
    }
  }
};
