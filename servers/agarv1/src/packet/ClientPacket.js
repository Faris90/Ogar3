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
function ClientPacket(gameServer, custom) {
  this.gameServer = gameServer;
  this.custom = custom;
}

module.exports = ClientPacket;

ClientPacket.prototype.build = function() {
  var config = this.gameServer.config;
  // this is an upcoming feature where the game can edit the client
  var send = { // Levels of "permission": 0 = not allowed, 1 = checked off but changeable, 2 = checked on but changeable, 3 = always on
   
   // Macros (1 = on)
    sMacro: config.clientSMacro,
    wMacro: config.clientWMacro,
    qMacro: config.clientQMacro,
    eMacro: config.clientEMacro,
    rMacro: config.clientRMacro,
    
    // Current client configs
    darkBG: config.clientDarkBG,
    chat: config.clientChat,
    skins: config.clientSkins,
    grid: config.clientGrid,
    acid: config.clientAcid,
    colors: config.clientColors,
    names: config.clientNames,
    showMass: config.clientShowMass,
    smooth: config.clientSmooth,
    
    // Future feature
    minionCount: 0,
    minimap: 0,
    
    // Others
    maxName: config.clientMaxName,
    
    title: config.clientTitle,
    defaultusername: config.clientDefaultUsername,
    nickplaceholder: config.clientNickPlaceholder,
    instructions: config.clientInstructions,
    leavemessage: config.clientLeaveMessage,
     // Advanced. If you do not know what your doing, dont do it.
    customHTML: "",
  };
 // for (var i in gameServer.client) send[i] = gameServer.client[i];
if (this.custom) {
send = this.custom;
}
  var toSend = JSON.stringify(send);
  
  var b = toSend.length + 2;
 var buf = new ArrayBuffer(b);
  var view = new DataView(buf);
view.setUint8(0, 70);
var offset = 1;
  if (toSend) {
    for (var j = 0; j < toSend.length; j++) {
        var c = toSend.charCodeAt(j);
        if (c) {
         view.setUint8(offset, c, true);
        }
        offset ++;
    }
  }
   view.setUint8(offset, 0, true); // End of string
    offset ++;
    return buf;
};
