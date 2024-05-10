module.exports = function (gameServer, split) {
  var start = parseInt(split[1]);
  var end = parseInt(split[2]);
  var command = split[3];
  var c1 = split[4];
  var c2 = split[5];
  var c3 = split[6];
  var splita = [];
  if (isNaN(start) || isNaN(end)) {
    console.log("[Console] Please specify a valid range!");
  }
  for (var h = start; h < end; h++) {
    splita[1] = h;
    splita[2] = c1;
    splita[3] = c2;
    splita[4] = c3;
    gameServer.consoleService.execommand(command, splita);
  }
};
