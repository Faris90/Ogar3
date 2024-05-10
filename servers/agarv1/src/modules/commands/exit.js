module.exports = function (multiverse, split) {

  console.log("\x1b[0m[Console] Closing server...");
  multiverse.stop()
  process.exit(1);
};
