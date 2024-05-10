var GameMode = require('../../gamemodes');

module.exports = function(gameServer, split) {
  if (split[1]) var cn = split[1].toLowerCase();
  else var cn = '';
  if (cn == "list") {
    console.log("[Console] =================== GAMEMODES ======================");
    console.log("Gamemode 0: FFA");
    console.log("Gamemode 1: Teams");
    console.log("Gamemode 2: Experimental");
    console.log("Gamemode 3: TimedFFA");
    console.log("Gamemode 4: VirusOff");
    console.log("Gamemode 5: UnlimitPVP");
    console.log("Gamemode 6: UnlimitFFA");
    console.log("Gamemode 7: ShrinkingFFA");
    console.log("Gamemode 8: Experimental v2");
    console.log("Gamemode 9: AnonymousFFA");
    console.log("Gamemode 10: Tournament");
    console.log("Gamemode 11: Hunger Games");
    console.log("Gamemode 12: Zombie");
    console.log("Gamemode 14: Experimental Team");
    console.log("Gamemode 15: NoCollisionTeams");
    console.log("Gamemode 18: Leap");
    console.log("Gamemode 20: Rainbow");
    console.log("Gamemode 21: Debug");
    console.log("Gamemode 22: Blackhole");
    console.log("Gamemode 23: NoCollisionExperimentalTeam");
    console.log("[Console] ====================================================");
  } else {
    try {
      var n = parseInt(split[1]);
      var gm = GameMode.get(n); // If there is an invalid gamemode, the function will exit
      gameServer.gameMode.onChange(gameServer); // Reverts the changes of the old gamemode
      gameServer.gameMode = gm; // Apply new gamemode
      gameServer.gameMode.onServerInit(gameServer); // Resets the server
      console.log("[Game] Changed game mode to " + gameServer.gameMode.name);
    } catch (e) {
      console.log("[Console] Invalid game mode selected");
    }
  }
};
