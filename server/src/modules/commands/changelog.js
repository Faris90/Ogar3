var request = require('request');

module.exports = function (gameServer, split) {
  var page = parseInt(split[1]);
  if (isNaN(page) || page < 1) {
    page = 1
  }
  var limit = page * 10;
  console.log("[Console] Sending a request to the servers...");
  request('http://raw.githubusercontent.com/AJS-development/verse/master/updatelog', function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var newb = body.split(/[\r\n]+/).filter(function (x) {
        return x != ''; // filter empty
      });
      if (page > Math.ceil(newb.length / 10)) page = Math.ceil(newb.length / 10);
      console.log("[Console] Update log - Page " + page + "/" + Math.ceil(newb.length / 10));
      for (var i in newb) {
        if (i < limit && i >= limit - 10) {

          console.log("[Console] " + newb[i]);
        }
      }

    } else {
      console.log("[Console] Could not connect to servers. Aborting...");

    }
  });
};
