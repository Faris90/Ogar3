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
// Imports
//var Teams = require('../gamemodes/Teams.js');
//var GameMode = require('../gamemodes');
//var Entity = require('../entity');
//var EjectedMass = require('../entity/EjectedMass');
// fs sync functions are not called while server is running basicly
//var fs = require("fs");
var request = require('request');

function Commands() {
  this.list = {}; // Empty
}

module.exports = Commands;

// Utils
//var fillChar = require('./commands/fillChar.js');

// Commands
Commands.chat = {
  help: function(gameServer,player,split) {
    var msg = function(m) {
      gameServer.pm(player.pID,m);
    }
    msg("============ Available Commands... =============");
    msg("Color [r] [b] [g]  | Change your chat color");
    msg("Mute               | Mute/unmute chat");
    msg("Pm [chatname] [msg]| Privatly message a player");
    msg("================================================");
  },
  pm: require('./commands/pm.js'),
  color: require('./commands/colorchat.js'),
  mute: require('./commands/mute.js'),
  
  
}
Commands.multiverse = {
    multiverse: require('./commands/multiverse.js'),
    exit: require('./commands/exit.js'),
    quickrestart: require('./commands/quickrestart.js'),
}
Commands.list = {
  ophelp: function (gameServer, split) {
    console.log("[Console] ======================= OP HELP =====================");
    console.log("You use OP by first setting who has op by doing op [id] in console. Then, that player can use the op features in game by pressing q. Then a c will appear next to your name. If you press w in this state, it gives you 100 more mass. If you press space in this state, you will be able to rejoin instantly. You will find out that if you press q again, two c's will appear next to your name. if you press w in this state, you shoot viruses. If you press space in this state, you shoot tiny things (almost invisible) that if someone eats, their mass is reduced by 100. Then, if you press q again,3 c's will appear.press w with 3c's, you shoot a virus, but whoever who eats it will be trolled :). If you press space with 3 c's the person who eats the virus will explode.If you press q again, 4 cs will appear and if you press w, you will shoot a virus tha kills people and space, it shoots a kick virus. You can then exit op by pressing q again after doing an action or by pressing Q until the three c's will dissappear (so that you can normally split and shoot mass).");
    console.log("[Console] ===================== OP Usage Map ===================");
    console.log("One C:");
    console.log("W = Addmass 100+");
    console.log("Space = Merge Instantly");
    console.log("");
    console.log("Two C's:");
    console.log("W = Shoot virus");
    console.log("Space = Shoot Mass that decreases 100 mass from consumer");
    console.log("");
    console.log("Three C's:");
    console.log("W = Troll virus");
    console.log("Space = Explode virus");
    console.log("Four C's:");
    console.log("W = Kill virus");
    console.log("Space = Kick Virus");
    console.log("[Console] ====================================================");
  },
  help: function (gameServer, split) {
    console.log("[Console] ======================== HELP ======================");
    console.log("[Console] ophelp     : Shows OP help");
    console.log("[Console] addbot     : add bot to the server");
    console.log("[Console] kickbots   : kick a specified amount of bots");
    console.log("[Console] board      : set scoreboard text");
    console.log("[Console] Restart    : Restart server or set time till restart");
    console.log("[Console] Announce   : Starts the auto announce for high scores");
    console.log("[Console] boardreset : reset scoreboard text");
    console.log("[Console] Spawn      : Spawn things");
    console.log("[Console] change     : change specified settings");
    console.log("[Console] clear      : clear console output");
    console.log("[Console] color      : set cell(s) color by client ID");
    console.log("[Console] exit       : stop the server");
    console.log("[Console] garbage    : Garbage collection");
    console.log("[Console] food       : spawn food at specified Location");
    console.log("[Console] Freeze     : Freezes a player");
    console.log("[Console] spawnmass  : sets players spawn mass");
    console.log("[Console] plugin     : Manage plugins ");
    console.log("[Console] Multiverse : Manage servers");
    console.log("[Console] Chatban    : ban/unban people from chatting");
    console.log("[Console] rcon       : In Chat Remote Control")
    console.log("[Console] Pcmd       : Periodical commands");
    console.log("[Console] gamemode   : change server gamemode");
    console.log("[Console] Quickrestart : Quickly restart the server in a rush. Not real restart");
    console.log("[Console] kick       : kick player or bot by client ID");
    console.log("[Console] kill       : kill cell(s) by client ID");
    console.log("[Console] Reset      : Destroys everything and starts from scratch");
    console.log("[Console] killall    : kill everyone");
    console.log("[Console] mass       : set cell(s) mass by client ID");
    console.log("[Console] Uniban     : lists unibanned people");
    console.log("[Console] name       : change cell(s) name by client ID");
    console.log("[Console] playerlist : get list of players and bots");
    console.log("[Console] pause      : pause game , freeze all cells");
    console.log("[Console] reload     : reload config");
    console.log("[Console] Speed      : Sets a players base speed");
    console.log("[Console] status     : get server status");
    console.log("[Console] tp         : teleport player to specified location");
    console.log("[Console] virus      : spawn virus at a specified Location");
    console.log("[Console] Kickrange  : kicks in a ID range");
    console.log("[Console] Killrange  : kills in a ID range");
    console.log("[Console] Verify     : EasyVerify command");
    console.log("[Console] Hide       : Hides/unhides a player");
    console.log("[Console] Banrange   : Bans in a ID range");
    console.log("[Console] Merge      : Forces that player to merge");
    console.log("[Console] Nojoin     : Prevents the player from merging");
    console.log("[Console] Msg        : Sends a message");
    console.log("[Console] Killbots   : Kills bots");
    console.log("[Console] Fmsg       : Sends a Force Message");
    console.log("[Console] Pmsg       : Periodically sends a message");
    console.log("[Console] Spmsg      : Stops any Pmsg proccess");
    console.log("[Console] Pfmsg      : Periodically sends a force message");
    console.log("[Console] Sfpmsg     : Stops any Pfmsg proccess");
    console.log("[Console] Rop        : Resets op");
    console.log("[Console] Range      : does bulk command with players");
    console.log("[Console] Op         : Makes that player OP");
    console.log("[Console] Dop        : De-Ops a player");
    console.log("[Console] Opbyip     : Allows ypu to control the opbyip feature");
    console.log("[Console] Ban        : Bans an IP and senda a msg saying that person was banned");
    console.log("[Console] Banlist    : Lists banned IPs");
    console.log("[Console] Clearban   : Resets Ban list");
    console.log("[Console] Resetvirus : Turns special viruses (from op's) into normal ones");
    console.log("[Console] Split      : Splits a player");
    console.log("[Console] Minion     : Creates minions that suicide into you");
    console.log("[Console] Team       : Changes a players Team");
    console.log("[Console] Colortext  : changes text style");
    console.log("[Console] Shrink     : Shrinks the game");
    console.log("[Console] Enlarge    : Enlargens the game");
    console.log("[Console] Explode    : Explodes a player");
    console.log("[Console] Resetateam : Resets anti team effect for a player");
    console.log("[Console] Rainbow    : Gives rainbow effect to a player");
    console.log("[Console] Update     : Updates server to the latest version");
    console.log("[Console] Chat       : Chat using the console!");
    console.log("[Console] changelog  : Shows a changelog");
    if (gameServer.plugins) {
      for (var i in gameServer.plugins) {
        var plugin = gameServer.plugins[i];
        if (plugin.addToHelp) {
          for (var j in plugin.addToHelp) {
            console.log("[Console] " + plugin.addToHelp[j]);
          }
        }

      }

    }
    console.log("[Console] ====================================================");
  },
  plugin: require('./commands/plugin.js'),
  blind: require('./commands/blind.js'),
  uniban: require('./commands/uniban.js'),
  garbage: require('./commands/garbage.js'),
  pcmd: require('./commands/pcmd.js'),
  reset: require('./commands/reset.js'),
  delete: require('./commands/delete.js'),
  minion: require('./commands/minion.js'),
  spawn: require('./commands/spawn.js'),
  changelog: require('./commands/changelog.js'),
  rcon: require('./commands/rcon.js'),
  update: require('./commands/update.js'),
  explode: require('./commands/explode.js'),
  resetateam: require('./commands/resetateam.js'),
  chatban: require('./commands/chatban.js'),
  enlarge: require('./commands/enlarge.js'),
  shrink: require('./commands/shrink.js'),
  colortext: require('./commands/colortext.js'),
  chat: require('./commands/chat.js'),
  hide: require('./commands/hide.js'),
  announce: require('./commands/announce.js'),
  //todo the second whitlelist over writes this one, it should likely be removed:
  // whitelist: require('./commands/whitelist.js'),
  clearwhitelist: require('./commands/clearwhitelist.js'),
  whitelist: require('./commands/whitelist2.js'),
  unwhitelist: require('./commands/unwhitelist.js'),
  unban: require('./commands/unban.js'),
  team: require('./commands/team.js'),
  split: require('./commands/split.js'),
  resetvirus: require('./commands/resetvirus.js'),
  ban: require('./commands/ban.js'),
  banlist: require('./commands/banlist.js'),
  clearban: require('./commands/clearban.js'),
  rop: require('./commands/rop.js'),
  opbyip: require('./commands/opbyip.js'),
  op: require('./commands/op.js'),
  dop: require('./commands/dop.js'),
  spmsg: require('./commands/spmsg.js'),
  pmsg: require('./commands/pmsg.js'),
  spfmsg: require('./commands/spfmsg.js'),
  pfmsg: require('./commands/pfmsg.js'),
  fmsg: require('./commands/fmsg.js'),
  msg: require('./commands/msg.js'),
  troll: require('./commands/troll.js'),
  verify: require('./commands/verify.js'),
  nojoin: require('./commands/nojoin.js'),
  freeze: require('./commands/freeze.js'),
  spawnmass: require('./commands/spawnmass.js'),
  speed: require('./commands/speed.js'),
  merge: require('./commands/merge.js'),
  addbot: require('./commands/addbot.js'),
  kickbots: require('./commands/kickbots.js'),
  killbots: require('./commands/killbots.js'),
  board: require('./commands/board.js'),
  boardreset: require('./commands/boardreset.js'),
  change: require('./commands/change.js'),
  clear: require('./commands/clear.js'),
  color: require('./commands/color.js'),
  restart: require('./commands/restart.js'),
  food: require('./commands/food.js'),
  gamemode: require('./commands/gamemode.js'),
  kick: require('./commands/kick.js'),
  range: require('./commands/range.js'),
  killrange: require('./commands/range.js'),
  banrange: require('./commands/banrange.js'),
  kickrange: require('./commands/kickrange.js'),
  kill: require('./commands/kill.js'),
  highscore: require('./commands/kill.js'),
  killall: require('./commands/killall.js'),
  mass: require('./commands/mass.js'),
  name: require('./commands/name.js'),
  playerlist: require('./commands/playerlist.js'),
  pause: require('./commands/pause.js'),
  rainbow: require('./commands/rainbow.js'),
  reload: require('./commands/reload.js'),
  status: require('./commands/status.js'),
  tp: require('./commands/tp.js'),
  virus: require('./commands/virus.js'),
};
