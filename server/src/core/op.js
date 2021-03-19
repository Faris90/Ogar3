/*
Proverbs 20:18:
   Bread obtained by falsehood is sweet to a man, But afterward his mouth will be filled with gravel.

We worked really hard for this project. Although we dont care if you enhance it and publish, we would care
if you copy it and claim our work as your own. Although it might feel good, to take the credit, you would ultimatly
regret it. But please feel free to change the files and publish putting your name up as well as ours.
We will also not get into legalities. but please dont take advantage that we dont use
legalities. Instead, treat us with respect like we treat you. 

Sincerely
The AJS Dev Team.

*/

// todo seems a bit buggy, some times crashes the server silently

var Entity = require('../entity');

function Op() {

}

module.exports = Op;
Op.prototype.pressT = function (gameServer, player) {
    for (var i in gameServer.plugins) {
        if (gameServer.plugins[i].beforet && gameServer.plugins[i].name && gameServer.plugins[i].author && gameServer.plugins[i].version) {
          if (!gameServer.plugins[i].beforet(player)) return;
        }
      }
      player.ft = !player.ft;
  for (var i in gameServer.clients) {
      var client = gameServer.clients[i].playerTracker;
      if ((typeof gameServer.clients[i].remoteAddress == 'undefined') && client.cells && client.owner == player) {
        client.frozen = player.ft;
      }
    }
}  

Op.prototype.pressE = function (gameServer, player) {
  for (var i in gameServer.plugins) {
        if (gameServer.plugins[i].beforee && gameServer.plugins[i].name && gameServer.plugins[i].author && gameServer.plugins[i].version) {
          if (!gameServer.plugins[i].beforee(player)) return;
        }
      }
      if (gameServer.config.useER == 1) {
        for (var i in gameServer.clients) {
      var client = gameServer.clients[i].playerTracker;
      if ((typeof gameServer.clients[i].remoteAddress == 'undefined') && client.cells && client.owner == player) {
        gameServer.splitCells(client);
      }
    }
        
      }
      
};
Op.prototype.pressR = function (gameServer, player) {
  for (var i in gameServer.plugins) {
        if (gameServer.plugins[i].beforer && gameServer.plugins[i].name && gameServer.plugins[i].author && gameServer.plugins[i].version) {
          if (!gameServer.plugins[i].beforer(player)) return;
        }
      }
       if (gameServer.config.useER == 1) {
        for (var i in gameServer.clients) {
      var client = gameServer.clients[i].playerTracker;
      if ((typeof gameServer.clients[i].remoteAddress == 'undefined') && client.cells && client.owner == player) {
       gameServer.ejectMass(client);
      }
    }
        
      }
      
};
Op.prototype.pressQ = function (gameServer, player) {
for (var i in gameServer.plugins) {
        if (gameServer.plugins[i].beforeq && gameServer.plugins[i].name && gameServer.plugins[i].author && gameServer.plugins[i].version) {
          if (!gameServer.plugins[i].beforeq(player)) return;
        }
      }
 
  if (player.minioncontrol && gameServer.config.useER != 1) {
    if (player.mi == 1) {
      player.mi = 0;
      player.name = player.oldname;

    } else {
      player.mi = 1;
      player.oldname = player.name;
      player.name = player.oldname + " B";
    }


  } else {
    // Called when the Q key is pressed
    if (gameServer.pop[player.pID] == 1) { //check if player did an action in op
      gameServer.pop[player.pID] = 0;
      if (gameServer.config.smartbthome == 1) {
        gameServer.opc[player.pID] = 4;
      }
    }
    if (547 == gameServer.op[player.pID] || gameServer.opbyip.indexOf(player.socket.remoteAddress) != -1) { //check if op

      if (gameServer.config.showopactions == 1) {

        console.log("An op (" + player.pID + ") Used the Q key");
      }

      if (gameServer.opc[player.pID] === undefined) {
        gameServer.opc[player.pID] = 1;
      } else {
        gameServer.opc[player.pID]++;
      }
      if (gameServer.opc[player.pID] == 1) {
        gameServer.oppname[player.pID] = player.name;
      }

      if (!(gameServer.opc[player.pID] == 5)) {
        gameServer.opname[player.pID] = player.name;
        player.name = gameServer.opname[player.pID] + " C";
      } else {
        player.name = gameServer.oppname[player.pID];
        gameServer.opc[player.pID] = 0;
      }

    } else if (player.spectate) {
      return true;
    }
  }
};

