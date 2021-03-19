module.exports = function (gameServer, split) {
  if (gameServer.pmsg == 0) {
    console.log("[Console] You have no PMSG Process");
  } else {
    gameServer.pmsg = 0;
    clearInterval(pmsgt);
    console.log("[Console] Stopped any periodicMSG process");
  }
};
