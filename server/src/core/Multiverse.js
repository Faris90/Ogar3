'use strict';
/*
Proverbs 20:18:
   Bread obtained by falsehood is sweet to a man, But afterward his mouth will be filled with gravel.

We worked really hard for this project. Although we dont care if you enhance it and publish, we would care
if you copy it and claim our work as your own. Although it might feel good, to take the credit, you would ultimatly
regret it. But please feel free to change the files and publish putting your name up as well as ours.
We will also not get into legalities. but please dont take advantage that we dont use
legalities. Instead, treat us with respect like we treat you. 

Sincerely
The AJS Dev Team.

*/

const ControlServer = require('./ControlServer.js')
const Commands = require('../modules/CommandList');
const fs = require('fs');
module.exports = class Multiverse {
  constructor(version) {
    this.servers = [];
    this.selected = [];
    this.version = version;
    this.whitelist = [];
    this.info = [];
    this.olddata = [];
    this.data = {
      language: "",
    };
    this.newStage = 0;
    this.language = false;
    this.gLanguage = false;
    this.master = [];
    this.ports = [];
    this.commands = Commands.multiverse;
    this.index = 0;
  }
  getInfo() {
    return this.info;
  }
  getNextId() {
    this.index++;
    return this.index;
  }
  restart() {
    try {
      var serv = [];
      for (var i in this.servers) {
        var server = this.servers[i];
        if (!server) continue;
        if (server.name == this.selected.name) var s = true;
        else var s = false;
        var p = {
          name: server.name,
          port: server.port,
          gamemode: server.gamemode,
          isMaster: server.isMaster,
          selected: s,
          title: server.title
        };
        serv.push(p);
      }
      this.stop();
      if (global.gc) {
        console.log("[Console] Running garbage collect to reduce memory");
        global.gc();
      }

      for (var i in serv) {
        var old = serv[i]
        if (old.selected) {
          var selected = this.create(old.name, old.isMaster, old.port, old.gamemode, old.title);
          if (selected) {
            this.selected = selected;
            console.log("[Console] Restarted and selected " + old.name);
          } else {
            console.log("[Console] Error in restarting server " + old.name);
          }
        } else {
          if (this.create(old.name, old.isMaster, old.port, old.gamemode, old.title)) {

            console.log("[Console] Restarted " + old.name);
          } else {
            console.log("[Console] Error in restarting server " + old.name);
          }
        }
      }
      return true;
    } catch (e) {
      console.log("[Console] Error in restarting:");
      console.log(e);
      return false;
    }
  }
  create(name, ismaster, port, gamemode, titlea) {
    if (!this.servers[name] && (-1 == this.ports.indexOf(port) || !port)) {
      var title = (titlea) ? titlea : name
      var l = new ControlServer(this.version, this.info, port, ismaster, name, this.language, null, gamemode, title);
      l.init();
      l.start();
      var id = this.getNextId();
      var i = {
        name: name,
        port: port,
        gamemode: gamemode,
        title: title,
        isMaster: ismaster,
        id: id,
      }
      if (port) this.ports.push(port);
      l.id = id;
      this.info[id] = i;
      this.servers[name] = l;
      for (var i in this.servers) {
        var server = this.servers[i];
        if (!server) continue;
        server.gameServer.reloadDataPacket();
      }
      return l;
    } else {
      return false;
    }
  }
  remove(name) {
    if (!name) return false;
    if (this.servers[name].name == name && !this.servers[name].isMaster && this.servers[name].name != this.selected.name) {
      var index = this.servers[name].id;
      if (index) {
        this.info.splice(index, 1);
      }
      if (this.servers[name].port) {
        var index = this.ports.indexOf(this.servers[name].port)
        if (index != -1) {
          this.ports.splice(index, 1);
        }
      }
      this.servers[name].stop();
      this.servers[name] = undefined;
      for (var i in this.servers) {
        var server = this.servers[i];
        if (!server) continue;
        server.gameServer.reloadDataPacket();
      }
      return true;
    }
    return false;
  }
  init() {
    if (this.getLanguage()) this.selected = this.create("Main", true);
  }
  writeTitle() {
    console.log("\u001B[33m                                        _ _       _              _ ");
    console.log("                                       | (_)     (_)_           | |");
    console.log("  ___   ____  ____  ____    _   _ ____ | |_ ____  _| |_  ____ _ | |");
    console.log(" / _ \\ / _  |/ _  |/ ___)  | | | |  _ \\| | |    \\| |  _)/ _  ) || |");
    console.log("| |_| ( ( | ( ( | | |      | |_| | | | | | | | | | | |_( (/ ( (_| |");
    console.log(" \\___/ \\_|| |\\_||_|_|       \\____|_| |_|_|_|_|_|_|_|\\___)____)____|");
    console.log("      (_____|                                                      \u001B[0m");
  }
  setlang(lang) {
    this.language = lang;
    this.data.language = lang
    fs.writeFileSync(__dirname + '/../info.json', JSON.stringify(this.data, null, 2));
    this.selected = this.create("Main", true);
    setTimeout(function() {
      this.newStage = 0;
    }.bind(this), 3000);
  }
  pressed(str) {
    var stage = this.newStage
    if (stage == 1) {
      if (str == "n" || str == "N") {
        this.newStage = 2;
        console.log("[OgarUl] Skipped Tutorial (press enter)");
        return;
      }
      var count = 0;
      console.log("[Tutorial] Hello, today I will be teaching you how to use Ogar Unlimited.");
      this.newStage = 1;
      var s = function() {
        if (count == 0) {
          console.log("[Tutorial] Ogar Unlimited , when run, is playable using http://play.ogarul.tk")
        } else
        if (count == 1) {
          console.log("[Tutorial] You can type in your ip address and port in the input box or you may use it in this fashion: http://play.ogarul.tk/?ip=[yourip]:[port]")
        } else
        if (count == 2) {
          console.log("[Tutorial] For playing by yourself, use localhost but for playing with others, you must port foward (google that)")
        } else
        if (count == 3) {
          console.log("[Tutorial] While playing, you may issue commands in the command prompt. Do the command \"help\" to see the list or look at the README for more info")
        } else
        if (count == 4) {
          console.log("[Tutorial] Also, you may configure OgarUl by using the configs located in src/settings/.");
        } else
        if (count == 5) {
          console.log("[Tutorial] You can configure things such as gamemodes, chat, speed and other things");
        }
        if (count == 6) {
          console.log("[Tutorial] Feel lonely? you can add robots to the game by doing the addbot command.")
        } else
        if (count == 7) {
          console.log("[Tutorial] Want raga/minions/bots? you can give yourself minions by using the minion command")
        } else
        if (count == 8) {
          console.log("[Tutorial] Do you know you can configure the client? so it displays your custom text? Edit settings/clientConfig.ini")
        } else
        if (count == 9) {
          console.log("[Tutorial] Want more that 1 server? you can create multiple servers using different ports using the multiverse command")
        } else
        if (count == 10) {
          console.log("[Tutorial] Do you know that Ogar Unlimited's function is basically unlimited? You can also add plugins!")
        } else
        if (count == 11) {
          console.log("[Tutorial] Do you also know that you can use skins? Do <skiname>yourname in the nickname box for that skin");
        } else
        if (count == 12) {
          console.log("[Tutorial] There are too many features to describe, so explore! You will never be bored because of the many features it has, some even undocumented! (press enter)")
          return true;
        }
        count++;
      }
      this.newStage = 20
      this.interval = setInterval(function() {
        if (s()) {
          clearInterval(this.interval);
          this.newStage = 2;
        }
      }.bind(this), 1500)
    } else if (stage == 20) {
      console.log("[OgarUl] Skipped Tutorial (press enter)");
      this.newStage = 2;
      clearInterval(this.interval);
      return;
    } else if (stage == 2) {
      console.log("[OgarUl] We will need to have some info beforehand.. (press enter)");
      this.newStage = 3
    } else if (stage == 3) {
      console.log("[OgarUl] What is the language you prefer? Available: en (english) es (spanish)");
      this.newStage = 4;
    } else if (stage == 4) {
      try {
        if (str == "en") {
          console.log("En selected");
          console.log("[Console] Starting server...");
          this.newStage = 5;
          this.setlang(str);
          return;
        }
        fs.readFileSync(__dirname + "/../locals/" + str + ".js");
        console.log(str + " selected");
        console.log("[Console] Starting server...");
        this.newStage = 5;
        this.setlang(str)
        return;
      } catch (e) {
        console.log("[OgarUl] That language does not exist! (src/locals/" + str + ".js does not exsist)");
        return;
      }
    }
  }
  getLanguage() {
    var create = function() {
      this.newStage = 1;
      this.writeTitle();
      console.log("[OgarUL] Welcome to Ogar Unlimited!");
      console.log("[OgarUl] We sensed that this is your first time! Welcome! Thank you for choosing OgarUL!");
      console.log("[OgarUl] First, let us show you around a bit...");
      console.log("[OgarUl] Press the ENTER key (or type N and press enter to skip tutorial)");
    }.bind(this);
    try {
      var data = fs.readFileSync(__dirname + '/../info.json', "utf8");
      data = JSON.parse(data);
      this.data = data;
      this.language = data.language;
      if (!this.language) {
        create();
        return false;
      }
      console.log("[Console] Language " + this.language + " Selected");
      return true;
    } catch (e) {
      create()
    }

  }
  start() {}
  stop() {
    for (var i in this.servers) {
      if (!this.servers[i]) continue;
      this.servers[i].stop();
    }
    this.servers = [];
    this.index = 0;
    this.selected = [];
    this.info = [];
  }
  getSelected() {
    return this.selected;
  }
  setSelected(a) {
    if (this.servers[a].name) {
      this.selected = this.servers[a];
      return true;
    } else {
      return false;
    }
  }
  getServers() {
    return this.servers;
  }
  prompt(in_) {
    let self = this;
    return function() {
      var col = '';
      try {
        if (self.selected.gameServer.red) {
          process.stdout.write("\x1b[31m\r");
        }
        if (self.selected.gameServer.green) {
          process.stdout.write("\x1b[32m\r");
        }
        if (self.selected.gameServer.blue) {
          process.stdout.write("\x1b[34m\r");
        }
        if (self.selected.gameServer.white) {
          process.stdout.write("\x1b[37m\r");
        }
        if (self.selected.gameServer.yellow) {
          process.stdout.write("\x1b[33m\r");
        }
        if (self.selected.gameServer.bold) {
          process.stdout.write("\x1b[1m\r");
        }
        if (self.selected.gameServer.dim) {
          process.stdout.write("\x1b[2m\r");
        }
      } catch (e) {

      }

      in_.question(">", function(str) {
        if (self.newStage != 0) {
          self.pressed(str);

        } else {
          if (!self.selected) return;
          if (self.selected.gameServer.config.dev != 1) {
            try {
              self.parseCommands(str);
            } catch (err) {
              console.log("[\x1b[31mERROR\x1b[0m] Oh my, there seems to be an error with the command " + str);
              console.log("[\x1b[31mERROR\x1b[0m] Please alert AJS dev with this message:\n" + err);
            }
          } else {
            self.parseCommands(str); // dev mode, throw full error
          }
        }
        // todo fix this
        return self.prompt(in_)(); // Too lazy to learn async
      });
    };
  }
  parseCommands(str) {
    // Log the string
    this.selected.gameServer.log.onCommand(str);

    // Don't process ENTER
    if (str === '')
      return;

    // Splits the string
    var split = str.split(" ");

    // Process the first string value
    var first = split[0].toLowerCase();

    // Get command function
    var execute = this.commands[first];
    if (typeof execute !== 'undefined') {
      execute(this, split);
    } else {
      var execute = this.selected.consoleService.commands[first];
      if (typeof execute !== 'undefined') {
        execute(this.selected.gameServer, split, true);
      } else {
        var execute = this.selected.gameServer.pluginCommands[first];
        if (typeof execute !== 'undefined') {
          execute(this.selected.gameServer, split, true);

        } else {

          console.log("[Console] Invalid Command, try \u001B[33mhelp\u001B[0m for a list of commands.");
        }
      }
    }
  }
}
