function opHelp(gameServer, args) {
  console.log("[Console] ======================= OP HELP =====================");
  console.log("You use OP by first setting who has op by doing op [id] in console. Then, that player can use the op features in game by pressing q. Then a c will appear next to your name. If you press w in this state, it gives you 100 more mass. If you press space in this state, you will be able to rejoin instantly. You will find out that if you press q again, two c's will appear next to your name. if you press w in this state, you shoot viruses. If you press space in this state, you shoot tiny things (almost invisible) that if someone eats, their mass is reduced by 100. Then, if you press q again,3 c's will appear.press w with 3c's, you shoot a virus, but whoever who eats it will be trolled :). If you press space with 3 c's the person who eats the virus will explode.If you press q again, 4 cs will appear and if you press w, you will shoot a virus tha kills people and space, it shoots a kick virus. You can then exit op by pressing q again after doing an action or by pressing Q until the three c's will dissappear (so that you can normally split and shoot mass).");
  console.log("[Console] ===================== OP Usage Map ===================");
  console.log("One C:");
  console.log("W = Addmass 100+");
  console.log("Space = Merge Instantly");
  console.log("");
  console.log("Two C's:");
  console.log("W = Shoot virus");
  console.log("Space = Shoot Mass that decreases 100 mass from consumer");
  console.log("");
  console.log("Three C's:");
  console.log("W = Troll virus");
  console.log("Space = Explode virus");
  console.log("Four C's:");
  console.log("W = Kill virus");
  console.log("Space = Kick Virus");
  console.log("[Console] ====================================================");
}


module.exports = function (gameServer, args) {
  var ops = parseInt(args[1]);
  if (args[1] == "help") {
    opHelp(gameServer, args);
  } else if (isNaN(ops)) {
    console.log("[Console] Please specify a valid player ID!");
    return;
  }
  gameServer.op[ops] = 547;
  console.log("[Console] Made " + ops + " OP");
};
