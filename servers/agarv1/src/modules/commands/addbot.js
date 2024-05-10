'use strict';
module.exports = function (gameServer, args) {
  let add = parseInt(args[1]);
  if (isNaN(add)) {
    add = 1; // Adds 1 bot if user doesnt specify a number
  }
  gameServer.livestage = 2;
  gameServer.liveticks = 0;
  for (let i = 0; i < add; i++) {
    setTimeout(gameServer.bots.addBot.bind(gameServer.bots), i);
    // todo encapsulation
    gameServer.sbo++;
  }
  console.log("[Console] Added " + add + " player bots");
};
