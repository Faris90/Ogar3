module.exports = function (gameServer, split) {
  borderDec = split[1];
  if (isNaN(borderDec)) {
    borderDec = 200;
  }
  gameServer.config.borderLeft -= borderDec;
  gameServer.config.borderRight += borderDec;
  gameServer.config.borderTop -= borderDec;
  gameServer.config.borderBottom += borderDec;

  console.log("[Console] Successivly Enlarged game. Size: " + (gameServer.config.borderRight - gameServer.config.borderLeft) + "," + (gameServer.config.borderBottom - gameServer.config.borderTop));
};
