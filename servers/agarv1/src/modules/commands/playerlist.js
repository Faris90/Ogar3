var fillChar = require('./fillChar.js');
module.exports = function(gameServer, split) {
  if (gameServer.clients.length == 0) {
    console.log("[Console] No players or bots are connected to the server");
  } else {
    console.log("[Console] Showing " + gameServer.clients.length + " players: ");
    console.log(" ID         | IP              | " + fillChar('NICK', ' ', gameServer.config.playerMaxNickLength) + " | CELLS | SCORE  | POSITION    "); // Fill space
    console.log(fillChar('', '-', ' ID         | IP              |  | CELLS | SCORE  | POSITION    '.length + gameServer.config.playerMaxNickLength));
    for (var i = 0; i < gameServer.clients.length; i++) {
      var client = gameServer.clients[i].playerTracker;
      // ID with 3 digits length
      var id = fillChar((client.pID), ' ', 10, true);
      // Get ip (15 digits length)
      var ip = "BOT";
      if (typeof gameServer.clients[i].remoteAddress != 'undefined') {
        ip = gameServer.clients[i].remoteAddress;
      }
      ip = fillChar(ip, ' ', 15);
      // Get name and data
      var nick = '',
        cells = '',
        score = '',
        position = '',
        data = '';
      if (client.spectate) {
        try {
          nick = gameServer.largestClient.name;
        } catch (e) {
          // Specating in free-roam mode
          nick = "IN FREEROAM";
        }
        nick = (nick == "") ? "An unnamed cell" : nick;
        data = fillChar("THIS PLAYER IS SPECTATING: " + nick, '-', ' | CELLS | SCORE  | POSITION    '.length + gameServer.config.playerMaxNickLength, true);
        console.log(" " + id + " | " + ip + " | " + data);
      } else if (client.cells.length > 0) {
        nick = fillChar((client.name == "") ? "An unnamed cell" : client.name, ' ', gameServer.config.playerMaxNickLength);
        cells = fillChar(client.cells.length, ' ', 5, true);
        score = fillChar(client.getScore(true), ' ', 6, true);
        position = fillChar(client.centerPos.x >> 0, ' ', 5, true) + ', ' + fillChar(client.centerPos.y >> 0, ' ', 5, true);
        console.log(" " + id + " | " + ip + " | " + nick + " | " + cells + " | " + score + " | " + position);
      } else {
        // No cells = dead player or in-menu
        data = fillChar('DEAD OR NOT PLAYING', '-', ' | CELLS | SCORE  | POSITION    '.length + gameServer.config.playerMaxNickLength, true);
        console.log(" " + id + " | " + ip + " | " + data);
      }
    }
  }
};
