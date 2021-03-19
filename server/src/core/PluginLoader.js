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
const fs = require("fs");
const ini = require('../modules/ini.js');
const glob = require('glob');
const zlib = require('zlib');

module.exports = class PluginLoader {
  constructor(gameServer, version) {
    this.plugins = [];
    this.gameServer = gameServer;
    this.pluginGamemodes = [];
    this.extraC = [];
this.version = version; 

  }

  getPlugin() {
    return this.plugins

  }

  getPGamemodes() {
    return this.pluginGamemodes;
  }

  getPC() {
    return this.extraC;
  }
  log(a) {
    if (this.gameServer.isMaster) console.log(a);
    
  }
  load() {
    
    if (!fs.existsSync('./plugins')) {
    // Make log folder
    fs.mkdir('./plugins');
  }
    if (this.gameServer.config.dev == 1) {
      this.log("[\x1b[34mINFO\x1b[0m] Loading plugins in dev mode");
      var files = fs.readdirSync('./plugins/');
      for (var i in files) {
try {
            var plugin = require('../plugins/' + files[i] + '/index.js');
            } catch (e) {
              continue;
            }
        if (plugin.compatVersion) {
              var com = parseInt(plugin.compatVersion.replace(/\./g,''));
              var cur = parseInt(this.version.replace(/\./g,''));
              if (cur < com) {
                this.log("[\x1b[34mINFO\x1b[0m] pluginfile " + files[i] + " was not loaded as it is not compatible with v" + this.version + " Required: " + plugin.compatVersion)
                continue;
              }
            }
        if (plugin.name && plugin.author && plugin.version && plugin.init) {
          this.plugins[plugin.name] = plugin;
          if (this.plugins) {
            if (plugin.commandName) {
              for (var j in plugin.commandName) {
                if (plugin.commandName[j] && plugin.command[j]) {
                  this.extraC[plugin.commandName[j]] = plugin.command[j];
                }
              }
            }
              for (var j in plugin.gamemodeId) {
                if (plugin.gamemodeId[j] && plugin.gamemode[j]) {
                  this.pluginGamemodes[plugin.gamemodeId[j]] = plugin.gamemode[j];
                }
              }
              var config = [];
              if (plugin.config && plugin.configfile) {
                config = plugin.config
                try {
    // Load the contents of the config file
    var load = ini.parse(fs.readFileSync('./plugins/'  + files[i] + '/' + plugin.configfile, 'utf-8'));
    // Replace all the default config's values with the loaded config's values
    for (var obj in load) {
      this.plugins[plugin.name].config[obj] = load[obj];
      config[obj] = load[obj];
    }
  } catch (err) {
    // No config
    this.log("[\x1b[31mFAIL\x1b[0m]vPlugin configs for " + plugin.name + " Cannot be loaded");
  }
              }
              plugin.init(this.gameServer, config);
          }

          this.log("[\x1b[32mOK\x1b[0m] loaded plugin: " + plugin.name + " By " + plugin.author + " version " + plugin.version);

        } else {
          this.log("[\x1b[31mFAIL\x1b[0m]Didnt load pluginfile " + files[i] + " because it was missing parameters");
        }
      }

    } else {


      try {
        this.log("[\x1b[34mINFO\x1b[0m] Loading plugins");
        var files = fs.readdirSync('./plugins/');
        for (var i in files) {

          try {
            try {
            var plugin = require('../plugins/' + files[i] + '/index.js');
            } catch (e) {
              continue;
            }
            if (plugin.compatVersion) {
              var com = parseInt(plugin.compatVersion.replace(/\./g,''));
              var cur = parseInt(this.version.replace(/\./g,''));
              if (cur < com) {
                this.log("[\x1b[31mFAIL\x1b[0m] pluginfile " + files[i] + " was not loaded as it is not compatible with v" + this.version + " Required: " + plugin.compatVersion)
                continue;
              }
            }
            
            
            if (plugin.name && plugin.author && plugin.version && plugin.init) {
          this.plugins[plugin.name] = plugin;
          if (this.plugins) {
            if (plugin.commandName) {
              for (var j in plugin.commandName) {
                if (plugin.commandName[j] && plugin.command[j]) {
                  this.extraC[plugin.commandName[j]] = plugin.command[j];
                }
              }
            }
              for (var j in plugin.gamemodeId) {
                if (plugin.gamemodeId[j] && plugin.gamemode[j]) {
                  this.pluginGamemodes[plugin.gamemodeId[j]] = plugin.gamemode[j];
                }
              }
              var config = [];
              if (plugin.config && plugin.configfile) {
                config = plugin.config;
                try {
    // Load the contents of the config file
    var load = ini.parse(fs.readFileSync('./plugins/'  + files[i] + '/' + plugin.configfile, 'utf-8'));
    // Replace all the default config's values with the loaded config's values
    for (var obj in load) {
      this.plugins[plugin.name].config[obj] = load[obj];
      config[obj] = load[obj];
    }
  } catch (err) {
    // No config
    this.log("[\x1b[31mFAIL\x1b[0m] Plugin configs for " + plugin.name + " Cannot be loaded");
  }
              }
              plugin.init(this.gameServer, config);
          }

              this.log("[\x1b[32mOK\x1b[0m] loaded plugin: " + plugin.name + " By " + plugin.author + " version " + plugin.version);
            } else {
              this.log("[\x1b[31mFAIL\x1b[0m] Didnt load pluginfile " + files[i] + " because it was missing parameters");
            }
          } catch (e) {
            this.log("[\x1b[31mFAIL\x1b[0m] Failed to load pluginfile " + files[i] + " Reason: " + e);

          }
        }
      } catch (e) {
        this.log("[\x1b[31mFAIL\x1b[0m] Couldnt load plugins");
      }
    }


  }
}
