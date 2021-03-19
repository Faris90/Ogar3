module.exports = {
  Mode: require('./Mode'),
  FFA: require('./FFA'),
  Teams: require('./Teams'),
  Experimental: require('./Experimental'),
  Experimental2: require('./Experimental v2'),
  Tournament: require('./Tournament'),
  HungerGames: require('./HungerGames'),
  Rainbow: require('./Rainbow'),
  Debug: require('./Debug'),
  Zombie: require('./Zombie'),
// TeamZ: require('./TeamZ.js'),
  TeamX: require('./TeamX.js'),
  NCTeams: require('./NoCollisionTeams.js'),
 // NCTeamZ: require('./NoCollisionTeamZ.js'),
  NCTeamX: require('./NoCollisionTeamX.js'),
  Unlimitpvp: require('./Unlimitpvp.js'),
  UnlimitFFA: require('./Unlimitffa.js'),
  Leap: require('./Leap.js'),
  BlackHole: require('./BlackHole.js'),
  TFFA: require('./TFFA.js'),
  VirusOff: require('./VirusOff.js'),
  SFFA: require('./SFFA.js'),
};

var get = function (id, gameServer) {
  var mode;
  switch (id) {
    case 1: // Teams
      mode = new module.exports.Teams();
      break;
    case 2: // Experimental
      mode = new module.exports.Experimental();
      break;
    case 3: // TFFA
      mode = new module.exports.TFFA();
      break;
    case 4: // VirusOff
      mode = new module.exports.VirusOff();
      break;
    case 5: // unlimitpvp
      mode = new module.exports.Unlimitpvp();
      break;
    case 6: // unlimitFFA
      mode = new module.exports.UnlimitFFA();
      break;
    case 7: // Shrinking ffa
      mode = new module.exports.SFFA();
      break;
    case 8: // Experimental v2
      mode = new module.exports.Experimental2();
      break;
    case 10: // Tournament
      mode = new module.exports.Tournament();
      break;
    case 11: // Hunger Games
      mode = new module.exports.HungerGames();
      break;
    case 12: // Zombie
      mode = new module.exports.Zombie();
      break;
   // case 13: // Zombie Team
     // mode = new module.exports.TeamZ();
    //  break;
    case 14: // Experimental Team
      mode = new module.exports.TeamX();
      break;
    case 15: // No Collision Team
      mode = new module.exports.NCTeams();
      break;
  // case 16: // No Collision Zombie Team
    //  mode = new module.exports.NCTeamZ();
    //  break;
    case 17: // No Collision Experimental Team
      mode = new module.exports.NCTeamX();
      break;
    case 18: // leap
      mode = new module.exports.Leap();
      break;
    case 20: // Rainbow
      mode = new module.exports.Rainbow();
      break;
    case 21: // Debug
      mode = new module.exports.Debug();
      break;
    case 22: // BlackHole
      mode = new module.exports.BlackHole();
      break;
    case 23: // No Collision Experimental Team
      mode = new module.exports.NCTeamX();
      break;
    default: // FFA is default
      if (gameServer && gameServer.pluginGamemodes[id]) {
        mode = new gameServer.pluginGamemodes[id];

      } else {

        mode = new module.exports.FFA();
      }
      break;
  }
  return mode;
};

module.exports.get = get;