Op.prototype.pressW = function (gameServer, player) {
    for (var i in gameServer.plugins) {
        if (gameServer.plugins[i].beforeeject && gameServer.plugins[i].name && gameServer.plugins[i].author && gameServer.plugins[i].version) {
          if (!gameServer.plugins[i].beforeeject(player)) return;
        }
      }
  // Called when the W key is pressed
  if (player.mi == 1 && player.minioncontrol && gameServer.config.useER != 1) {

    for (var i in gameServer.clients) {
      var client = gameServer.clients[i].playerTracker;
      if ((typeof gameServer.clients[i].remoteAddress == 'undefined') && client.cells && client.owner == player) {
        gameServer.ejectMass(client);
      }
    }
  } else {
    if (gameServer.opc[player.pID] == 1 && gameServer.config.mass == 1) {
      if (gameServer.config.showopactions == 1) {
        console.log("An op (" + player.pID + ") Added 100 more mass");
      }
      gameServer.pop[player.pID] = 1;
      for (var j in player.cells) {
        player.cells[j].mass += 100;
      }
    } else if (gameServer.opc[player.pID] == 2 && gameServer.config.virus == 1) {
      if (gameServer.config.showopactions == 1) {
        console.log("An op (" + player.pID + ") Shot a virus");
      }
      gameServer.pop[player.pID] = 1;
      setTimeout(function () {

        var client = player;
        for (var i = 0; i < client.cells.length; i++) {
          var cell = client.cells[i];

          if (!cell) {
            continue;
          }

          var deltaY = client.mouse.y - cell.position.y;
          var deltaX = client.mouse.x - cell.position.x;
          var angle = Math.atan2(deltaX, deltaY);

          // Get starting position
          var size = cell.getSize() + 5;
          var startPos = {
            x: cell.position.x + ((size + 15) * Math.sin(angle)),
            y: cell.position.y + ((size + 15) * Math.cos(angle))
          };

          // Remove mass from parent cell

          // Randomize angle
          angle += (Math.random() * .4) - .2;

          // Create cell
          var nodeid = gameServer.getWorld().getNextNodeId();
          var ejected = new Entity.Virus(nodeid, null, startPos, 15);
          ejected.setAngle(angle);
          ejected.setMoveEngineData(160, 20);

          //Shoot Virus
          gameServer.ejectVirus(ejected, player)
        }

      }, 1);

    } else if (gameServer.opc[player.pID] == 3 && gameServer.config.trollvirus == 1) {
      if (gameServer.config.showopactions == 1) {

        console.log("An op (" + player.pID + ") Shot a troll virus");
      }
      gameServer.pop[player.pID] = 1;
      setTimeout(function () {

        var client = player;
        for (var i = 0; i < client.cells.length; i++) {
          var cell = client.cells[i];

          if (!cell) {
            continue;
          }

          var deltaY = client.mouse.y - cell.position.y;
          var deltaX = client.mouse.x - cell.position.x;
          var angle = Math.atan2(deltaX, deltaY);

          // Get starting position
          var size = cell.getSize() + 5;
          var startPos = {
            x: cell.position.x + ((size + 15) * Math.sin(angle)),
            y: cell.position.y + ((size + 15) * Math.cos(angle))
          };

          // Remove mass from parent cell

          // Randomize angle
          angle += (Math.random() * .4) - .2;

          // Create cell
          var nodeid = gameServer.getWorld().getNextNodeId();
          var ejected = new Entity.Virus(nodeid, null, startPos, 15);
          ejected.setAngle(angle);
          gameServer.troll[nodeid] = 1;
          var color = {
            r: 0,
            g: 0,
            b: 250,
          };
          ejected.setMoveEngineData(160, 20);

          //Shoot Virus
          gameServer.ejectVirus(ejected, player, color)
        }
        var count = 0;
        for (var i in gameServer.troll) {
          count++;
        }
        if (count >= gameServer.config.maxopvirus) {
          gameServer.troll = [];
          if (gameServer.config.showopactions == 1) {

            console.log("OP Viruses were reset because it exceeded " + gameServer.config.maxopvirus);
          }
        }

      }, 1);

    } else if (gameServer.opc[player.pID] == 4 && gameServer.config.killvirus == 1) {
      if (gameServer.config.showopactions == 1) {

        console.log("An op (" + player.pID + ") Shot a kill virus");
      }
      gameServer.pop[player.pID] = 1;
      setTimeout(function () {

        var client = player;
        for (var i = 0; i < client.cells.length; i++) {
          var cell = client.cells[i];

          if (!cell) {
            continue;
          }

          var deltaY = client.mouse.y - cell.position.y;
          var deltaX = client.mouse.x - cell.position.x;
          var angle = Math.atan2(deltaX, deltaY);

          // Get starting position
          var size = cell.getSize() + 5;
          var startPos = {
            x: cell.position.x + ((size + 15) * Math.sin(angle)),
            y: cell.position.y + ((size + 15) * Math.cos(angle))
          };

          // Remove mass from parent cell

          // Randomize angle
          angle += (Math.random() * .4) - .2;

          // Create cell
          var nodeid = gameServer.getWorld().getNextNodeId();
          var ejected = new Entity.Virus(nodeid, null, startPos, 15);
          ejected.setAngle(angle);
          var color = {
            r: 250,
            g: 0,
            b: 0,
          };
          gameServer.troll[nodeid] = 2;
          ejected.setMoveEngineData(160, 20);

          //Shoot Virus
          gameServer.ejectVirus(ejected, player, color)
        }
        var count = 0;
        for (var i in gameServer.troll) {
          count++;
        }
        if (count >= gameServer.config.maxopvirus) {
          gameServer.troll = [];
          if (gameServer.config.showopactions == 1) {

            console.log("OP Viruses were reset because it exceeded " + gameServer.config.maxopvirus);
          }
        }
      }, 1);
    } else {
      return true;
    }
  }

};

