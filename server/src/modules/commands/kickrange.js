module.exports = function (gameServer, split) {
  var start = parseInt(split[1]);
  var end = parseInt(split[2]);
  if (isNaN(start) || isNaN(end)) {
    console.log("[Console] Please specify a valid range!");
  }
 var split = [];
  for (var h = start; h < end; h++) {
   split[1] = h;
 gameServer.consoleService.execCommand('kick',split);
  }
};
