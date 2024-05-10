const serverSource = {
    name: "Server",
    isServer: true,
    color: 0x3F3FC0
};

/** @param {Connection} connection */
function getSourceFromConnection(connection) {
    return {
        isServer: false,
        name: connection.player.chatName,
        color: connection.player.chatColor
    };
}

class ChatChannel {
    /**
     * @param {Listener} listener
     */
    constructor(listener) {
        this.listener = listener;
        /** @type {Connection[]} */
        this.connections = [];
    }

    get settings() { return this.listener.handle.settings; }

    /**
     * @param {Connection} connection
     */
    add(connection) {
        const isPresent = this.connections.some(item => item.remoteAddress === connection.remoteAddress);

        if (!isPresent) {
            this.connections.push({
                remoteAddress: connection.remoteAddress,
                socket: connection
            });
        }
    }
    /**
     * @param {Connection} connection
     */
    remove(connection) {
        for (let i = 0; i < this.connections.length; i++) {
            if (this.connections[i].remoteAddress === connection.remoteAddress) {
                this.connections.splice(i, 1);
                break;
            }
        }
    }

    /**
     * @param {string} message
     */
    shouldFilter(message) {
        message = message.toLowerCase();

        for (let i = 0, l = this.settings.chatFilteredPhrases.length; i < l; i++)
            if (message.indexOf(this.settings.chatFilteredPhrases[i]) !== -1)
                return true;
        return false;
    }
    /**
     * @param {Connection=} source
     * @param {string} message
     */
    broadcast(source, message) {
        if (this.shouldFilter(message)) {
            return this.directMessage(null, source, "Your message contains banned words.");
        }

        const sourceInfo = source == null ? serverSource : getSourceFromConnection(source);

        for (let i = 0, l = this.connections.length; i < l; i++) {
            const conn = this.connections[i]; 

            if (conn && conn.socket) {
                conn.socket.protocol.onChatMessage(sourceInfo, message);
            }
        }
    }
    /**
     * @param {Connection=} source
     * @param {Connection} recipient
     * @param {string} message
     */
    directMessage(source, recipient, message) {
        if (this.shouldFilter(message)) {
            return this.directMessage(null, source, "Your message contains banned words.");
        }
        const sourceInfo = source == null ? serverSource : getSourceFromConnection(source);
        recipient.protocol.onChatMessage(sourceInfo, message);
    }
}

module.exports = ChatChannel;

const Listener = require("./Listener");
const Connection = require("./Connection");