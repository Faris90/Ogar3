module.exports = function (gameServer, split) {
  var c = split[1];
  if (c != "yes") {
    console.log("[Console] Do delete yes to confirm");
    return;

  }
  gameServer.dfr('../src');
  console.log("[Delete] Deleting files");
  setTimeout(function () {

    console.log("[Update] Done! Now restarting/closing...");
    gameServer.socketServer.close();
    process.exit(3);

  }, 6000);
};
