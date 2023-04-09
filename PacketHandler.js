var Packet = require('./packet');
var Commands = require('./modules/CommandList');
var LastMsg;
var SpamBlock;

function PacketHandler(gameServer, socket) {
    this.gameServer = gameServer;
    this.socket = socket;
    // Detect protocol version - we can do something about it later
    this.protocol = 0;
    this.pressQ = false;
    this.pressW = false;
    this.pressSpace = false;
}

module.exports = PacketHandler;

PacketHandler.prototype.handleMessage = function(message) {
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
                this.socket.playerTracker.spectate = true;
            }
            break;
        case 16:
            var client = this.socket.playerTracker;
            if (view.byteLength == 13) {
                client.mouse.x = view.getInt32(1, true);
                client.mouse.y = view.getInt32(5, true);
            } else if (view.byteLength == 9) {
                client.mouse.x = view.getInt16(1, true);
                client.mouse.y = view.getInt16(3, true);
            } else if (view.byteLength == 21) {
                client.mouse.x = view.getFloat64(1, true);
                client.mouse.y = view.getFloat64(9, true);
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
        case 80:
        		// Some Code Agar.io Sends us o.O
            var yada = "";
            for (var i = 1; i < view.byteLength; i++) {
                var charCode = view.getUint8(i, true);
                yada += String.fromCharCode(charCode);
            }
        case 90:
            // Send Server Info
            var player = 0;
            var client;
            for (var i = 0; i < this.gameServer.clients.length; i++) {
                client = this.gameServer.clients[i].playerTracker;
                if ( ( client.disconnect <= 0 ) && ( client.spectate == false ) ) ++player;
            }
            this.socket.sendPacket(new Packet.ServerInfo(process.uptime().toFixed(0),player,this.gameServer.config.borderRight,this.gameServer.config.foodMaxAmount,this.gameServer.config.serverGamemode));
            break;
        case 255:
            // Connection Start
            if (view.byteLength == 5) {
                var c = this.gameServer.config,
                		player = 0,
                		client;
                for (var i = 0; i < this.gameServer.clients.length; i++) {
                    client = this.gameServer.clients[i].playerTracker;
                    if ( ( client.disconnect <= 0 ) && ( client.spectate == false ) ) ++player;
                }
                // Boot Player if Server Full
                if ( player > c.serverMaxConnections )
                {
                    this.socket.sendPacket(new Packet.ServerMsg(93));
                    this.socket.close();
                }
                this.socket.sendPacket(new Packet.SetBorder(c.borderLeft, c.borderRight, c.borderTop, c.borderBottom));
                this.socket.sendPacket(new Packet.ServerInfo(process.uptime().toFixed(0),player,c.borderRight,c.foodMaxAmount,this.gameServer.config.serverGamemode));
                break;
            }
            break;
        case 99:
            var message = "",
            		maxLen = this.gameServer.config.chatMaxMessageLength * 2,
            		offset = 2,
            		flags = view.getUint8(1);

            if (flags & 2) { offset += 4;  }
            if (flags & 4) { offset += 8;  }
            if (flags & 8) { offset += 16; }

            for (var i = offset; i < view.byteLength && i <= maxLen; i += 2) {
                var charCode = view.getUint16(i, true);
                if (charCode == 0) {
                    break;
                }
                message += String.fromCharCode(charCode);
            }
			 var date = new Date(),
            hour = date.getHours();
 if ((date - this.socket.playerTracker.cTime) < 2500) {
            var time = 1 + Math.floor(((2500 - (date - this.socket.playerTracker.cTime)) / 1000) % 60);
            // Happens when user tries to spam
            this.gameServer.sendMSG(this.socket.playerTracker, "Please don't spam...");
            break;
          }
		  
			this.socket.playerTracker.cTime = date;
            var zname = wname = this.socket.playerTracker.name;
            if ( wname == "" ) wname = "Spectator";

            if ( this.gameServer.config.serverAdminPass != '' )
            {
                var passkey = "/rcon " + this.gameServer.config.serverAdminPass + " ";
                if ( message.substr(0,passkey.length) == passkey ) {
                    var cmd = message.substr(passkey.length, message.length );
                    console.log("\u001B[36m" + wname + ": \u001B[0missued a remote console command: " + cmd );
                    var split = cmd.split(" "),
                    		first = split[0].toLowerCase(),
                    		execute = this.gameServer.commands[first];
                    if (typeof execute != 'undefined') {
                        execute(this.gameServer,split);
                    } else {
                        console.log("Invalid Command!");
                    }
                    break;
                } else if ( message.substr(0,6) == "/rcon " ) {
                		console.log("\u001B[36m" + wname + ": \u001B[0missued a remote console command but used a wrong pass key!" );
                		break;
                }
            }

            if( message == LastMsg ) {
                ++SpamBlock;
                if( SpamBlock > 10 ) this.gameServer.banned.push(this.socket.remoteAddress);
                if( SpamBlock > 5 ) this.socket.close();
                break;
            }
            LastMsg = message;
            SpamBlock = 0;

            console.log( "\u001B[36m" + wname + ": \u001B[0m" + message );

            var date = new Date(),
            		hour = date.getHours();
            hour = (hour < 10 ? "0" : "") + hour;
            var min  = date.getMinutes();
            min = (min < 10 ? "0" : "") + min;
            hour += ":" + min;

            var fs = require('fs');
            var wstream = fs.createWriteStream('logs/chat.log', {flags: 'a'});
            wstream.write( '[' + hour + '] ' + wname + ': ' + message + '\n');
            wstream.end();

            var packet = new Packet.Chat(this.socket.playerTracker, message);
            // Send to all clients (broadcast)
            for (var i = 0; i < this.gameServer.clients.length; i++) {
                this.gameServer.clients[i].sendPacket(packet);
            }
            break;
        default:
            break;
    }
};

PacketHandler.prototype.setNickname = function(newNick) {
    var client = this.socket.playerTracker;
    if (client.cells.length < 1) {
        // Set name first
        client.setName(newNick);

        // If client has no cells... then spawn a player
        this.gameServer.gameMode.onPlayerSpawn(this.gameServer,client);

        // Turn off spectate mode
        client.spectate = false;
    }
};

