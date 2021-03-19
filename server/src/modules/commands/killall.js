'use strict';
const Kill = require('./kill.js');

module.exports = function (gameServer, split) {
  let count = 0;
  gameServer.clients.forEach((client)=>{
    count++;
    Kill(gameServer, ['', client.playerTracker.pID])
  });
  console.log("[Console] Removed " + count + " cells");
};
