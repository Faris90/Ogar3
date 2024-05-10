'use strict';
// todo @Michael done - need to rewrite this function as there is a lot of repeated code that could be refactored / dry
// done - should be a list of files that is handled by a generic function, no need to write the same code for each file
// done - next need to move the file list out into a json file
// done - next add hashing so we only have to download files that are newer
// done - next refactor this to use promises/waterfall or something alone that lines

const fs = require('fs');

module.exports = function (gameServer, split) {
  let arg = split[1];
  if (!fs.existsSync('./packet')) {
    console.err("[Console] Error: could not perform action. Cause: You deleted folders or you are using a binary");
    return;
  }
  switch (arg) {
    case 'botnames':
      console.log("[Update] Updating Botnames");
      gameServer.updater.downloadFile(gameServer.updater.getFileByName("botnames"), (err, res)=> {
        if (!err) {
          gameServer.updater.downloadFile(gameServer.updater.getFileByName("realisticnames"));
        } else {
          console.err("[Console] Error: failed to download files. err msg: " + err);
        }
      });
      break;
    case 'skins':
      console.log("[Console] Updating customskin.txt...");
      gameServer.updater.downloadFile(gameServer.updater.getFileByName("customskins"));
      gameServer.updater.downloadFile(gameServer.updater.getFileByName("randomSkins"));
      break;
    case 'all':
      console.log("[Console] Fetching data from the servers...");
      gameServer.updater.init()
      setTimeout(function() {
      gameServer.updater.downloadAllFiles();
      },2000);
      break;
    case 'updates':
      console.log("[Console] Fetching data from the servers...");
      gameServer.updater.downloadUpdatedFiles();
      break;
    default:
      console.log("[Console] Please do update updates, all, botnames, or skins instead of update to confirm.");
  }
};
