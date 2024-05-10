module.exports = function(gameServer,player,split) {
var msg = function (m) {
    gameServer.pm(player.pID,m);
  }
  if (!split[1]) {
    msg("Please specify a chatname");
    return;
  }
  var message = split.slice(2, split.length).join(' ');
  for (var i in gameServer.clients) {
    var client = gameServer.clients[i].playerTracker;
    if (client && client.chatName && client.chatName == split[1]) {
      gameServer.pm(client.pID,message,"[" + player.chatName + " >> " + client.chatName + "]");
      gameServer.pm(player.pID,message,"[" + player.chatName + " >> " + client.chatName + "]");
      return;
    }
  }
msg("Invalid Chatname")

}
