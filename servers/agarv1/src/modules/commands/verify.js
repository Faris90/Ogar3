module.exports = function (gameServer, split) {
  var c = "";
  if (split[1]) var c = split[1].toLowerCase();
  var id = parseInt(split[2]);
  if (c == "verify") {
    if (isNaN(id)) {
      console.log("[Console] Please specify a valid id!");
      return;
    }
    for (var i in gameServer.clients) {
      if (gameServer.clients[i].playerTracker.pID == id) {
        var client = gameServer.clients[i].playerTracker;

        client.verify = true;
        client.tverify = false;
        console.log("[Console] Verified Player " + id);
        break;
      }


    }
  } else if (c == "reverify") {
    if (isNaN(id)) {
      console.log("[Console] Please specify a valid id!");
      return;
    }
    for (var i in gameServer.clients) {
      if (gameServer.clients[i].playerTracker.pID == id) {
        var client = gameServer.clients[i].playerTracker;

        client.verify = false;
        client.tverify = false;
        var len = client.cells.length;
        for (var j = 0; j < len; j++) {
          gameServer.removeNode(client.cells[0]);
          count++;
        }
        console.log("[Console] Made Player " + id + " Reverify");
        break;
      }


    }

  } else {
    console.log("[Console] Plese specify a command, Verify or reverify!");

  }


};
