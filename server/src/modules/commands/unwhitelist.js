module.exports = function (gameServer, split) {
  var ip = split[1]; // Get ip
  var index = gameServer.whlist.indexOf(ip);
  if (index > -1) {
    gameServer.whlist.splice(index, 1);
    console.log("Unwhitelisted " + ip);
  } else {
    console.log("That IP is not whitelisted");
  }
};
