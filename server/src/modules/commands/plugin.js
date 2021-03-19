const fs = require("fs");
const crypto = require('crypto');
const request = require('request');
// plugin command
module.exports = function (gameServer, split, sudo) {
  if (split[1] == "list") {
    console.log("[Console] --------------- Installed Plugins ---------------");
    for (var i in gameServer.plugins) {
      var plugin = gameServer.plugins[i];
      if (plugin && plugin.name && plugin.author && plugin.version) {
        if (plugin.description) console.log("[Console] " + plugin.name + " By " + plugin.author + " version " + plugin.version + "\n      Description: " + plugin.description); else console.log("[Console] " + plugin.name + " By " + plugin.author + " version " + plugin.version + "\n      Description: No description given");


      }


    }
    console.log("[Console] ------------------------------------------------");
  } else if (split[1] == "search") {
    if (!split[2]) {
      console.log("[Console] Please enter a search term!");
      return;
    }
    console.log("[Console] Connecting to servers...");
    request('https://raw.githubusercontent.com/AJS-development/OgarUL-Plugin-Library/master/files.txt', function (error, response, body) {
        if (!error && response.statusCode == 200) {
           var ava = body.split(/[\r\n]+/).filter(function (x) {
            return x != ''; // filter empty
          });
          var p = [];
          var l = [];
          var j = 0;
          var listed = [];
          var k = 0;
          var search = split.slice(2, split.length).join(' ').toLowerCase();
          var desc = [];
          for (var i in ava) {
            var s = ava[i].split("|");
var aga = "";
 for (var k = 0; k < 2; k++) aga = aga + s[k];
 if (aga) aga = aga.toLowerCase()
            if (aga.indexOf(search) != -1) {
              p[j] = {
                name: s[0],
                desc: s[1],
              };
              j++;
              listed.push(s[0]);
            } else {
            for (var m = 2; m < split.length; m++) {
              if (!split[m]) continue;
              var se = split[m].toLowerCase();
    if (aga.indexOf(se) != -1 && listed.indexOf(s[0]) == -1) {
      l[k] = {
        name: s[0],
        desc: s[1],
      }
      k++
      listed.push(s[0]);
      break;
    }
  }
  }      
  }
  if (p[0] || l[0]) {
  console.log("[Console] Search results for " + search + " :");
  for (var i in p) console.log("  " + p[i].name + "\n     Description: "+ p[i].desc);
  for (var i in l) console.log("  " + l[i].name + "\n     Description: "+ l[i].desc);
  } else {
    console.log("[Console] No results found for " + search+ ". Make sure it exists in the plugin library");
  }
        } else {
          console.lofg("[Console] Failed to connect to servers");
          return;
        }
   });
   
    
  } else if (split[1] == "reload") {
    gameServer.pluginLoader.load();
    console.log("[Console] Reloaded plugins");
  } else if (split[1] == "delete") {
    if(split[2]) {
    gameServer.dfr('./plugins/' + split[2]);
    console.log("[Console] Deleting Plugin " + split[2]);
    
    setTimeout(function() {
      console.log("[Console] Reloading plugins");
      gameServer.pluginLoader.load();
      
    }, 3000)
    } else {
      console.log("[Console] Please specify a plugin filename")
      
    }
  } else if (split[1] == "install") {
    if (!split[2]) {
      console.log("[Console] Please specify a plugin name. Do plugin search [keyword] to see available plugins");
      return;
    }
    request('https://raw.githubusercontent.com/AJS-development/OgarUL-Plugin-Library/master/files.txt', function (error, response, body) {
        if (!error && response.statusCode == 200) {
        var ava = body.split(/[\r\n]+/).filter(function (x) {
            return x != ''; // filter empty
          });
var ok = false;
          for (var i in ava) {
            var s = ava[i].split("|");
            if (split[2] == s[0]) {
            var newsplit = [];
            newsplit[1] = 'add'
            newsplit[2] = s[2]
            newsplit[3] = s[0]
    gameServer.consoleService.execCommand('plugin', newsplit, true);
            console.log("[Console] Installing " + s[0]);
           ok = true
            break;
            }
          }
        if (!ok) {
          console.log("[Console] That plugin does not exist. Do plugin available to see available plugins and plugin search to search plugins!");
      return;
        }
          
          
        } else {
          console.log("[Console] Failed to connect to servers")
          return;
        }
    });
    
  } else if (split[1] == "update") {
    var data = '';
    if (split[2]) {
      console.log("[Console] Updating " + split[2])
      try {
     data = fs.readFileSync('./plugins/' + split[2] + '/files.txt', "utf8");
      } catch (e) {
        console.log("[Console] That plugins files.txt is missing!")
        return;
        
      }
      console.log("[Console] Downloading updated files.txt")
      var ava = data.split(/[\r\n]+/).filter(function (x) {
            return x != ''; // filter empty
          });
          var url = '';
          for (var i in ava) {
            var s = ava[i].split("|");
             if (s[0] == "files.txt") {
               url = s[1];
               break;
             }
          }
          if (!url) {
            console.log("[Console] Failed to find url for updated files.txt")
            return;
          }
var newsplit = [];
            newsplit[1] = 'add'
            newsplit[2] = url
            newsplit[3] = split[2];
            newsplit[4] = split[3];
    gameServer.consoleService.execCommand('plugin', newsplit, true);
      return;
    }
    try {
   var files = fs.readdirSync('./plugins/');  
   console.log("[Console] Updating all plugins...");
   for (var i in files)  {
     var newsplit = [];
            newsplit[1] = 'update'
            newsplit[2] = files[i];
            newsplit[3] = true;
    gameServer.consoleService.execCommand('plugin', newsplit, true);
   }
    setTimeout(function() {
            console.log("[Console] Done, Reloading...");
          
gameServer.pluginLoader.load();
            
          }, 2000);
    } catch (e) {
      console.log("[Console] Failed to update Reason:" + e);
      return;
    }
   
    
    
    
  
    
    
  } else if (split[1] == "available") {
    console.log("[NOTE] Plugin available is depreciated, Use plugin search instead");
  return;
  } else if (split[1] == "add") {
    if (!sudo) {
      console.log("[Console] You cannot install a plugin unless directly at the console!");
      return;
    }
    if (!split[3]) {
      
      console.log("[Console] Since you did not specify a valid save-as file name, we will generate a random one");
       var random  = function(howMany, chars) {
    chars = chars 
        || "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
    var rnd = crypto.randomBytes(howMany)
        , value = new Array(howMany)
        , len = chars.length;

    for (var i = 0; i < howMany; i++) {
        value[i] = chars[rnd[i] % len]
    };

    return value.join('');
}
    split[3] = random(7);
    console.log("[COnsole] Generated random save as name for the plugin, Name: " + split[3]);
    }
    
    if (!split[2]) {
      
      console.log("[Console] Please specify a plugins files.txt raw url");
      return;
    }
    request(split[2], function (error, response, body) {
        if (!error && response.statusCode == 200) {
          console.log("[Console] Downloading...");
         var files = body.split(/[\r\n]+/).filter(function (x) {
            return x != ''; // filter empty
          });
          var filenames = [];
          var src = [];
          for (var i in files) {
            var f = files[i].split("|");
            filenames[i] = f[0];
            src[i] = f[1];
          }
          var download = function(src,location) {
            request(src, function (error, response, body) {
      if (!error && response.statusCode == 200 && body != "") {
        fs.writeFile(location , body, (err, res)=> {
        });
      } else {
        console.log("[Console] Error: Couldnt download file into " + location);
      }
    });
            
            
          };
          var text = "Downloading";
          try {
          fs.mkdir('./plugins/' + split[3]);
          } catch (w) {
            text = "Updating"
          }
          for (var i in files) {
            var f = files[i].split("|");
            filenames[i] = f[0];
            src[i] = f[1];
            download(src[i],'./plugins/' + split[3] + '/' + filenames[i]);
          
          
            console.log("[Console] " + text + ' ./plugins/' + split[3] + '/' + filenames[i])
          }
          if (!split[4]) {
          setTimeout(function() {
            console.log("[Console] Done, Reloading...");
          
gameServer.pluginLoader.load();
            
          }, 2000);
          }
          
        } else {
          console.log("[Update] Please put a valid url of the raw files.txt file");

        }
      });
    
    
    
  } else {
    console.log("[Console] Please specify a command. Available commands: list,search, reload, delete, add, available, install, update")
  }


};
