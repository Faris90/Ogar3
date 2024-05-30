const serverSource = {
	name: 'Server',
	isServer: true,
	color: 0x3F3FC0
}

/** @param {Connection} connection */
function getSourceFromConnection(connection) {
	return {
		isServer: false,
		name: connection.player.chatName,
		color: connection.player.chatColor
	}
}

class ChatChannel {
	/**
	 * @param {Listener} listener
	 */
	constructor(listener) {
		this.listener = listener
		/** @type {Connection[]} */
		this.connections = []
	}

	get settings() { return this.listener.handle.settings }

	/**
	 * @param {Connection} connection
	 */
	add(connection) {
		const isPresent = this.connections.some(item => item.hash === connection.remoteAddress + '-' + (connection.player && typeof connection.player.id !== 'undefined' ? connection.player.id : 0))

		if (!isPresent) {
			this.connections.push({
				hash: connection.remoteAddress + '-' + (connection.player && typeof connection.player.id !== 'undefined' ? connection.player.id : 0),
				socket: connection
			})
		} else {
			this.remove(connection)

			this.connections.push({
				hash: connection.remoteAddress + '-' + (connection.player && typeof connection.player.id !== 'undefined' ? connection.player.id : 0),
				socket: connection
			})
		}
	}
	/**
	 * @param {Connection} connection
	 */
	remove(connection) {
		for (let i = 0; i < this.connections.length; i++) {
			if (this.connections[i].hash === (connection.remoteAddress + '-' + (connection.player && typeof connection.player.id !== 'undefined' ? connection.player.id : 0))) {
				this.connections.splice(i, 1)
				break
			}
		}
	}

	/**
	 * @param {string} message
	 */
	shouldFilter(message) {
		message = message.toLowerCase()
		message = message.replace(/  +/g, ' ')
		message = message.replace(/(.)\1{3,}/gi, '$1')

		for (let i = 0, l = this.settings.chatFilteredPhrases.length; i < l; i++) {
			if (message.indexOf(this.settings.chatFilteredPhrases[i]) !== -1) {
				this.listener.logger.inform(`MESSAGE REJECTED '${message}' contains '${this.settings.chatFilteredPhrases[i]}'`)
				return true
			}
		}

		return false
	}
	/**
	 * @param {Connection} source
	 * @param {string} message
	 */
	broadcast(source, message) {
		if (this.shouldFilter(message)) {
			return source.protocol.onChatMessage(serverSource, 'Last message was not sent, because it contains banned words.')
		}

		const sourceInfo = source == null ? serverSource : getSourceFromConnection(source)

		for (let i = 0, l = this.connections.length; i < l; i++) {
			const conn = this.connections[i]

			if (conn && conn.socket && conn.socket !== source) {
				conn.socket.protocol.onChatMessage(sourceInfo, message)
			}
		}
	}
	/**
	 * @param {Connection} source
	 * @param {Connection} recipient
	 * @param {string} message
	 */
	directMessage(source, recipient, message) {
		if (this.shouldFilter(message)) {
			return recipient.protocol.onChatMessage(serverSource, 'Last message was not sent, because it contains banned words.')
		}

		const sourceInfo = source == null ? serverSource : getSourceFromConnection(source)
		recipient.protocol.onChatMessage(sourceInfo, message)
	}
}

module.exports = ChatChannel