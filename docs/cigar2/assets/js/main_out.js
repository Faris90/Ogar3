(function() {
    'use strict';

    if (typeof WebSocket === 'undefined' || typeof DataView === 'undefined' ||
        typeof ArrayBuffer === 'undefined' || typeof Uint8Array === 'undefined') {
        alert('Your browser does not support required features, please update your browser or get a new one.');
        window.stop();
    }

    function byId(id) {
        return document.getElementById(id);
    }
    /*
    function byClass(clss, parent) {
        return (parent || document).getElementsByClassName(clss);
    }
    */

    class Sound {
        constructor(src, volume, maximum) {
            this.src = src;
            this.volume = typeof volume === 'number' ? volume : 0.5;
            this.maximum = typeof maximum === 'number' ? maximum : Infinity;
            this.elms = [];
        }
        play(vol) {
            if (typeof vol === 'number') this.volume = vol;
            const toPlay = this.elms.find((elm) => elm.paused) ?? this.add();
            toPlay.volume = this.volume;
            toPlay.play();
        }
        add() {
            if (this.elms.length >= this.maximum) return this.elms[0];
            const elm = new Audio(this.src);
            this.elms.push(elm);
            return elm;
        }
    }

    const LOAD_START = Date.now();

    Array.prototype.remove = function (a) {
        const i = this.indexOf(a);
        return i !== -1 && this.splice(i, 1);
    }

    Element.prototype.hide = function () {
        this.style.display = 'none';
        if (this.style.opacity === 1) this.style.opacity = 0;
    }

    Element.prototype.show = function (seconds) {
        this.style.display = '';
        if (!seconds) return;
        this.style.transition = `opacity ${seconds}s ease 0s`;
        this.style.opacity = 1;
    }

    class Color {
        static fromHex(color) {
            let hex = color;
            if (color.startsWith('#')) hex = color.slice(1);
            if (hex.length === 3) hex = hex.split('').map((c) => c + c).join('');
            if (hex.length !== 6) throw new Error(`Invalid color ${color}`);
            const v = parseInt(hex, 16);
            return new Color(v >>> 16 & 255, v >>> 8 & 255, v & 255, `#${hex}`);
        }
        constructor(r, g, b, hex) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.hexCache = hex;
        }
        clone() {
            return new Color(this.r, this.g, this.b);
        }
        toHex() {
            if (this.hexCache) return this.hexCache;
            return this.hexCache = `#${(1 << 24 | this.r << 16 | this.g << 8 | this.b).toString(16).slice(1)}`;
        }
        darken(grade = 1) {
            grade /= 10;
            this.r *= 1 - grade;
            this.g *= 1 - grade;
            this.b *= 1 - grade;
            return this;
        }
        darker(grade = 1) {
            return this.clone().darken(grade);
        }
    }

    function cleanupObject(object) {
        for (const i in object) delete object[i];
    }

    class Writer {
        constructor(littleEndian) {
            this.writer = true;
            this.tmpBuf = new DataView(new ArrayBuffer(8));
            this._e = littleEndian;
            this.reset();
            return this;
        }
        reset(littleEndian = this._e) {
            this._e = littleEndian;
            this._b = [];
            this._o = 0;
        }
        setUint8(a) {
            if (a >= 0 && a < 256) this._b.push(a);
            return this;
        }
        setInt8(a) {
            if (a >= -128 && a < 128) this._b.push(a);
            return this;
        }
        setUint16(a) {
            this.tmpBuf.setUint16(0, a, this._e);
            this._move(2);
            return this;
        }
        setInt16(a) {
            this.tmpBuf.setInt16(0, a, this._e);
            this._move(2);
            return this;
        }
        setUint32(a) {
            this.tmpBuf.setUint32(0, a, this._e);
            this._move(4);
            return this;
        }
        setInt32(a) {
            this.tmpBuf.setInt32(0, a, this._e);
            this._move(4);
            return this;
        }
        setFloat32(a) {
            this.tmpBuf.setFloat32(0, a, this._e);
            this._move(4);
            return this;
        }
        setFloat64(a) {
            this.tmpBuf.setFloat64(0, a, this._e);
            this._move(8);
            return this;
        }
        _move(b) {
            for (let i = 0; i < b; i++) this._b.push(this.tmpBuf.getUint8(i));
        }
        setStringUTF8(s) {
            const bytesStr = unescape(encodeURIComponent(s));
            for (let i = 0, l = bytesStr.length; i < l; i++) this._b.push(bytesStr.charCodeAt(i));
            this._b.push(0);
            return this;
        }
        build() {
            return new Uint8Array(this._b);
        }
    }

    class Reader {
        constructor(view, offset, littleEndian) {
            this.reader = true;
            this._e = littleEndian;
            if (view) this.repurpose(view, offset);
        }
        repurpose(view, offset) {
            this.view = view;
            this._o = offset || 0;
        }
        getUint8() {
            return this.view.getUint8(this._o++, this._e);
        }
        getInt8() {
            return this.view.getInt8(this._o++, this._e);
        }
        getUint16() {
            return this.view.getUint16((this._o += 2) - 2, this._e);
        }
        getInt16() {
            return this.view.getInt16((this._o += 2) - 2, this._e);
        }
        getUint32() {
            return this.view.getUint32((this._o += 4) - 4, this._e);
        }
        getInt32() {
            return this.view.getInt32((this._o += 4) - 4, this._e);
        }
        getFloat32() {
            return this.view.getFloat32((this._o += 4) - 4, this._e);
        }
        getFloat64() {
            return this.view.getFloat64((this._o += 8) - 8, this._e);
        }
        getStringUTF8() {
            let s = '', b;
            while ((b = this.view.getUint8(this._o++)) !== 0) s += String.fromCharCode(b);
            return decodeURIComponent(escape(s));
        }
    }

    class Logger {
        static get verbosity() {
            return 2;
        }
        static error() {
            if (Logger.verbosity > 0) console.error.apply(null, arguments);
        }
        static warn() {
            if (Logger.verbosity > 1) console.warn.apply(null, arguments);
        }
        static info() {
            if (Logger.verbosity > 2) console.info.apply(null, arguments);
        }
        static debug() {
            if (Logger.verbosity > 3) console.debug.apply(null, arguments);
        }
    }

    const WEBSOCKET_URL = null;
    const SKIN_URL = './skins/';
    const USE_HTTPS = 'https:' === window.location.protocol || window.location.hostname === 'localhost';
    const EMPTY_NAME = 'An unnamed cell';
    const QUADTREE_MAX_POINTS = 32;
    const CELL_POINTS_MIN = 5;
    const CELL_POINTS_MAX = 120;
    const VIRUS_POINTS = 100;
    const PI_2 = Math.PI * 2;
    const SEND_254 = new Uint8Array([254, 6, 0, 0, 0]);
    const SEND_255 = new Uint8Array([255, 1, 0, 0, 0]);
    const UINT8_CACHE = {
        1: new Uint8Array([1]),
        17: new Uint8Array([17]),
        21: new Uint8Array([21]),
        18: new Uint8Array([18]),
        19: new Uint8Array([19]),
        22: new Uint8Array([22]),
        23: new Uint8Array([23]),
        24: new Uint8Array([24]),
        25: new Uint8Array([25]),
        254: new Uint8Array([254])
    };
    const KEY_TO_OPCODE = {
        e: UINT8_CACHE[22],
        r: UINT8_CACHE[23],
        t: UINT8_CACHE[24],
        p: UINT8_CACHE[25]
    };
    const IE_KEYS = {
        spacebar: ' ',
        esc: 'escape'
    };
    const CODE_TO_KEY = {
        Space: ' ',
        KeyW: 'w',
        KeyQ: 'q',
        KeyE: 'e',
        KeyR: 'r',
        KeyT: 't',
        KeyP: 'p'
    };

    function wsCleanup() {
        if (!ws) return;
        Logger.debug('WebSocket cleanup');
        ws.onopen = null;
        ws.onmessage = null;
        ws.close();
        ws = null;
    }

    function wsInit(url) {
        if (ws) {
            Logger.debug('WebSocket init on existing connection');
            wsCleanup();
        }
        byId('connecting').show(0.5);
        wsUrl = url;
        ws = new WebSocket(`ws${USE_HTTPS ? 's' : ''}://${url}`);
        ws.binaryType = 'arraybuffer';
        ws.onopen = wsOpen;
        ws.onmessage = wsMessage;
        ws.onerror = wsError;
        ws.onclose = wsClose;
    }

    function wsOpen() {
        reconnectDelay = 1000;
        byId('connecting').hide();
        wsSend(SEND_254);
        wsSend(SEND_255);
    }

    function wsError(error) {
        Logger.warn(error);
    }

    function wsClose(e) {
        if (e.currentTarget !== ws) return;
        Logger.debug(`WebSocket disconnected ${e.code} (${e.reason})`);
        wsCleanup();
        gameReset();
        setTimeout(() => window.setserver(wsUrl), reconnectDelay *= 1.5);
    }

    function wsSend(data) {
        if (!ws) return;
        if (ws.readyState !== 1) return;
        if (data.build) ws.send(data.build());
        else ws.send(data);
    }

    function wsMessage(data) {
        syncUpdStamp = Date.now();
        const reader = new Reader(new DataView(data.data), 0, true);
        const packetId = reader.getUint8();
        switch (packetId) {
            case 0x10: {// update nodes
                // consume records
                const addedCount = reader.getUint16();
                for (let i = 0; i < addedCount; i++) {
                    const killer = reader.getUint32();
                    const killed = reader.getUint32();
                    if (!cells.byId.has(killer) || !cells.byId.has(killed))
                        continue;
                    if (settings.playSounds && cells.mine.includes(killer)) {
                        (cells.byId.get(killed).s < 20 ? pelletSound : eatSound).play(parseFloat(soundsVolume.value));
                    }
                    cells.byId.get(killed).destroy(killer);
                }

                // update records
                // eslint-disable-next-line no-constant-condition
                while (true) {
                    const id = reader.getUint32();
                    if (id === 0) break;

                    const x = reader.getInt32();
                    const y = reader.getInt32();
                    const s = reader.getUint16();

                    const flagMask = reader.getUint8();
                    const flags = {
                        updColor: !!(flagMask & 0x02),
                        updSkin: !!(flagMask & 0x04),
                        updName: !!(flagMask & 0x08),
                        jagged: !!(flagMask & 0x01) || !!(flagMask & 0x10),
                        ejected: !!(flagMask & 0x20),
                    };

                    const color = flags.updColor ? new Color(reader.getUint8(), reader.getUint8(), reader.getUint8()) : null;
                    const skin = flags.updSkin ? reader.getStringUTF8() : null;
                    const name = flags.updName ? reader.getStringUTF8() : null;

                    if (cells.byId.has(id)) {
                        const cell = cells.byId.get(id);
                        cell.update(syncUpdStamp);
                        cell.updated = syncUpdStamp;
                        cell.ox = cell.x;
                        cell.oy = cell.y;
                        cell.os = cell.s;
                        cell.nx = x;
                        cell.ny = y;
                        cell.ns = s;
                        if (color) cell.setColor(color);
                        if (name) cell.setName(name);
                        if (skin) cell.setSkin(skin);
                    } else {
                        const cell = new Cell(id, x, y, s, name, color, skin, flags);
                        cells.byId.set(id, cell);
                        cells.list.push(cell);
                    }
                }
                // dissapear records
                const removedCount = reader.getUint16();
                for (let i = 0; i < removedCount; i++) {
                    const killed = reader.getUint32();
                    if (cells.byId.has(killed) && !cells.byId.get(killed).destroyed) {
                        cells.byId.get(killed).destroy(null);
                    }
                }
                break;
            }
            case 0x11: { // update pos
                camera.target.x = reader.getFloat32();
                camera.target.y = reader.getFloat32();
                camera.target.scale = reader.getFloat32();
                camera.target.scale *= camera.viewportScale;
                camera.target.scale *= camera.userZoom;
                break;
            }
            case 0x12: { // clear all
                for (const cell of cells.byId.values()) {
                    cell.destroy(null);
                }
                cells.mine = [];
                break;
            }
            case 0x14: { // clear my cells
                cells.mine = [];
                break;
            }
            case 0x15: { // draw line
                Logger.warn('got packet 0x15 (draw line) which is unsupported');
                break;
            }
            case 0x20: { // new cell
                cells.mine.push(reader.getUint32());
                break;
            }
            case 0x30: { // text list
                leaderboard.items = [];
                leaderboard.type = 'text';

                const lbCount = reader.getUint32();
                for (let i = 0; i < lbCount; ++i) {
                    leaderboard.items.push(reader.getStringUTF8());
                }
                drawLeaderboard();
                break;
            }
            case 0x31: { // ffa list
                leaderboard.items = [];
                leaderboard.type = 'ffa';

                const count = reader.getUint32();
                for (let i = 0; i < count; ++i) {
                    const isMe = !!reader.getUint32();
                    const lbName = reader.getStringUTF8();
                    leaderboard.items.push({
                        me: isMe,
                        name: Cell.parseName(lbName).name || EMPTY_NAME
                    });
                }
                drawLeaderboard();
                break;
            }
            case 0x32: { // pie chart
                leaderboard.items = [];
                leaderboard.type = 'pie';

                const teamsCount = reader.getUint32();
                for (let i = 0; i < teamsCount; ++i) {
                    leaderboard.items.push(reader.getFloat32());
                }
                drawLeaderboard();
                break;
            }
            case 0x40: { // set border
                border.left = reader.getFloat64();
                border.top = reader.getFloat64();
                border.right = reader.getFloat64();
                border.bottom = reader.getFloat64();
                border.width = border.right - border.left;
                border.height = border.bottom - border.top;
                border.centerX = (border.left + border.right) / 2;
                border.centerY = (border.top + border.bottom) / 2;
                if (data.data.byteLength === 33) break;
                if (!mapCenterSet) {
                    mapCenterSet = true;
                    camera.x = camera.target.x = border.centerX;
                    camera.y = camera.target.y = border.centerY;
                    camera.scale = camera.target.scale = 1;
                }
                reader.getUint32(); // game type
                if (!/MultiOgar|OgarII/.test(reader.getStringUTF8()) || stats.pingLoopId) break;
                stats.pingLoopId = setInterval(() => {
                    wsSend(UINT8_CACHE[254]);
                    stats.pingLoopStamp = Date.now();
                }, 2000);
                break;
            }
            case 0x63: { // chat message
                const flagMask = reader.getUint8();
                const flags = {
                    server: !!(flagMask & 0x80),
                    admin: !!(flagMask & 0x40),
                    mod: !!(flagMask & 0x20),
                };
                const color = new Color(reader.getUint8(), reader.getUint8(), reader.getUint8());
                const rawName = reader.getStringUTF8();
                const message = reader.getStringUTF8();

                let name = Cell.parseName(rawName).name || EMPTY_NAME;

                if (flags.server && name !== 'SERVER') name = `[SERVER] ${name}`;
                if (flags.admin) name = `[ADMIN] ${name}`;
                if (flags.mod) name = `[MOD] ${name}`;

                const wait = Math.max(3000, 1000 + message.length * 150);
                chat.waitUntil = syncUpdStamp - chat.waitUntil > 1000 ? syncUpdStamp + wait : chat.waitUntil + wait;
                chat.messages.push({
                    color,
                    name,
                    message,
                    time: syncUpdStamp,
                    server: flags.server,
                    admin: flags.admin,
                    mod: flags.mod,
                });
                if (settings.showChat) drawChat();
                break;
            }
            case 0xFE: { // server stat
                stats.info = JSON.parse(reader.getStringUTF8());
                stats.latency = syncUpdStamp - stats.pingLoopStamp;
                drawStats();
                break;
            }
            default: { // invalid packet
                wsCleanup();
                break;
            }
        }
    }
    function sendMouseMove(x, y) {
        const writer = new Writer(true);
        writer.setUint8(0x10);
        writer.setUint32(x);
        writer.setUint32(y);
        writer._b.push(0, 0, 0, 0);
        wsSend(writer);
    }
    function sendPlay(name) {
        const writer = new Writer(true);
        writer.setUint8(0x00);
        writer.setStringUTF8(name);
        wsSend(writer);
    }
    function sendChat(text) {
        const writer = new Writer();
        writer.setUint8(0x63);
        writer.setUint8(0);
        writer.setStringUTF8(text);
        wsSend(writer);
    }

    function gameReset() {
        cleanupObject(cells);
        cleanupObject(border);
        cleanupObject(leaderboard);
        cleanupObject(chat);
        cleanupObject(stats);
        chat.messages = [];
        leaderboard.items = [];
        cells.mine = [];
        cells.byId = new Map();
        cells.list = [];
        camera.x = camera.y = camera.target.x = camera.target.y = 0;
        camera.scale = camera.target.scale = 1;
        mapCenterSet = false;
    }

    const cells = {
        mine: [],
        byId: new Map(),
        list: [],
    };
    const border = {
        left: -2000,
        right: 2000,
        top: -2000,
        bottom: 2000,
        width: 4000,
        height: 4000,
        centerX: -1,
        centerY: -1
    };
    const leaderboard = Object.create({
        type: null,
        items: null,
        canvas: document.createElement('canvas'),
        teams: ['#F33', '#3F3', '#33F']
    });
    const chat = Object.create({
        messages: [],
        waitUntil: 0,
        canvas: document.createElement('canvas'),
        visible: false,
    });
    const stats = Object.create({
        fps: 0,
        latency: NaN,
        supports: null,
        info: null,
        pingLoopId: NaN,
        pingLoopStamp: null,
        canvas: document.createElement('canvas'),
        visible: false,
        score: NaN,
        maxScore: 0
    });

    const knownSkins = new Map();
    const loadedSkins = new Map();
    const macroCooldown = 1000 / 7;
    const camera = {
        x: 0,
        y: 0,
        target: {
            x: 0,
            y: 0,
            scale: 1
        },
        viewportScale: 1,
        userZoom: 1,
        sizeScale: 1,
        scale: 1
    };

    let wsUrl = WEBSOCKET_URL;
    let ws = null;
    let reconnectDelay = 1000;

    let syncUpdStamp = Date.now();
    let syncAppStamp = Date.now();

    let mainCanvas = null;
    let mainCtx = null;
    let soundsVolume;
    let escOverlayShown = false;
    let isTyping = false;
    let chatBox = null;
    let mapCenterSet = false;
    let minionControlled = false;
    let mouseX = NaN;
    let mouseY = NaN;
    let macroIntervalID;
    let quadtree;

    const settings = {
        nick: '',
        skin: '',
        gamemode: '',
        showSkins: true,
        showNames: true,
        darkTheme: false,
        showColor: true,
        showMass: false,
        _showChat: true,
        get showChat() {
            return this._showChat;
        },
        set showChat(a) {
            this._showChat = a;
            if (!chatBox) return;
            a ? chatBox.show() : chatBox.hide();
        },
        showMinimap: true,
        showPosition: false,
        showBorder: false,
        showGrid: true,
        playSounds: false,
        soundsVolume: 0.5,
        moreZoom: false,
        fillSkin: true,
        backgroundSectors: false,
        jellyPhysics: true,
    };
    const pressed = {
        ' ': false,
        w: false,
        e: false,
        r: false,
        t: false,
        p: false,
        q: false,
        enter: false,
        escape: false,
    };

    const eatSound = new Sound('./assets/sound/eat.mp3', 0.5, 10);
    const pelletSound = new Sound('./assets/sound/pellet.mp3', 0.5, 10);

    fetch('skinList.txt').then(resp => resp.text()).then(data => {
        const skins = data.split(',').filter(name => name.length > 0);
        if (skins.length === 0) return;
        byId('gallery-btn').style.display = 'inline-block';
        const stamp = Date.now();
        for (const skin of skins) knownSkins.set(skin, stamp);
        for (const i of knownSkins.keys()) {
            if (knownSkins.get(i) !== stamp) knownSkins.delete(i);
        }
    });

    function hideESCOverlay() {
        escOverlayShown = false;
        byId('overlays').hide();
    }
    function showESCOverlay() {
        escOverlayShown = true;
        byId('overlays').show(0.5);
    }

    function toCamera(ctx) {
        ctx.translate(mainCanvas.width / 2, mainCanvas.height / 2);
        scaleForth(ctx);
        ctx.translate(-camera.x, -camera.y);
    }
    function scaleForth(ctx) {
        ctx.scale(camera.scale, camera.scale);
    }
    function scaleBack(ctx) {
        ctx.scale(1 / camera.scale, 1 / camera.scale);
    }
    function fromCamera(ctx) {
        ctx.translate(camera.x, camera.y);
        scaleBack(ctx);
        ctx.translate(-mainCanvas.width / 2, -mainCanvas.height / 2);
    }

    function initSetting(id, elm) {
        function simpleAssignListen(id, elm, prop) {
            if (settings[id] !== '') elm[prop] = settings[id];
            elm.addEventListener('change', () => {
                settings[id] = elm[prop];
            });
        }
        switch (elm.tagName.toLowerCase()) {
            case 'input':
                switch (elm.type.toLowerCase()) {
                    case 'range':
                    case 'text':
                        simpleAssignListen(id, elm, 'value');
                        break;
                    case 'checkbox':
                        simpleAssignListen(id, elm, 'checked');
                        break;
                }
                break;
            case 'select':
                simpleAssignListen(id, elm, 'value');
                break;
        }
    }
    function loadSettings() {
        const text = localStorage.getItem('settings');
        const obj = text ? JSON.parse(text) : settings;
        for (const prop in settings) {
            const elm = byId(prop.charAt(0) === '_' ? prop.slice(1) : prop);
            if (elm) {
                if (Object.hasOwnProperty.call(obj, prop)) settings[prop] = obj[prop];
                initSetting(prop, elm);
            } else Logger.info(`setting ${prop} not loaded because there is no element for it.`);
        }
    }
    function storeSettings() {
        localStorage.setItem('settings', JSON.stringify(settings));
    }

    function buildGallery() {
        const sortedSkins = Array.from(knownSkins.keys()).sort();
        let c = '';
        for (const skin of sortedSkins) {
            c += `<li class="skin" onclick="changeSkin('${skin}')">`;
            c += `<img class="circular" src="./skins/${skin}.png">`;
            c += `<h4 class="skinName">${skin}</h4>`;
            c += '</li>';
        }
        byId('gallery-body').innerHTML = `<ul id="skinsUL">${c}</ul>`;
    }

    function drawChat() {
        if (chat.messages.length === 0 && settings.showChat)
            return chat.visible = false;
        chat.visible = true;
        const canvas = chat.canvas;
        const ctx = canvas.getContext('2d');
        const latestMessages = chat.messages.slice(-15);
        const lines = [];
        for (let i = 0; i < latestMessages.length; i++) {
            lines.push([
                {
                    text: latestMessages[i].name,
                    color: latestMessages[i].color
                }, {
                    text: ` ${latestMessages[i].message}`,
                    color: Color.fromHex(settings.darkTheme ? '#FFF' : '#000')
                }
            ]);
        }
        window.lines = lines;
        let width = 0;
        let height = 20 * lines.length + 2;
        for (let i = 0; i < lines.length; i++) {
            let thisLineWidth = 10;
            let complexes = lines[i];
            for (let j = 0; j < complexes.length; j++) {
                ctx.font = '18px Ubuntu';
                complexes[j].width = ctx.measureText(complexes[j].text).width;
                thisLineWidth += complexes[j].width;
            }
            width = Math.max(thisLineWidth, width);
        }
        canvas.width = width;
        canvas.height = height;
        for (let i = 0; i < lines.length; i++) {
            let width = 0;
            let complexes = lines[i];
            for (let j = 0; j < complexes.length; j++) {
                ctx.font = '18px Ubuntu';
                ctx.fillStyle = complexes[j].color.toHex();
                ctx.fillText(complexes[j].text, width, 20 * (1 + i));
                width += complexes[j].width;
            }
        }
    }

    function drawStats() {
        if (!stats.info) return stats.visible = false;
        stats.visible = true;

        const canvas = stats.canvas;
        const ctx = canvas.getContext('2d');
        ctx.font = '14px Ubuntu';
        const uptime = prettyPrintTime(stats.info.uptime);
        const rows = [
            `${stats.info.name} (${stats.info.mode})`,
            `${stats.info.playersTotal} / ${stats.info.playersLimit} players`,
            `${stats.info.playersAlive} playing`,
            `${stats.info.playersSpect} spectating`,
            `${(stats.info.update * 2.5).toFixed(1)}% load @ ${uptime}`,
        ];
        let width = 0;
        for (const row of rows) {
            width = Math.max(width, 2 + ctx.measureText(row).width + 2);
        }
        canvas.width = width;
        canvas.height = rows.length * (14 + 2);
        ctx.font = '14px Ubuntu';
        ctx.fillStyle = settings.darkTheme ? '#AAA' : '#555';
        ctx.textBaseline = 'top';
        for (let i = 0; i < rows.length; i++) {
            ctx.fillText(rows[i], 2, -1 + i * (14 + 2));
        }
    }

    function drawPosition() {
        if(border.centerX !== 0 || border.centerY !== 0 || !settings.showPosition) return;
        const width = 200 * (border.width / border.height);
        const height = 40 * (border.height / border.width);

        let beginX = mainCanvas.width / camera.viewportScale - width;
        let beginY = mainCanvas.height / camera.viewportScale - height;

        if (settings.showMinimap) {
            mainCtx.font = '15px Ubuntu';
            beginX += width / 2 - 1;
            beginY = beginY - 194 * border.height / border.width;
            mainCtx.textAlign = 'right';
            mainCtx.fillStyle = settings.darkTheme ? '#AAA' : '#555';
            mainCtx.fillText(`X: ${~~camera.x}, Y: ${~~camera.y}`, beginX + width / 2, beginY + height / 2);
        } else {
            mainCtx.fillStyle = '#000';
            mainCtx.globalAlpha = 0.4;
            mainCtx.fillRect(beginX, beginY, width, height);
            mainCtx.globalAlpha = 1;
            drawRaw(mainCtx, beginX + width / 2, beginY + height / 2, `X: ${~~camera.x}, Y: ${~~camera.y}`);
        }
    }

    function prettyPrintTime(seconds) {
        const minutes = ~~(seconds / 60);
        if (minutes < 1) return '<1 min';
        const hours = ~~(minutes / 60);
        if (hours < 1) return `${minutes}min`;
        const days = ~~(hours / 24);
        if (days < 1) return `${hours}h`;
        return `${days}d`;
    }

    function drawLeaderboard() {
        if (leaderboard.type === null) return leaderboard.visible = false;
        if (!settings.showNames || leaderboard.items.length === 0) {
            return leaderboard.visible = false;
        }
        leaderboard.visible = true;
        const canvas = leaderboard.canvas;
        const ctx = canvas.getContext('2d');

        canvas.width = 200;
        canvas.height = leaderboard.type !== 'pie' ? 60 + 24 * leaderboard.items.length : 240;

        ctx.globalAlpha = .4;
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 200, canvas.height);

        ctx.globalAlpha = 1;
        ctx.fillStyle = '#FFF';
        ctx.font = '30px Ubuntu';
        ctx.fillText('Leaderboard', 100 - ctx.measureText('Leaderboard').width / 2, 40);

        if (leaderboard.type === 'pie') {
            let last = 0;
            for (let i = 0; i < leaderboard.items.length; i++) {
                ctx.fillStyle = leaderboard.teams[i];
                ctx.beginPath();
                ctx.moveTo(100, 140);
                ctx.arc(100, 140, 80, last, (last += leaderboard.items[i] * PI_2), false);
                ctx.closePath();
                ctx.fill();
            }
        } else {
            ctx.font = '20px Ubuntu';
            for (let i = 0; i < leaderboard.items.length; i++) {
                let isMe = false;
                let text;
                if (leaderboard.type === "text") {
                    text = leaderboard.items[i];
                } else {
                    text = leaderboard.items[i].name,
                    isMe = leaderboard.items[i].me;
                }
                if (leaderboard.type === 'ffa') text = `${i + 1}. ${text}`;
                ctx.fillStyle = isMe ? '#FAA' : '#FFF';
                const width = ctx.measureText(text).width;
                const start = width > 200 ? 2 : 100 - width * 0.5;
                ctx.fillText(text, start, 70 + 24 * i);
            }
        }
    }
    function drawGrid() {
        mainCtx.save();
        mainCtx.lineWidth = 1;
        mainCtx.strokeStyle = settings.darkTheme ? '#AAA' : '#000';
        mainCtx.globalAlpha = 0.2;
        const step = 50;
        const cW = mainCanvas.width / camera.scale;
        const cH = mainCanvas.height / camera.scale;
        const startLeft = (-camera.x + cW / 2) % step;
        const startTop = (-camera.y + cH / 2) % step;

        scaleForth(mainCtx);
        mainCtx.beginPath();
        for (let i = startLeft; i < cW; i += step) {
            mainCtx.moveTo(i, 0);
            mainCtx.lineTo(i, cH);
        }
        for (let i = startTop; i < cH; i += step) {
            mainCtx.moveTo(0, i);
            mainCtx.lineTo(cW, i);
        }
        mainCtx.stroke();
        mainCtx.restore();
    }
    function drawBackgroundSectors() {
        if (border === undefined || border.width === undefined) return;
        mainCtx.save();

        const sectorCount = 5;
        const sectorNames = ['ABCDE', '12345'];
        const w = border.width / sectorCount;
        const h = border.height / sectorCount;

        toCamera(mainCtx);
        mainCtx.fillStyle = settings.darkTheme ? '#666' : '#DDD';
        mainCtx.textBaseline = 'middle';
        mainCtx.textAlign = 'center';
        mainCtx.font = `${w / 3 | 0}px Ubuntu`;

        for (let y = 0; y < sectorCount; ++y) {
            for (let x = 0; x < sectorCount; ++x) {
                const str = sectorNames[0][x] + sectorNames[1][y];
                const dx = (x + 0.5) * w + border.left;
                const dy = (y + 0.5) * h + border.top;
                mainCtx.fillText(str, dx, dy);
            }
        }
        mainCtx.restore();
    }
    function drawMinimap() {
        if (border.centerX !== 0 || border.centerY !== 0 || !settings.showMinimap) return;
        mainCtx.save();
        mainCtx.resetTransform();
        const targetSize = 200;
        const borderAR = border.width / border.height; // aspect ratio
        const width = targetSize * borderAR * camera.viewportScale;
        const height = targetSize / borderAR * camera.viewportScale;
        const beginX = mainCanvas.width - width;
        const beginY = mainCanvas.height - height;

        mainCtx.fillStyle = '#000';
        mainCtx.globalAlpha = 0.4;
        mainCtx.fillRect(beginX, beginY, width, height);
        mainCtx.globalAlpha = 1;

        const sectorCount = 5;
        const sectorNames = ['ABCDE', '12345'];
        const sectorWidth = width / sectorCount;
        const sectorHeight = height / sectorCount;
        const sectorNameSize = Math.min(sectorWidth, sectorHeight) / 3;

        mainCtx.fillStyle = settings.darkTheme ? '#666' : '#DDD';
        mainCtx.textBaseline = 'middle';
        mainCtx.textAlign = 'center';
        mainCtx.font = `${sectorNameSize}px Ubuntu`;

        for (let i = 0; i < sectorCount; i++) {
            const x = (i + 0.5) * sectorWidth;
            for (let j = 0; j < sectorCount; j++) {
                const y = (j + 0.5) * sectorHeight;
                mainCtx.fillText(sectorNames[0][i] + sectorNames[1][j], beginX + x, beginY + y);
            }
        }

        const xScale = width / border.width;
        const yScale = height / border.height;
        const halfWidth = border.width / 2;
        const halfHeight = border.height / 2;
        const myPosX = beginX + (camera.x + halfWidth) * xScale;
        const myPosY = beginY + (camera.y + halfHeight) * yScale;

        const xIndex = (myPosX - beginX) / sectorWidth | 0;
        const yIndex = (myPosY - beginY) / sectorHeight | 0;
        const lightX = beginX + xIndex * sectorWidth;
        const lightY = beginY + yIndex * sectorHeight;
        mainCtx.fillStyle = 'yellow';
        mainCtx.globalAlpha = 0.3;
        mainCtx.fillRect(lightX, lightY, sectorWidth, sectorHeight);
        mainCtx.globalAlpha = 1;

        mainCtx.beginPath();
        if (cells.mine.length) {
            for (const id of cells.mine) {
                const cell = cells.byId.get(id);
                if (!cell) continue;
                mainCtx.fillStyle = cell.color.toHex(); // repeat assignment of same color is OK
                const x = beginX + (cell.x + halfWidth) * xScale;
                const y = beginY + (cell.y + halfHeight) * yScale;
                const r = Math.max(cell.s, 200) * (xScale + yScale) / 2;
                mainCtx.moveTo(x + r, y);
                mainCtx.arc(x, y, r, 0, PI_2);
            }
        } else {
            mainCtx.fillStyle = '#FAA';
            mainCtx.arc(myPosX, myPosY, 5, 0, PI_2);
        }
        mainCtx.fill();

        // draw name above user's pos if they have a cell on the screen
        const cell = cells.byId.get(cells.mine.find(id => cells.byId.has(id)));
        if (cell) {
            mainCtx.fillStyle = settings.darkTheme ? '#DDD' : '#222';
            mainCtx.font = `${sectorNameSize}px Ubuntu`;
            mainCtx.fillText(cell.name || EMPTY_NAME, myPosX, myPosY - 7 - sectorNameSize / 2);
        }

        mainCtx.restore();
    }

    function drawBorders() {
        if (!settings.showBorder) return;
        mainCtx.strokeStyle = '#0000ff';
        mainCtx.lineWidth = 20;
        mainCtx.lineCap = 'round';
        mainCtx.lineJoin = 'round';
        mainCtx.beginPath();
        mainCtx.moveTo(border.left, border.top);
        mainCtx.lineTo(border.right, border.top);
        mainCtx.lineTo(border.right, border.bottom);
        mainCtx.lineTo(border.left, border.bottom);
        mainCtx.closePath();
        mainCtx.stroke();
    }

    function drawGame() {
        stats.fps += (1000 / Math.max(Date.now() - syncAppStamp, 1) - stats.fps) / 10;
        syncAppStamp = Date.now();

        const drawList = cells.list.slice(0).sort(cellSort);
        for (const cell of drawList) cell.update(syncAppStamp);
        cameraUpdate();
        if (settings.jellyPhysics) {
            updateQuadtree();
            for (const cell of drawList) {
                cell.updateNumPoints();
                cell.movePoints();
            }
        }

        mainCtx.save();
        mainCtx.resetTransform();

        mainCtx.fillStyle = settings.darkTheme ? '#111' : '#F2FBFF';
        mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
        if (settings.showGrid) drawGrid();
        if (settings.backgroundSectors) drawBackgroundSectors();

        toCamera(mainCtx);
        drawBorders();

        for (const cell of drawList) cell.draw(mainCtx);

        fromCamera(mainCtx);
        quadtree = null;
        mainCtx.scale(camera.viewportScale, camera.viewportScale);

        let height = 2;
        mainCtx.fillStyle = settings.darkTheme ? '#FFF' : '#000';
        mainCtx.textBaseline = 'top';
        if (!isNaN(stats.score)) {
            mainCtx.font = '30px Ubuntu';
            mainCtx.fillText(`Score: ${stats.score}`, 2, height);
            height += 30;
        }
        mainCtx.font = '20px Ubuntu';
        const gameStatsText = `${~~stats.fps} FPS` + (isNaN(stats.latency) ? '' : ` ${stats.latency}ms ping`);
        mainCtx.fillText(gameStatsText, 2, height);
        height += 24;

        if (stats.visible) {
            mainCtx.drawImage(stats.canvas, 2, height);
        }
        if (leaderboard.visible) {
            mainCtx.drawImage(
                leaderboard.canvas,
                mainCanvas.width / camera.viewportScale - 10 - leaderboard.canvas.width,
                10);
        }
        if (settings.showChat && (chat.visible || isTyping)) {
            mainCtx.globalAlpha = isTyping ? 1 : Math.max(1000 - syncAppStamp + chat.waitUntil, 0) / 1000;
            mainCtx.drawImage(
                chat.canvas,
                10 / camera.viewportScale,
                (mainCanvas.height - 55) / camera.viewportScale - chat.canvas.height
            );
            mainCtx.globalAlpha = 1;
        }
        drawMinimap();
        drawPosition();

        mainCtx.restore();

        if (minionControlled) {
            mainCtx.save();
            mainCtx.font = '18px Ubuntu';
            mainCtx.textAlign = 'center';
            mainCtx.textBaseline = 'hanging';
            mainCtx.fillStyle = '#eea236';
            const text = 'You are controlling a minion, press Q to switch back.';
            mainCtx.fillText(text, mainCanvas.width / 2, 5);
            mainCtx.restore();
        }

        cacheCleanup();
        window.requestAnimationFrame(drawGame);
    }

    function cellSort(a, b) {
        return a.s === b.s ? a.id - b.id : a.s - b.s;
    }

    function cameraUpdate() {
        const myCells = [];
        for (const id of cells.mine) {
            const cell = cells.byId.get(id);
            if (cell) myCells.push(cell);
        }
        if (myCells.length > 0) {
            let x = 0;
            let y = 0;
            let s = 0;
            let score = 0;
            for (const cell of myCells) {
                score += ~~(cell.ns * cell.ns / 100);
                x += cell.x;
                y += cell.y;
                s += cell.s;
            }
            camera.target.x = x / myCells.length;
            camera.target.y = y / myCells.length;
            camera.sizeScale = Math.pow(Math.min(64 / s, 1), 0.4);
            camera.target.scale = camera.sizeScale;
            camera.target.scale *= camera.viewportScale * camera.userZoom;
            camera.x = (camera.target.x + camera.x) / 2;
            camera.y = (camera.target.y + camera.y) / 2;
            stats.score = score;
            stats.maxScore = Math.max(stats.maxScore, score);
        } else {
            stats.score = NaN;
            stats.maxScore = 0;
            camera.x += (camera.target.x - camera.x) / 20;
            camera.y += (camera.target.y - camera.y) / 20;
        }
        camera.scale += (camera.target.scale - camera.scale) / 9;
    }
    function sqDist(a, b) {
        return (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
    }
    function updateQuadtree() {
        const w = 1920 / camera.sizeScale;
        const h = 1080 / camera.sizeScale;
        const x = (camera.x - w / 2);
        const y = (camera.y - h / 2);
        quadtree = new window.PointQuadTree(x, y, w, h, QUADTREE_MAX_POINTS);
        for (const cell of cells.list) {
            for (const point of cell.points) quadtree.insert(point);
        }
    }

    class Cell {
        static parseName(value) { // static method
            let [, skin, name] = /^(?:<([^}]*)>)?([^]*)/.exec(value || '');
            name = name.trim();
            return {
                name: name,
                skin: (skin || '').trim() || name,
            };
        }
        constructor(id, x, y, s, name, color, skin, flags) {
            this.destroyed = false;
            this.diedBy = 0;
            this.nameSize = 0;
            this.drawNameSize = 0;
            this.updated = null;
            this.dead = null;
            this.id = id;
            this.ox = x;
            this.x = x;
            this.nx = x;
            this.oy = y;
            this.y = y;
            this.ny = y;
            this.os = s;
            this.s = s;
            this.ns = s;
            this.setColor(color);
            this.setName(name);
            this.setSkin(skin);
            this.jagged = flags.jagged;
            this.ejected = flags.ejected;
            this.born = syncUpdStamp;
            this.points = [];
            this.pointsVel = [];
        }
        destroy(killerId) {
            cells.byId.delete(this.id);
            if (cells.mine.remove(this.id) && cells.mine.length === 0) showESCOverlay();
            this.destroyed = true;
            this.dead = syncUpdStamp;
            if (killerId && !this.diedBy) {
                this.diedBy = killerId;
                this.updated = syncUpdStamp;
            }
        }
        update(relativeTime) {
            const prevFrameSize = this.s;
            const dt = Math.max(Math.min((relativeTime - this.updated) / 120, 1), 0);
            let diedBy;
            if (this.destroyed && Date.now() > this.dead + 200) {
                cells.list.remove(this);
            } else if (this.diedBy && (diedBy = cells.byId.get(this.diedBy))) {
                this.nx = diedBy.x;
                this.ny = diedBy.y;
            }
            this.x = this.ox + (this.nx - this.ox) * dt;
            this.y = this.oy + (this.ny - this.oy) * dt;
            this.s = this.os + (this.ns - this.os) * dt;
            this.nameSize = ~~(~~(Math.max(~~(0.3 * this.ns), 24)) / 3) * 3;
            this.drawNameSize = ~~(~~(Math.max(~~(0.3 * this.s), 24)) / 3) * 3;

            if (settings.jellyPhysics && this.points.length) {
                const ratio = this.s / prevFrameSize;
                if (this.ns != this.os && ratio != 1) {
                    for (const point of this.points) point.rl *= ratio;
                }
            }
        }
        updateNumPoints() {
            let numPoints = Math.min(Math.max(this.s * camera.scale | 0, CELL_POINTS_MIN), CELL_POINTS_MAX);
            if (this.jagged) numPoints = VIRUS_POINTS;
            while (this.points.length > numPoints) {
                const i = Math.random() * this.points.length | 0;
                this.points.splice(i, 1);
                this.pointsVel.splice(i, 1);
            }
            if (this.points.length === 0 && numPoints !== 0) {
                this.points.push({
                    x: this.x,
                    y: this.y,
                    rl: this.s,
                    parent: this,
                });
                this.pointsVel.push(Math.random() - 0.5);
            }
            while (this.points.length < numPoints) {
                const i = Math.random() * this.points.length | 0;
                const point = this.points[i];
                const vel = this.pointsVel[i];
                this.points.splice(i, 0, {
                    x: point.x,
                    y: point.y,
                    rl: point.rl,
                    parent: this
                });
                this.pointsVel.splice(i, 0, vel);
            }
        }
        movePoints() {
            const pointsVel = this.pointsVel.slice();
            for (let i = 0; i < this.points.length; ++i) {
                const prevVel = pointsVel[(i - 1 + this.points.length) % this.points.length];
                const nextVel = pointsVel[(i + 1) % this.points.length];
                const newVel = Math.max(Math.min((this.pointsVel[i] + Math.random() - 0.5) * 0.7, 10), -10);
                this.pointsVel[i] = (prevVel + nextVel + 8 * newVel) / 10;
            }
            for (let i = 0; i < this.points.length; ++i) {
                const curP = this.points[i];
                const prevRl = this.points[(i - 1 + this.points.length) % this.points.length].rl;
                const nextRl = this.points[(i + 1) % this.points.length].rl; // here
                let curRl = curP.rl;
                let affected = quadtree.some({
                    x: curP.x - 5,
                    y: curP.y - 5,
                    w: 10,
                    h: 10
                }, (item) => item.parent !== this && sqDist(item, curP) <= 25);
                if (!affected &&
                    (curP.x < border.left || curP.y < border.top ||
                    curP.x > border.right || curP.y > border.bottom))
                {
                    affected = true;
                }
                if (affected) {
                    this.pointsVel[i] = Math.min(this.pointsVel[i], 0) - 1;
                }
                curRl += this.pointsVel[i];
                curRl = Math.max(curRl, 0);
                curRl = (9 * curRl + this.s) / 10;
                curP.rl = (prevRl + nextRl + 8 * curRl) / 10;

                const angle = 2 * Math.PI * i / this.points.length;
                let rl = curP.rl;
                if (this.jagged && i % 2 === 0) {
                    rl += 5;
                }
                curP.x = this.x + Math.cos(angle) * rl;
                curP.y = this.y + Math.sin(angle) * rl;
            }
        }
        setName(rawName) {
            const {name, skin} = Cell.parseName(rawName);
            this.name = name;
            this.setSkin(skin);
        }
        setSkin(value) {
            this.skin = (value && value[0] === '%' ? value.slice(1) : value) || this.skin;
            if (this.skin === null /*|| !knownSkins.has(this.skin)*/ || loadedSkins.has(this.skin)) {
                return;
            }
            const skin = new Image();
            skin.src = `${SKIN_URL}${this.skin}.png`;
            loadedSkins.set(this.skin, skin);
        }
        setColor(value) {
            if (!value) {
                Logger.warn('Got no color');
                return;
            }
            this.color = value;
            this.sColor = value.darker();
        }
        draw(ctx) {
            ctx.save();
            this.drawShape(ctx);
            this.drawText(ctx);
            ctx.restore();
        }
        drawShape(ctx) {
            ctx.fillStyle = settings.showColor ? this.color.toHex() : '#FFFFFF';
            ctx.strokeStyle = settings.showColor ? this.sColor.toHex() : '#E5E5E5';
            ctx.lineWidth = Math.max(~~(this.s / 50), 10);
            if (this.s > 20) {
                this.s -= ctx.lineWidth / 2;
            }

            ctx.beginPath();
            if (this.jagged) ctx.lineJoin = 'miter';
            if (settings.jellyPhysics && this.points.length) {
                const point = this.points[0];
                ctx.moveTo(point.x, point.y);
                for (const point of this.points) ctx.lineTo(point.x, point.y);
            } else if (this.jagged) {
                const pointCount = 120;
                const incremental = PI_2 / pointCount;
                ctx.moveTo(this.x, this.y + this.s + 3);
                for (let i = 1; i < pointCount; i++) {
                    const angle = i * incremental;
                    const dist = this.s - 3 + (i % 2 === 0) * 6;
                    ctx.lineTo(
                        this.x + dist * Math.sin(angle),
                        this.y + dist * Math.cos(angle)
                    )
                }
                ctx.lineTo(this.x, this.y + this.s + 3);
            } else {
                ctx.arc(this.x, this.y, this.s, 0, PI_2, false);
            }
            ctx.closePath();

            if (this.destroyed) {
                ctx.globalAlpha = Math.max(120 - Date.now() + this.dead, 0) / 120;
            } else {
                ctx.globalAlpha = Math.min(Date.now() - this.born, 120) / 120;
            }

            const skinImage = loadedSkins.get(this.skin);
            if (settings.showSkins && this.skin && skinImage &&
                skinImage.complete && skinImage.width && skinImage.height) {
                if (settings.fillSkin) ctx.fill();
                ctx.save(); // for the clip
                ctx.clip();
                ctx.drawImage(skinImage, this.x - this.s, this.y - this.s,
                    this.s * 2, this.s * 2);
                ctx.restore();
            } else {
                ctx.fill();
            }
            if (this.s > 20) {
                ctx.stroke();
                this.s += ctx.lineWidth / 2;
            }
        }
        drawText(ctx) {
            if (this.s < 20 || this.jagged) return;
            if (this.name && settings.showNames) {
                drawText(ctx, false, this.x, this.y, this.nameSize, this.drawNameSize, this.name);
            }
            if (settings.showMass && (cells.mine.indexOf(this.id) !== -1 || cells.mine.length === 0)) {
                const mass = (~~(this.s * this.s / 100)).toString();
                let y = this.y;
                if (this.name && settings.showNames)
                    y += Math.max(this.s / 4.5, this.nameSize / 1.5);
                drawText(ctx, true, this.x, y, this.nameSize / 2, this.drawNameSize / 2, mass);
            }
        }
    }

    function cacheCleanup() {
        for (const i of cachedNames.keys()) {
            for (const j of cachedNames.get(i).keys()) {
                if (syncAppStamp - cachedNames.get(i).get(j).accessTime >= 5000) {
                    cachedNames.get(i).delete(j);
                }
            }
        }
        for (const i of cachedMass.keys()) {
            if (syncAppStamp - cachedMass.get(i).accessTime >= 5000) {
                cachedMass.delete(i);
            }
        }
    }

    // 2-var draw-stay cache
    const cachedNames = new Map();
    const cachedMass  = new Map();
    window.cachedNames = cachedNames;
    window.cachedMass = cachedMass;

    function drawTextOnto(canvas, ctx, text, size) {
        ctx.font = size + 'px Ubuntu';
        ctx.lineWidth = Math.max(~~(size / 10), 2);
        canvas.width = ctx.measureText(text).width + 2 * ctx.lineWidth;
        canvas.height = 4 * size;
        ctx.font = size + 'px Ubuntu';
        ctx.lineWidth = Math.max(~~(size / 10), 2);
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFF'
        ctx.strokeStyle = '#000';
        ctx.translate(canvas.width / 2, 2 * size);
        (ctx.lineWidth !== 1) && ctx.strokeText(text, 0, 0);
        ctx.fillText(text, 0, 0);
    }
    function drawRaw(ctx, x, y, text, size) {
        ctx.font = size + 'px Ubuntu';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.lineWidth = Math.max(~~(size / 10), 2);
        ctx.fillStyle = '#FFF'
        ctx.strokeStyle = '#000';
        (ctx.lineWidth !== 1) && ctx.strokeText(text, x, y);
        ctx.fillText(text, x, y);
        ctx.restore();
    }
    function newNameCache(value, size) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        drawTextOnto(canvas, ctx, value, size);
        if (!cachedNames.has(value)) cachedNames.set(value, new Map());
        const cache = {
            width: canvas.width,
            height: canvas.height,
            canvas: canvas,
            value: value,
            size: size,
            accessTime: syncAppStamp
        };
        cachedNames.get(value).set(size, cache);
        return cache;
    }
    function newMassCache(size) {
        const canvases = {
            0: { }, 1: { }, 2: { }, 3: { }, 4: { },
            5: { }, 6: { }, 7: { }, 8: { }, 9: { }
        };
        for (const i in canvases) {
            const canvas = canvases[i].canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            drawTextOnto(canvas, ctx, i, size);
            canvases[i].canvas = canvas;
            canvases[i].width = canvas.width;
            canvases[i].height = canvas.height;
        }
        const cache = {
            canvases: canvases,
            size: size,
            lineWidth: Math.max(~~(size / 10), 2),
            accessTime: syncAppStamp
        };
        cachedMass.set(size, cache);
        return cache;
    }
    function toleranceTest(a, b, tolerance) {
        return (a - tolerance) <= b && b <= (a + tolerance);
    }
    function getNameCache(value, size) {
        if (!cachedNames.has(value)) return newNameCache(value, size);
        const sizes = Array.from(cachedNames.get(value).keys());
        for (let i = 0, l = sizes.length; i < l; i++) {
            if (toleranceTest(size, sizes[i], size / 4)) {
                return cachedNames.get(value).get(sizes[i]);
            }
        }
        return newNameCache(value, size);
    }
    function getMassCache(size) {
        const sizes = Array.from(cachedMass.keys());
        for (let i = 0, l = sizes.length; i < l; i++) {
            if (toleranceTest(size, sizes[i], size / 4)) {
                return cachedMass.get(sizes[i]);
            }
        }
        return newMassCache(size);
    }

    function drawText(ctx, isMass, x, y, size, drawSize, value) {
        ctx.save();
        if (size > 500) return drawRaw(ctx, x, y, value, drawSize);
        ctx.imageSmoothingQuality = 'high';
        if (isMass) {
            const cache = getMassCache(size);
            cache.accessTime = syncAppStamp;
            const canvases = cache.canvases;
            const correctionScale = drawSize / cache.size;

            // calculate width
            let width = 0;
            for (let i = 0; i < value.length; i++) {
                width += canvases[value[i]].width - 2 * cache.lineWidth;
            }

            ctx.scale(correctionScale, correctionScale);
            x /= correctionScale;
            y /= correctionScale;
            x -= width / 2;
            for (let i = 0; i < value.length; i++) {
                const item = canvases[value[i]];
                ctx.drawImage(item.canvas, x, y - item.height / 2);
                x += item.width - 2 * cache.lineWidth;
            }
        } else {
            const cache = getNameCache(value, size);
            cache.accessTime = syncAppStamp;
            const canvas = cache.canvas;
            const correctionScale = drawSize / cache.size;
            ctx.scale(correctionScale, correctionScale);
            x /= correctionScale;
            y /= correctionScale;
            ctx.drawImage(canvas, x - canvas.width / 2, y - canvas.height / 2);
        }
        ctx.restore();
    }
    function processKey(event) {
        let key = CODE_TO_KEY[event.code] || event?.key?.toLowerCase();
        if (Object.hasOwnProperty.call(IE_KEYS, key)) key = IE_KEYS[key]; // IE fix
        return key;
    }
    function keydown(event) {
        const key = processKey(event);
        if (pressed[key]) return;
        if (Object.hasOwnProperty.call(pressed, key)) pressed[key] = true;
        if (key === 'enter') {
            if (escOverlayShown || !settings.showChat) return;
            if (isTyping) {
                chatBox.blur();
                if (chatBox.value.length > 0) sendChat(chatBox.value);
                chatBox.value = '';
            } else {
                chatBox.focus();
            }
        } else if (key === 'escape') {
            escOverlayShown ? hideESCOverlay() : showESCOverlay();
        } else {
            if (isTyping || escOverlayShown) return;
            let code = KEY_TO_OPCODE[key];
            if (code !== undefined) wsSend(code);
            if (key === 'w') {
                code = UINT8_CACHE[minionControlled ? 23 : 21];
                macroIntervalID = setInterval(() => wsSend(code), macroCooldown);
                wsSend(code);
            }
            if (key === ' ')
                wsSend(UINT8_CACHE[minionControlled ? 22 : 17]);
            if (key === 'q') {
                wsSend(UINT8_CACHE[18]);
                minionControlled = !minionControlled;
            }
        }
    }
    function keyup(event) {
        const key = processKey(event);
        if (Object.hasOwnProperty.call(pressed, key)) pressed[key] = false;
        if (key === 'w') clearInterval(macroIntervalID);
    }
    function handleScroll(event) {
        if (event.target !== mainCanvas) return;
        camera.userZoom *= event.deltaY > 0 ? 0.8 : 1.2;
        camera.userZoom = Math.max(camera.userZoom, settings.moreZoom ? 0.1 : 1);
        camera.userZoom = Math.min(camera.userZoom, 4);
    }

    function init() {
        mainCanvas = document.getElementById('canvas');
        mainCtx = mainCanvas.getContext('2d');
        chatBox = byId('chat_textbox');
        soundsVolume = byId('soundsVolume');
        mainCanvas.focus();

        loadSettings();
        window.addEventListener('beforeunload', storeSettings);
        document.addEventListener('wheel', handleScroll, {passive: true});
        byId('play-btn').addEventListener('click', () => {
            const skin = settings.skin;
            sendPlay((skin ? `<${skin}>` : '') + settings.nick.substring(0, 16));
            hideESCOverlay();
        });
        window.onkeydown = keydown;
        window.onkeyup = keyup;
        chatBox.onblur = () => {
            isTyping = false;
            drawChat();
        };
        chatBox.onfocus = () => {
            isTyping = true;
            drawChat();
        };
        mainCanvas.onmousemove = (event) => {
            mouseX = event.clientX;
            mouseY = event.clientY;
        };
        setInterval(() => {
            sendMouseMove(
                (mouseX - mainCanvas.width / 2) / camera.scale + camera.x,
                (mouseY - mainCanvas.height / 2) / camera.scale + camera.y
            );
        }, 40);
        window.onresize = () => {
            const width = mainCanvas.width = window.innerWidth;
            const height = mainCanvas.height = window.innerHeight;
            camera.viewportScale = Math.max(width / 1920, height / 1080);
        };
        window.onresize();
        const mobileStuff = byId('mobileStuff');
        // eslint-disable-next-line
        const touchpad = byId('touchpad');
        const touchCircle = byId('touchCircle');
        const touchSize = .2;
        let touched = false;
        const touchmove = (event) => {
            const touch = event.touches[0];
            const width = innerWidth * touchSize;
            const height = innerHeight * touchSize;
            if (touch.pageX < width && touch.pageY > innerHeight - height) {
                mouseX = innerWidth / 2 + (touch.pageX - width / 2) * innerWidth / width;
                mouseY = innerHeight / 2 + (touch.pageY - (innerHeight - height / 2)) * innerHeight / height;
            } else {
                mouseX = touch.pageX;
                mouseY = touch.pageY;
            }
            const r = innerWidth * .02;
            touchCircle.style.left = mouseX - r + 'px';
            touchCircle.style.top = mouseY - r + 'px';
        };
        window.addEventListener('touchmove', touchmove);
        window.addEventListener('touchstart', (event) => {
            if (!touched) {
                touched = true;
                mobileStuff.show();
            }
            if (event.target.id === 'splitBtn') {
                wsSend(UINT8_CACHE[17]);
            } else if (event.target.id === 'ejectBtn') {
                wsSend(UINT8_CACHE[21]);
            } else {
                touchmove(event);
            }
            touchCircle.show();
        });
        window.addEventListener('touchend', (event) => {
            if (event.touches.length === 0) {
                touchCircle.hide();
            }
        });

        gameReset();
        showESCOverlay();

        const regex = /ip=([\w\W]+:[0-9]+)/;
        const args = window.location.search;
        const div = args ? regex.exec(args.slice(1)) : null;
        if (div) {
            window.setserver(div[1]);
        } else {
            window.setserver(byId('gamemode').value);
        }
        drawGame();
        Logger.info(`Init done in ${Date.now() - LOAD_START}ms`);
    }
    window.setserver = (url) => {
        if (url === wsUrl && ws && ws.readyState <= WebSocket.OPEN) return;
        wsInit(url);
    };
    window.spectate = (/* a */) => {
        wsSend(UINT8_CACHE[1]);
        stats.maxScore = 0;
        hideESCOverlay();
    };
    window.changeSkin = (a) => {
        byId('skin').value = a;
        settings.skin = a;
        byId('gallery').hide();
    };
    window.openSkinsList = () => {
        if (byId('gallery-body').innerHTML === '') buildGallery();
        byId('gallery').show(0.5);
    };
    window.addEventListener('DOMContentLoaded', init);
})();