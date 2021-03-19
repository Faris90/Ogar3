module.exports = function (multiverse, split) {
 console.log("[Console] Quickrestarting servers...");
  if (multiverse.restart()) console.log("[Console] Restarted servers successfully");
  else console.log("[Console] Failed to restart server")
  
}
