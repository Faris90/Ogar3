module.exports = function (gameServer, split) {
  var ops = parseInt(split[1]);
  gameServer.op[ops] = 0;
  gameServer.opc[ops] = 0;
  console.log("De opped " + ops);
};