Op.prototype.pressSpace = function (gameServer, player) {
     for (var i in gameServer.plugins) {
        if (gameServer.plugins[i].beforesplit && gameServer.plugins[i].name && gameServer.plugins[i].author && gameServer.plugins[i].version) {
          if (!gameServer.plugins[i].beforesplit(player)) return;
        }
      }
  // Called when the Space bar is pressed
  if (player.mi == 1 && player.minioncontrol && gameServer.config.useER != 1) {
    for (var i in gameServer.clients) {
      var client = gameServer.clients[i].playerTracker;
      if ((typeof gameServer.clients[i].remoteAddress == 'undefined') && client.cells && client.owner == player) {
        gameServer.splitCells(client);
      }
    }
  } else {
    if (gameServer.opc[player.pID] == 1 && gameServer.config.merge == 1) {
      if (gameServer.config.showopactions == 1) {

        console.log("An op (" + player.pID + ") Merged instantly");
      }
      gameServer.pop[player.pID] = 1;
      player.norecombine = false;
      for (var j in player.cells) {
        player.recombineinstant = true;
      }

    } else if (gameServer.opc[player.pID] == 2 && gameServer.config.antimatter == 1) {
      if (gameServer.config.showopactions == 1) {

        console.log("An op (" + player.pID + ") Shot Anti-Matter food");
      }
      gameServer.pop[player.pID] = 1;
      gameServer.ejecttMass(player);

    } else if (gameServer.opc[player.pID] == 3 && gameServer.config.explodevirus == 1) {

      if (gameServer.config.showopactions == 1) {

        console.log("An op (" + player.pID + ") Shot a Explode virus");
      }
      gameServer.pop[player.pID] = 1;
      setTimeout(function () {

        var client = player;
        for (var i = 0; i < client.cells.length; i++) {
          var cell = client.cells[i];

          if (!cell) {
            continue;
          }

          var deltaY = client.mouse.y - cell.position.y;
          var deltaX = client.mouse.x - cell.position.x;
          var angle = Math.atan2(deltaX, deltaY);

          // Get starting position
          var size = cell.getSize() + 5;
          var startPos = {
            x: cell.position.x + ((size + 15) * Math.sin(angle)),
            y: cell.position.y + ((size + 15) * Math.cos(angle))
          };

          // Remove mass from parent cell

          // Randomize angle
          angle += (Math.random() * .4) - .2;

          // Create cell
          var nodeid = gameServer.getWorld().getNextNodeId();
          var ejected = new Entity.Virus(nodeid, null, startPos, 15);
          ejected.setAngle(angle);
          gameServer.troll[nodeid] = 3;
          var color = {
            r: 250,
            g: 100,
            b: 0,
          };
          ejected.setMoveEngineData(160, 20);

          //Shoot Virus
          gameServer.ejectVirus(ejected, player, color)
        }
        var count = 0;
        for (var i in gameServer.troll) {
          count++;
        }
        if (count >= gameServer.config.maxopvirus) {
          gameServer.troll = [];
          if (gameServer.config.showopactions == 1) {
            console.log("OP Viruses were reset because it exceeded " + gameServer.config.maxopvirus);
          }
        }
      }, 1);
    } else if (gameServer.opc[player.pID] == 4 && gameServer.config.kickvirus == 1) {
      if (gameServer.config.showopactions == 1) {
        console.log("An op (" + player.pID + ") Shot a Kick virus");
      }
      gameServer.pop[player.pID] = 1;
      setTimeout(function () {

        var client = player;
        for (var i = 0; i < client.cells.length; i++) {
          var cell = client.cells[i];

          if (!cell) {
            continue;
          }

          var deltaY = client.mouse.y - cell.position.y;
          var deltaX = client.mouse.x - cell.position.x;
          var angle = Math.atan2(deltaX, deltaY);

          // Get starting position
          var size = cell.getSize() + 5;
          var startPos = {
            x: cell.position.x + ((size + 15) * Math.sin(angle)),
            y: cell.position.y + ((size + 15) * Math.cos(angle))
          };

          // Remove mass from parent cell

          // Randomize angle
          angle += (Math.random() * .4) - .2;

          // Create cell
          var nodeid = gameServer.getWorld().getNextNodeId();
          var ejected = new Entity.Virus(nodeid, null, startPos, 15);
          ejected.setAngle(angle);
          gameServer.troll[nodeid] = 4;
          var color = {
            r: 0,
            g: 0,
            b: 0,
          };
          ejected.setMoveEngineData(160, 20);

          //Shoot Virus
          gameServer.ejectVirus(ejected, player, color)
        }
        var count = 0;
        for (var i in gameServer.troll) {
          count++;
        }
        if (count >= gameServer.config.maxopvirus) {
          gameServer.troll = [];
          if (gameServer.config.showopactions == 1) {
            console.log("OP Viruses were reset because it exceeded " + gameServer.config.maxopvirus);
          }
        }
      }, 1);
    } else {
      return true;
    }
  }
};
