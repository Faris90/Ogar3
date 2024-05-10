module.exports = function (gameServer, split) {
  // Get ip
  var ip = split[1];

  if (gameServer.whlist.indexOf(ip) == -1) {
    gameServer.whlist.push(ip);
    console.log("[Console] Added " + ip + " to the whitelist");
  } else {
    console.log("[Console] That IP is already whitelisted");
  }
};
