const WebSocket = require("uws");
const WebSocketServer = WebSocket.Server;
const url = require('url');
const request = require('request');
const Connection = require("./Connection");
const ChatChannel = require("./ChatChannel");
const { filterIPAddress } = require("../primitives/Misc");

class Listener {
	/**
	 * @param {ServerHandle} handle
	 */
	constructor(handle) {
		/** @type {WebSocketServer} */
		this.listenerSocket = null;
		this.handle = handle;
		this.globalChat = new ChatChannel(this);
		/** @type {Router[]} */
		this.routers = [];
		/** @type {Connection[]} */
		this.connections = [];
		/** @type {Counter<IPAddress>} */
		this.connectionsByIP = { };
	}
	get settings() { return this.handle.settings; }
	get logger() { return this.handle.logger; }
	open() {
		if (this.listenerSocket !== null) return false;

		this.logger.debug(`listener opening at ${this.settings.listeningPort}`);

		this.listenerSocket = new WebSocketServer({
			port: this.settings.listeningPort,
			verifyClient: this.verifyClient.bind(this)
		}, this.onOpen.bind(this));

		this.listenerSocket.on("connection", this.onConnection.bind(this));

		return true;
	}
	close() {
		if (this.listenerSocket === null) return false;

		this.logger.debug("listener closing");
		this.listenerSocket.close();
		this.listenerSocket = null;

		return true;
	}
	/**
	 * @param {{req: any, origin: string}} info
	 * @param {*} response
	 */
	verifyClient(info, response) {
		const ip = typeof info.req.headers['x-real-ip'] !== 'undefined' ? info.req.headers['x-real-ip'] : info.req.socket.remoteAddress;
		const address = filterIPAddress(ip);
		this.logger.onAccess(`REQUEST FROM ${address}, ${info.secure ? "" : "not "}secure, Origin: ${info.origin}`);

		if (this.connections.length > this.settings.listenerMaxConnections) {
			this.logger.inform("listenerMaxConnections reached, dropping new connections");

			return void response(false, 503, "Service Unavailable");
		}

		const acceptedOrigins = this.settings.listenerAcceptedOrigins;

		if (acceptedOrigins.length > 0 && acceptedOrigins.indexOf(info.origin) === -1) {
			this.logger.inform(`listenerAcceptedOrigins doesn't contain ${info.origin}`);

			return void response(false, 403, "Forbidden");
		}

		if (this.settings.listenerForbiddenIPs.indexOf(address) !== -1) {
			this.logger.inform(`listenerForbiddenIPs contains ${address}, dropping connection`);

			return void response(false, 403, "Forbidden");
		}

		if (this.settings.listenerMaxConnectionsPerIP > 0) {
			const count = this.connectionsByIP[address];

			if (count && count >= this.settings.listenerMaxConnectionsPerIP) {
				this.logger.inform(`listenerMaxConnectionsPerIP reached for '${address}', dropping its new connections`);

				return void response(false, 403, "Forbidden");
			}
		}

		this.logger.debug(`IP '${address}' Client Verification Passed`);
		response(true);
	}
	onOpen() {
		this.logger.inform(`listener open at ${this.settings.listeningPort}`);
	}
	/**
	 * @param {Router} router
	 */
	addRouter(router) {
		this.routers.push(router);
	}
	/**
	 * @param {Router} router
	 */
	removeRouter(router) {
		this.routers.splice(this.routers.indexOf(router), 1);
	}
	/**
	 * @param {WebSocket} webSocket
	 */
	onConnection(webSocket, req) {
		const newConnection = new Connection(this, webSocket, req);
		this.logger.onAccess(`CONNECTION FROM ${newConnection.remoteAddress}`);
		this.connectionsByIP[newConnection.remoteAddress] = this.connectionsByIP[newConnection.remoteAddress] + 1 || 1;
		this.connections.push(newConnection);

		if (this.settings.listenerUseReCaptcha) {
			const url_parts = url.parse(req.url, true);
			const query = url_parts.query;
			const secret_key = 'INSERT RECAPTCHA SECRET KEY HERE';
			const verify_url = 'https://www.google.com/recaptcha/api/siteverify?secret=' + secret_key + '&response=' + query.token;

			request(verify_url, { json: true }, (error, response, body) => {
				if (!error && response.statusCode === 200) {
					if (body.success === false) {
						this.logger.inform(`IP '${newConnection.remoteAddress}' Token '${query.token}' Error '${body['error-codes'].join(',')}' failed recaptcha`);
						newConnection.closeSocket(1003, "Remote address is forbidden");
					} else {
						newConnection.verifyScore = body.score
					}
				} else {
					this.logger.inform(`IP '${newConnection.remoteAddress}' Token '${query.token}' Error '${error}' failed recaptcha`);
					newConnection.closeSocket(1003, "Remote address is forbidden");
				}
			});
		}
	}

	/**
	 * @param {Connection} connection
	 * @param {number} code
	 * @param {string} reason
	 */
	onDisconnection(connection, code, reason) {
		this.logger.onAccess(`DISCONNECTION FROM ${connection.remoteAddress} (${code} '${reason}')`);

		if (--this.connectionsByIP[connection.remoteAddress] <= 0)
			delete this.connectionsByIP[connection.remoteAddress];

		this.globalChat.remove(connection);
		this.connections.splice(this.connections.indexOf(connection), 1);
	}
	update() {
		let i, l;

		for (i = 0, l = this.routers.length; i < l; i++) {
			const router = this.routers[i];

			if (!router.shouldClose) continue;

			router.close(); i--; l--;
		}

		for (i = 0; i < l; i++) this.routers[i].update();

		for (i = 0, l = this.connections.length; i < l; i++) {
			const connection = this.connections[i];

			if (this.settings.listenerForbiddenIPs.indexOf(connection.remoteAddress) !== -1)
				connection.closeSocket(1003, "Remote address is forbidden");
			else if (Date.now() - connection.lastActivityTime >= this.settings.listenerMaxClientDormancy)
				connection.closeSocket(1003, "Maximum dormancy time exceeded");
		}
	}
}

module.exports = Listener;

const Router = require("./Router");
const ServerHandle = require("../ServerHandle");