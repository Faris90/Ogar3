var Packet = require('./../packet/index');
var commands = require('../modules/CommandList').chat;
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
function PacketHandler(gameServer, socket) {
  this.gameServer = gameServer;
  this.socket = socket;
  // todo Detect protocol version - we can do something about it later
  this.protocol = 0;

  this.pressQ = false;
  this.pressW = false;
  this.pressSpace = false;
  this.pressE = false;
  this.pressR = false;
  this.pressT = false;
}

module.exports = PacketHandler;

PacketHandler.prototype.handleMessage = function(message) {
  try {
    function stobuf(buf) {
      var length = buf.length;
      var arrayBuf = new ArrayBuffer(length);
      var view = new Uint8Array(arrayBuf);

      for (var i = 0; i < length; i++) {
        view[i] = buf[i];
      }

      return view.buffer;
    }

    // Discard empty messages
    if (message.length == 0) {
      return;
    }

    var buffer = stobuf(message);
    var view = new DataView(buffer);
    var packetId = view.getUint8(0, true);

    switch (packetId) {
      case 0:
        // Check for invalid packets
        if ((view.byteLength + 1) % 2 == 1) {
          break;
        }

        // Set Nickname
        var nick = "";
        var maxLen = this.gameServer.config.playerMaxNickLength * 2; // 2 bytes per char
        for (var i = 1; i < view.byteLength && i <= maxLen; i += 2) {
          var charCode = view.getUint16(i, true);
          if (charCode == 0) {
            break;
          }

          nick += String.fromCharCode(charCode);
        }
        this.setNickname(nick);
        break;
      case 1:
        // Spectate mode
        if (this.socket.playerTracker.cells.length <= 0) {
          // Make sure client has no cells
          this.gameServer.switchSpectator(this.socket.playerTracker);
          if (!this.socket.playerTracker.spectate) {
            if (this.gameServer.config.kickspectate > 0 && this.gameServer.whlist.indexOf(this.socket.remoteAddress) == -1) {
              this.socket.playerTracker.spect = setTimeout(function() {
                if (this.socket.playerTracker.spectate && this.gameServer.whlist.indexOf(this.socket.remoteAddress) == -1) {
                  this.socket.close();
                }
              }.bind(this), this.gameServer.config.kickspectate * 1000);
            }
          }

          this.socket.playerTracker.spectate = true;
        }
        break;
      case 16:
        // Set Target
        if (view.byteLength == 21) {
          var client = this.socket.playerTracker; // Scramble
          client.mouse.x = view.getFloat64(1, true) - client.scrambleX; // Scramble
          client.mouse.y = view.getFloat64(9, true) - client.scrambleY;
        } else if (view.byteLength == 13) {
          var client = this.socket.playerTracker; // Scramble
          client.mouse.x = view.getInt32(1, true) - client.scrambleX; // Scramble
          client.mouse.y = view.getInt32(5, true) - client.scrambleY;

        }

        break;
      case 17:
        // Space Press - Split cell
        this.pressSpace = true;
        break;
      case 18:
        // Q Key Pressed
        this.pressQ = true;
        break;
      case 19:
        // Q Key Released
        break;
      case 21:
        // W Press - Eject mass
        this.pressW = true;
        break;
      case 22:
        this.pressE = true;
        break;
      case 23:
        this.pressR = true;
        break;
      case 24:
        this.pressT = true;
        break;
      case 255:
        // Connection Start
        if (view.byteLength == 5) {
          this.protocol = view.getUint32(1, true);
          // Send SetBorder packet first
          var c = this.gameServer.config;
          this.socket.sendPacket(new Packet.SetBorder(
            c.borderLeft + this.socket.playerTracker.scrambleX, // Scramble
            c.borderRight + this.socket.playerTracker.scrambleX,
            c.borderTop + this.socket.playerTracker.scrambleY,
            c.borderBottom + this.socket.playerTracker.scrambleY
          ));
          if (this.gameServer.isMaster) this.socket.sendPacket(new Packet.DataPacket(this.gameServer));
          this.socket.sendPacket(new Packet.ClientPacket(this.gameServer));
        }
        break;
      case 90: // from cigar

        var message = "";
        var maxLen = this.gameServer.config.chatMaxMessageLength * 2; // 2 bytes per char
        var offset = 2;
        var flags = view.getUint8(1); // for future use (e.g. broadcast vs local message)
        if (flags & 2) {
          offset += 4;
        }
        if (flags & 4) {
          offset += 8;
        }
        if (flags & 8) {
          offset += 16;
        }
        for (var i = offset; i < view.byteLength && i <= maxLen; i += 2) {
          var charCode = view.getUint16(i, true);
          if (charCode == 0) {
            break;
          }
          message += String.fromCharCode(charCode);
        }
        var packet = new Packet.Chat(this.socket.playerTracker, message);
        // Send to all clients (broadcast)
        for (var i = 0; i < this.gameServer.clients.length; i++) {
          this.gameServer.clients[i].sendPacket(packet);
        }
        break;
      case 99: // from cigar
        for (var i in this.gameServer.plugins) {
          if (this.gameServer.plugins[i].beforechat) {
            if (!this.gameServer.plugins[i].beforechat(this.socket.playerTracker)) return;
          }
        }
        if (this.gameServer.config.allowChat == 1) {
          if (!this.socket.playerTracker.chatAllowed) {
            this.gameServer.pm(this.socket.playerTracker.pID, " You are not allowed to chat!");
            return;
          }
          if (this.gameServer.config.specChatAllowed != 1) {
            if (this.socket.playerTracker.cells.length < 1) {
              this.gameServer.pm(this.socket.playerTracker.pID, " Please play to chat!");
              return;
            }

          }
          var message = "",
            maxLen = this.gameServer.config.chatMaxMessageLength * 2,
            offset = 2,
            flags = view.getUint8(1);

          if (flags & 2) {
            offset += 4;
          }
          if (flags & 4) {
            offset += 8;
          }
          if (flags & 8) {
            offset += 16;
          }

          for (var i = offset; i < view.byteLength && i <= maxLen; i += 2) {
            var charCode = view.getUint16(i, true);
            if (charCode == 0) {
              break;
            }
            message += String.fromCharCode(charCode);
          }

          var zname = wname = this.socket.playerTracker.name;
          if (wname == "") wname = "Spectator";
          for (var i in this.gameServer.plugins) {
            if (this.gameServer.plugins[i].beforecmsg) {
              if (!this.gameServer.plugins[i].beforecmsg(this.socket.playerTracker, message)) break;
            }
          }
          if (this.gameServer.config.serverAdminPass != '') {
            var passkey = "/rcon " + this.gameServer.config.serverAdminPass + " ";
            if (message.substr(0, passkey.length) == passkey) {
              this.socket.playerTracker.isAdmin = true;
              var cmd = message.substr(passkey.length, message.length);
              var split = cmd.split(" "),
                first = split[0].toLowerCase();
              console.log("[Console] " + wname + " has issued a remote command " + cmd + " and is logged in!");

              this.gameServer.consoleService.execCommand(first, split);
              this.gameServer.pm(this.socket.playerTracker.pID, "Command Sent and Logged in!")
              break;
            } else if (this.socket.playerTracker.isAdmin && message.substr(0, 6) == "/rcon ") {
              var l = "/rcon ";
              var cmd = message.substr(l.length, message.length);
              var split = cmd.split(" "),
                first = split[0].toLowerCase();
              console.log("[Console] " + wname + " has issued a remote command " + cmd);
              this.gameServer.pm(this.socket.playerTracker.pID, "Command Sent!")
              this.gameServer.consoleService.execCommand(first, split);

              break;
            } else if (message.substr(0, 6) == "/rcon ") {
              console.log("[Console] " + wname + " has issued a remote command but used the wrong password!");
              this.gameServer.pm(this.socket.playerTracker.pID, "Wrong Password!")
              break;
            }
          }

          if (message.charAt(0) == "/") {
            var str = message.substr(1);
            var split = str.split(" ");
            var exec = commands[split[0]];
            if (exec) {
              try {
                exec(this.gameServer, this.socket.playerTracker, split);
              } catch (e) {
                this.gameServer.pm(this.socket.playerTracker.pID, " There was an error with the command, " + e);
                console.log("[Console] Caught error " + e);
              }
              break;
            }
            this.gameServer.pm(this.socket.playerTracker.pID, "That is not a valid command! Do /help for a list of commands!");
            break;
          }
          var date = new Date(),
            hour = date.getHours();

          if ((date - this.socket.playerTracker.cTime) < this.gameServer.config.chatIntervalTime) {
            var time = 1 + Math.floor(((this.gameServer.config.chatIntervalTime - (date - this.socket.playerTracker.cTime)) / 1000) % 60);
            // Happens when user tries to spam
            this.gameServer.pm(this.socket.playerTracker.pID, " Please dont spam.");
            break;
          }

          blockedWords = this.gameServer.config.chatBlockedWords.split(";");

          // Removes filtered words.
          var chatFilter = 0;

          function checkChat() {
            if (chatFilter !== blockedWords.length) {
              message = message.replace(blockedWords[chatFilter], "****");
              chatFilter++;
              checkChat();
            }
          }

          checkChat();

          this.socket.playerTracker.cTime = date;
          var LastMsg;
          if (message == LastMsg) {
            ++SpamBlock;
            if (SpamBlock > 5) {
              this.socket.playerTracker.chatAllowed = false;
              this.gameServer.pm(this.socket.playerTracker.pID, " Your chat is banned because you are spammin!");
            }
            this.gameServer.pm(this.socket.playerTracker.pID, " Please dont spam.");
            break;
          }
          LastMsg = message;
          SpamBlock = 0;
          hour = (hour < 10 ? "0" : "") + hour;
          var min = date.getMinutes();
          min = (min < 10 ? "0" : "") + min;
          hour += ":" + min;

          var fs = require('fs');

          var packet = new Packet.Chat(this.socket.playerTracker, message);
          // Send to all clients (broadcast)
          for (var i = 0; i < this.gameServer.clients.length; i++) {
            if (!this.gameServer.clients[i].playerTracker.chat) continue;
            this.gameServer.clients[i].sendPacket(packet);
          }
        } else {
          this.gameServer.pm(this.socket.playerTracker.pID, " Chat is not allowed!");
        }
        break;
      default:
        break;
    }
  } catch (e) {
    console.log("[WARN] Stopped crash at packethandler. Probably because of wrong packet/client . Usually normal.");
  }
};

PacketHandler.prototype.setNickname = function(newNick) {
  var client = this.socket.playerTracker;
  if (client.cells.length < 1) {
    // Set name first
    client.setName(newNick);

    // If client has no cells... then spawn a player

    if (!client.nospawn) this.gameServer.gameMode.onPlayerSpawn(this.gameServer, client);

    // Turn off spectate mode
    client.spectate = false;
  }
};
