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
function DataPacket(gameServer) {
  this.gameServer = gameServer;
}

module.exports = DataPacket;

DataPacket.prototype.build = function() {
var result = "";
for (var i in this.gameServer.multiverse) {
var info = this.gameServer.multiverse[i];
var s = info.id + ":" + info.title + ":" + info.port
result = result + s + "|";
}

var b = result.length + 2;
 var buf = new ArrayBuffer(b);
  var view = new DataView(buf);
view.setUint8(0, 45);
var offset = 1;

    if (result) {
      for (var j = 0; j < result.length; j++) {
        var c = result.charCodeAt(j);
        if (c) {
         view.setUint8(offset, c, true);
        }
        offset ++;
    }
    }
    view.setUint8(offset, 0, true); // End of string
    offset ++;

return buf;
}
