module.exports = function (gameServer,player, split) {
  var msg = function (m) {
    gameServer.pm(player.pID,m);
  }
  
  if (player.chat) {
    player.chat = false;
    msg("Muted chat");
  } else {
    player.chat = true;
    msg("Unmuted chat")
  }
  
}
