'use strict';
const Readline = require('readline');
const VERSION = '17.6.0';
// require('./cpu.js').init('./data')
const Multiverse = require('./core/Multiverse');
let multiverse = new Multiverse(VERSION);
//throw error
// Init variables
let showConsole = true;
process.stdout.write("\u001b[2J\u001b[0;0H");
// Handle arguments
process.argv.forEach(function (val) {
  if (val == "--noconsole") {
    showConsole = false;
  } else if (val == "--help") {
    console.log("Proper Usage: node index.js");
    console.log("    --noconsole         Disables the console");
    console.log("    --help              Help menu.");
    console.log("    --expose-gc         Enables garbage collection")
    console.log("");
  }
});
if (global.gc) {
    global.gc();
} else {
    console.log('[\x1b[34mINFO\x1b[0m] Garbage collection unavailable.  Pass --expose-gc '
      + 'when launching node to enable garbage collection.(memory leak)');
}

// There is no stopping an exit so clean up
// NO ASYNC CODE HERE - only use SYNC or it will not happen
process.on('exit', (code) => {
  console.log("[\x1b[34mINFO\x1b[0m] OgarUnlimited terminated with code: " + code);
  multiverse.stop();
});

// init/start the control server
multiverse.init();
setTimeout(function() {multiverse.start()},1500);

// Initialize the server console
if (showConsole) {
  let streamsInterface = Readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  setTimeout(multiverse.prompt(streamsInterface), 100);
}
