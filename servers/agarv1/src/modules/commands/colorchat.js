module.exports = function (gameServer,player, split) {
  var msg = function (m) {
    gameServer.pm(player.pID,m);
  }
  if (!split[1] && player.chatColor) {
    player.chatColor = false;
    msg("Reset chat color");
    return;
  }
  if (isNaN(split[1])) {
    msg("Please Put a valid Red color amount");
    return;
  }
  if (isNaN(split[2])) {
    msg("Please put a valid Green color amount");
    return;
  }
  if (isNaN(split[3])) {
    msg("Please put a valid Blue color amount");
    return;
  }
  
  var color = {
    r: 0,
    g: 0,
    b: 0
  };
  color.r = Math.max(Math.min(parseInt(split[1]), 255), 0);
  color.g = Math.max(Math.min(parseInt(split[2]), 255), 0);
  color.b = Math.max(Math.min(parseInt(split[3]), 255), 0);

  player.chatColor = color;
  msg("Set chat color to R:" + color.r + " G:" + color.g + " B:" + color.b);
  
}
