module.exports = function (gameServer, split) {
   var ip = split[1];
if (ip) {
  if (gameServer.whlist.indexOf(ip) == -1) {
    gameServer.whlist.push(ip);
    console.log("[Console] Added " + ip + " to the whitelist");
  } else {
    console.log("[Console] That IP is already whitelisted");
  }
  return;
} 
  console.log("[Console] Current whitelisted IPs (" + gameServer.whlist.length + ")");
  for (var i in gameServer.whlist) {
    console.log(gameServer.whlist[i]);
  }
};
