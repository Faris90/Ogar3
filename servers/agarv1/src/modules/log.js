var fs = require("fs");
var util = require('util');
var EOL = require('os').EOL;
function Log() {
  // Nothing
  
}
local = false;
module.exports = Log;

Log.prototype.setup = function (gameServer) {
/*  if (!fs.existsSync('./logs')) {
    // Make log folder
    fs.mkdir('./logs');
  }*/
  local = false;
  if (gameServer.language != "en") {
  try {
    local = require('../locals/' + gameServer.language);
    
  } catch (e) {
    
  }
}
  switch (gameServer.config.serverLogLevel) {
    case 2:
      ip_log = fs.createWriteStream('./logs/ip.log', {
        flags: 'w'
      });

      // Override
      this.onConnect = function (ip) {
        ip_log.write("[" + this.formatTime() + "] Connect: " + ip + EOL);
      };

      this.onDisconnect = function (ip) {
        ip_log.write("[" + this.formatTime() + "] Disconnect: " + ip + EOL);
      };
    case 1:
      console_log = fs.createWriteStream('./logs/console.log', {
        flags: 'w'
      });

      console.log = function (d) { //
      if (local) {
      var lang;
        for (var i in local.lang) {
var notfound = false;
var orig = local.lang[i].original;
  for (var j in orig) {
  if (d.indexOf(orig[j]) == -1) {
  notfound = true;
  break;
  }
  }
if (!notfound) {
lang = local.lang[i];
break;
}
}
if (lang) {
for (var i in lang.original) {
d = d.replace(lang.original[i],lang.replaceto[i]);
}
}
}
        console_log.write(util.format(d) + EOL);
        process.stdout.write(util.format(d) + EOL);
      };

      //
      this.onCommand = function (command) {
        console_log.write(">" + command + EOL);
      };
    case 0:
      // Prevent crashes
      process.on('uncaughtException', function (err) {
        console.log(err.stack);
      });
    default:
      break;
  }
};

Log.prototype.onConnect = function (ip) {
  // Nothing
};

Log.prototype.onDisconnect = function (ip) {
  // Nothing
};

Log.prototype.onCommand = function (command) {
  // Nothing
};

Log.prototype.formatTime = function () {
  var date = new Date();

  var hour = date.getHours();
  hour = (hour < 10 ? "0" : "") + hour;

  var min = date.getMinutes();
  min = (min < 10 ? "0" : "") + min;

  return hour + ":" + min;
};
