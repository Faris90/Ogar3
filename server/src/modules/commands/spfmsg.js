module.exports = function (gameServer, split) {
  if (gameServer.pfmsg == 0) {
    console.log("[Console] You have no SPFMSG Process");
  } else {
    gameServer.pfmsg = 1;
    clearInterval(pfmsgt);
    console.log("[Console] Stopped any periodicForceMSG process");
  }
};
