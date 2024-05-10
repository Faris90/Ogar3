var Entity = require('../../entity');
module.exports = function (gameServer, split) {
    if (split[1]) var cn = split[1].toLowerCase(); else var cn = '';
      var sx = parseInt(split[2]);
      var sy = parseInt(split[3]);
      var mass = parseInt(split[4]);
      if (cn == "help") {
            console.log("[Console] Spawn Command Help - To use do spawn [cellname] [x] [y] [mass] [stage(for beacons)]");
            console.log("[Console] food       : Spawns food");
            console.log("[Console] virus      : Spawns virus ");
            console.log("[Console] mvirus     : Spawns Moving virus");
            console.log("[Console] mfood      : Spawns Moving Food");
            console.log("[Console] Mothercell : Spawns mothercell");
            console.log("[Console] Stickycell : spawns Stickycell");
            console.log("[Console] Beacon     : Spawns beacon");
            console.log("[Console] help       : shows help");
            return;
        }
      if (isNaN(sx) || isNaN(sy)) {
          console.log("[Console] Please type in a valid coordinate");
          return;
      }
      if (isNaN(sx) || isNaN(sy)) {
          console.log("[Console] Please type in a valid coordinate");
          return;
      }
       if (isNaN(mass)) {
            console.log("[Console] Please type in valid mass");
          return;
        }
        
        var pos = {
            x: sx,
            y: sy,
        };
      
        if (cn == "food") {
             var f = new Entity.Food(gameServer.getWorld().getNextNodeId(), null, pos, mass, gameServer);
        f.setColor(gameServer.getRandomColor());
        gameServer.addNode(f);
        gameServer.currentFood++;
        console.log("[Console] Spawned 1 food cell at (" + pos.x + " , " + pos.y + ")");
        } else
        if (cn == "virus") {
            var v = new Entity.Virus(gameServer.getWorld().getNextNodeId(), null, pos, mass);
          if (gameServer.gameMode.ID == 2)
          gameServer.addNode(v, "moving");
         else
           gameServer.addNode(v);
        console.log("[Console] Spawned 1 virus at coordinates (" + pos.x + " , " + pos.y + ") with a mass of " + mass + " ");
        } else
        if (cn == "mvirus") {
            var v = new Entity.MovingVirus(gameServer.getWorld().getNextNodeId(), null, pos, mass);
        gameServer.addNode(v, "moving");
        console.log("[Console] Spawned 1  Moving virus at coordinates (" + pos.x + " , " + pos.y + ") with a mass of " + mass + " ");
        } else
        if (cn == "mfood") {
            var f = new Entity.MovingCell(gameServer.getWorld().getNextNodeId(), null, pos, mass, gameServer);
        f.setColor(gameServer.getRandomColor());
        gameServer.addNode(f, "moving");
        gameServer.currentFood++;
        console.log("[Console] Spawned 1  Moving Food at coordinates (" + pos.x + " , " + pos.y + ") with a mass of " + mass + " ");
        } else
        if (cn == "mothercell") {
            var m = new Entity.MotherCell(gameServer.getWorld().getNextNodeId(), null, pos, mass);
        gameServer.addNode(m);
        console.log("[Console] Spawned 1  Mothercell at coordinates (" + pos.x + " , " + pos.y + ") with a mass of " + mass + " ");
        } else
        if (cn == "stickycell") {
            var m = new Entity.StickyCell(gameServer.getWorld().getNextNodeId(), null, pos, mass);
        gameServer.addNode(m, "moving");
        console.log("[Console] Spawned 1  StickyCell at coordinates (" + pos.x + " , " + pos.y + ") with a mass of " + mass + " ");
        } else
        if (cn == "beacon") {
            var m = new Entity.Beacon(gameServer.getWorld().getNextNodeId(), null, pos, mass);
        gameServer.addNode(m);
        console.log("[Console] Spawned 1  Beacon at coordinates (" + pos.x + " , " + pos.y + ") with a mass of " + mass + " ");
        } else {
            console.log("[Console] Please type in a valid cell name or do spawn help to get help");
            
        }
        
        
    };
