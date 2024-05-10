module.exports = function (gameServer, split) {
  if (!gameServer.running) {
    gameServer.unpause();
    gameServer.overideauto = false;
    
  } else {
    gameServer.overideauto = true;
    gameServer.pause();
  }

  var s = gameServer.running ? "Unpaused" : "Paused";
  console.log("[Console] " + s + " the game.");
};
