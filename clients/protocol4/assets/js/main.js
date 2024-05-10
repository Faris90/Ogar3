let teamScores = [];
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let messages = [];
let leaderboard = [];
let ws = null;
let nodeX = 0;
let nodeY = 0;
let nodesOnScreen = [];
let playerCells = [];
let nodes = {};
let nodelist = [];
let Cells = [];
let rawMouseX = 0;
let rawMouseY = 0;
let X = -1;
let Y = -1;
let timestamp = 0;
let userNickName = null;
let leftPos = 0;
let topPos = 0;
let rightPos = 1E4;
let bottomPos = 1E4;
let viewZoom = 1;
let showName = true;
let userScore = 0;
let posX = nodeX = ~~((leftPos + rightPos) / 2);
let posY = nodeY = ~~((topPos + bottomPos) / 2);
let posSize = 1;
let zoom = 1;
let minX = 0;
let minY = 0;
let maxX = 0;
let isWatching = false;
let isTyping = false;
let maxY = 0;
let noRanking = false;
let options = {
    delay: 120,
    squareMode: false,
    sectors: false,
    borders: false,
    bgColour: "222222",
    borderColour: "FFA500",
    sectorColour: "1A1A1A",
    hideFood: false,
    ERTP: false,
    noMass: false,
    noNames: false,
    ShortMass: false
};

let fps = {
    startTime: 0,
    frameNumber: 0,
    getFPS: function() {
        this.frameNumber++;
        var d = new Date().getTime(),
            currentTime = (d - this.startTime) / 1000,
            result = Math.floor((this.frameNumber / currentTime));
        if (currentTime > 1) {
            this.startTime = new Date().getTime();
            this.frameNumber = 0;
        }
        return result;
    }
};

function Main() {
    document.getElementById("canvas").focus();
    canvas = document.getElementById("canvas");

    canvas.onmousemove = function(event) {
        rawMouseX = event.clientX;
        rawMouseY = event.clientY;
        updateMouse()
    };

    document.body.onmousewheel = handleWheel;
    window.onresize = canvasResize;
    $(document).keydown(function(objEvent) { // When using tab bot control it dosnt use the chrome default.
        if (objEvent.keyCode == 9) { // Tab pressed
            objEvent.preventDefault(); // Stops its action
        }
    })

    $(document).on("ready", function() {
        $("#nick").change(function() {
            localStorage.setItem("nick", document.getElementById("nick").value);
        })
        $("#skinUrl").change(function() {
            localStorage.setItem("skinurl", document.getElementById("skinUrl").value);
        })

        $('#nick').val(localStorage.getItem('nick'));
        $('#skinUrl').val(localStorage.getItem('skinurl'));
    })

    if (window.requestAnimationFrame) {
        reDraw();
    };

    setInterval(sendMouseMove, 1);
    canvasResize();

    $("#overlays").fadeIn(6E2);
};


function updateMouse() {
    X = (rawMouseX - ctx.canvas.width / 2) / viewZoom + nodeX;
    Y = (rawMouseY - ctx.canvas.height / 2) / viewZoom + nodeY
};


function updateWindowFunctions() {

    // Window functions

    window.onkeydown = function(event) {
        if (isTyping === true && event.keyCode !== 13)
            return;

        switch (event.keyCode) {
            case 81:
                // Q
                sendUint8(18);
                break;

            case 32:
                // Space (Split)
                sendUint8(17);
                break;

            case 87:
                // W
                sendUint8(21);
                break;

            case 9:
                // Tab Bot Switch (For Dual Mode)
                sendUint8(22);
                break;

            case 71:
                // Double Split G
                setTimeout(function() {
                    sendUint8(17);
                }, 50);
                setTimeout(function() {
                    sendUint8(17);
                }, 100);
                break;

            case 84:
                // Max Split T

                if (options.ERTP === true) {
                    return;
                }
                sendUint8(17);
                setTimeout(function() {
                    sendUint8(17);
                }, 40);
                setTimeout(function() {
                    sendUint8(17);
                }, 80);
                setTimeout(function() {
                    sendUint8(17);
                }, 120);
                break;


            case 80:
                // P (Collect pellets)
                if (options.ERTP === false) {
                    return;
                };
                sendUint8(25);
                break;

            case 84:
                // T (Freeze minions)
                if (options.ERTP === false) {
                    return;
                };
                sendUint8(24);
                break;

            case 82:
                // R (Minion eject)
                if (options.ERTP === false) {
                    return;
                };
                sendUint8(23);
                break;

            case 69:
                // E (Minion split)
                if (options.ERTP === false) {
                    return;
                };
                sendUint8(22);
                break;

            case 27:
                // ESC (Menu)
                $("#overlays").fadeIn(6E2);;
                break;

            case 13:
                // Chat 
                const textBox = document.getElementById("chat");

                if (textBox.value.length === 0) {
                    textBox.focus();
                } else {
                    switch (textBox.value) {
                        // Local commands
                        case "/sectors":
                            options.sectors = options.sectors === true ? false : true;
                            AddMessage("CLIENT", "#FFA500", `Sectors ${options.sectors === true ? "on." : "off."}`)
                            break;
                        case "/borders":
                            options.borders = options.borders === true ? false : true;
                            AddMessage("CLIENT", "#FFA500", `Borders ${options.borders === true ? "on." : "off."}`)
                            break;
                        case "/square":
                            options.squareMode = options.squareMode === true ? false : true;
                            AddMessage("CLIENT", "#FFA500", `Square mode ${options.squareMode === true ? "on." : "off."}`)
                            break;
                        case "/ertp":
                            options.ERTP = options.ERTP === true ? false : true;
                            AddMessage("CLIENT", "#FFA500", `ERTP ${options.ERTP === true ? "on." : "off."}`)
                            break;
                        case "/clientHelp":
                            AddMessage("CLIENT", "#FFA500", "Here's a list of local commands that you may execute")
                            AddMessage("CLIENT", "#FFA500", "/sectors - Toggle sectors on and off.")
                            AddMessage("CLIENT", "#FFA500", "/borders - Toggle borders on and off.")
                            AddMessage("CLIENT", "#FFA500", "/square  - Toggle square mode on and off.")
                            break;

                            // Chat message
                        default:
                            var buffer = prepareData(2 + 2 * textBox.value.length);
                            var offset = 0;
                            buffer.setUint8(offset++, 99);
                            buffer.setUint8(offset++, 0);
                            for (var i = 0; i < textBox.value.length; ++i) {
                                buffer.setUint16(offset, textBox.value.charCodeAt(i), true);
                                offset += 2;
                            }
                            send(buffer);
                            break;
                    };
                    textBox.blur();
                    textBox.value = "";
                };

                break;
        };

    };

    window.setNick = function(arg) {
        $("#overlays").hide();
        userNickName = arg;
        sendNickName();
        userScore = 0
    };

    window.watch = function() {
        userNickName = null;
        isWatching = true;
        sendUint8(1);
        $("#overlays").hide();
    };

    // Handle options

    $("#chat").on("blur", function() {
        isTyping = false;
    });

    $("#chat").on("focus", function() {
        isTyping = true;
    });

    $("#delay").on("input", function() {
        $("#animationTxt").text("Animation delay " + $("#delay").val());
        options.delay = Number($("#delay").val());
    });

    $("#food").change(function() {
        options.hideFood = $(this).is(':checked');
    });

    $("#sqMode").change(function() {
        options.squareMode = $(this).is(':checked');
    });

    $("#ERTP").change(function() {
        options.ERTP = $(this).is(':checked');
    });

    $("#sectors").change(function() {
        options.sectors = $(this).is(':checked');
    });

    $("#borders").change(function() {
        options.borders = $(this).is(':checked');
    });

    $("#name").change(function() {
        options.noNames = $(this).is(':checked');
    });

    $("#mass").change(function() {
        options.noMass = $(this).is(':checked');
    });
    $("#ShortMass").change(function() {
        options.ShortMass = $(this).is(':checked');
    });

    $("#bgColour").change(function() {
        options.bgColour = $("#bgColour").val();
    });

    $("#borderColour").change(function() {
        options.borderColour = $("#borderColour").val();
    });

    $("#sectorColour").change(function() {
        options.sectorColour = $("#sectorColour").val();
    });

    if (playerCells.length === 0 && isWatching === false) {
        $("#overlays").fadeIn(6E2);
    };
};


function resetVars() {
    nodesOnScreen = [];
    playerCells = [];
    nodes = [];
    nodelist = [];
    Cells = [];
    leaderboard = [];
    userScore = 0;
    messages = [];
};

function connect(url) {
    if (ws) {
        ws.close();
    };

    ws = new WebSocket(url);
    ws.binaryType = "arraybuffer";
    ws.onmessage = onWsMessage.bind(this);
    ws.onopen = onOpen.bind(this);
    ws.onerror = onError.bind(this);
    ws.onclose = onClose.bind(this);
};

function onOpen() {
    resetVars();

    var buffer = prepareData(5);
    buffer.setUint8(0, 254);
    buffer.setUint32(1, 4, true);
    send(buffer);

    var buffer = prepareData(5);
    buffer.setUint8(0, 255);
    buffer.setUint32(1, 1332175218, true);
    send(buffer);

    console.log("Connected");
};

function onError(event) {
    console.log(event.code);
};

function onClose() {
    console.log("Disconnected from server");
};

function handleWheel(event) {
    zoom *= Math.pow(.9, event.wheelDelta / -120 || event.detail || 0);
};

function onWsMessage(msg) {
    handleMessage(new DataView(msg.data));
};

function prepareData(data) {
    return new DataView(new ArrayBuffer(data))
};

function send(data) {
    if (!ws) {
        return;
    }
    ws.send(data.buffer)
};

function handleMessage(msg) {
    function getString() {
        var text = '',
            char;
        while ((char = msg.getUint16(offset, true)) != 0) {
            offset += 2;
            text += String.fromCharCode(char);
        }
        offset += 2;
        return text;
    };

    var offset = 0,
        setCustomLB = false;

    /** Packet ID's
     * 16: Tick (Update Nodes).
     * 17: Position update 
     * 20: Clear Nodes (Clears nodes that are currently on screen).
     * 32: Add Nodes.
     * 48: Custom leader board. (Notifies the client).
     * 49: Update Leaderboard for Free For All and related gamemodes.
     * 50: Update Loaderboard for the Teams gamemode.
     * 64: Border (Left, Right, Top and Bottom).
     * 99: Add chat message.
     */

    switch (msg.getUint8(offset++)) {
        case 16:
            updateNodes(msg, offset);
            break;
        case 17:
            posX = msg.getFloat32(offset, true);
            offset += 4;
            posY = msg.getFloat32(offset, true);
            offset += 4;
            posSize = msg.getFloat32(offset, true);
            offset += 4;
            break;
        case 20:
            playerCells = [];
            nodesOnScreen = [];
            break;
        case 32:
            nodesOnScreen.push(msg.getUint32(offset, true));
            offset += 4;
            break;
        case 48:
            setCustomLB = true;
            noRanking = true;
            break;
        case 49:
            if (!setCustomLB) {
                noRanking = false;
            };

            //teamScores = null;
            var LBplayerNum = msg.getUint32(offset, true);
            offset += 4;
            leaderboard = [];
            for (i = 0; i < LBplayerNum; ++i) {
                var nodeId = msg.getUint32(offset, true);
                offset += 4;
                leaderboard.push({
                    id: nodeId,
                    name: getString()
                });
            };
            break;
        case 50:
            teamScores = [];
            var LBteamNum = msg.getUint32(offset, true);
            offset += 4;
            for (var i = 0; i < LBteamNum; ++i) {
                teamScores.push(msg.getFloat32(offset, true));
                offset += 4;
            }
            console.log(teamScores)
            break;
        case 64:
            leftPos = msg.getFloat64(offset, true);
            offset += 8;
            topPos = msg.getFloat64(offset, true);
            offset += 8;
            rightPos = msg.getFloat64(offset, true);
            offset += 8;
            bottomPos = msg.getFloat64(offset, true);
            offset += 8;
            posX = (rightPos + leftPos) / 2;
            posY = (bottomPos + topPos) / 2;
            posSize = 1;
            minX = leftPos;
            minY = topPos;
            maxX = rightPos;
            maxY = bottomPos;

            if (0 == playerCells.length) {
                nodeX = posX;
                nodeY = posY;
                viewZoom = posSize;
            };
            break;
        case 99:
            offset++
            const r = msg.getUint8(offset++);
            const g = msg.getUint8(offset++)
            const b = msg.getUint8(offset++)
            let color = (r << 16 | g << 8 | b).toString(16);

            while (color.length > 6) {
                color = '0' + color;
            }
            color = '#' + color;

            AddMessage(getString(), color, getString(), Date.now());

    }
}

function updateNodes(msg, offset) {
    timestamp = +new Date;
    var code = Math.random();
    var queueLength = msg.getUint16(offset, true);
    offset += 2;

    for (i = 0; i < queueLength; ++i) {
        var killer = nodes[msg.getUint32(offset, true)],
            killedNode = nodes[msg.getUint32(offset + 4, true)];
        offset += 8;
        if (killer && killedNode) {
            killedNode.destroy();
            killedNode.ox = killedNode.x;
            killedNode.oy = killedNode.y;
            killedNode.oSize = killedNode.size;
            killedNode.nx = killer.x;
            killedNode.ny = killer.y;
            killedNode.nSize = killedNode.size;
            killedNode.updateTime = timestamp;
        };
    };

    while (1) {
        var nodeid = msg.getUint32(offset, true);
        offset += 4;

        if (0 == nodeid) break;
        i++;

        var size, posY, posX = msg.getInt16(offset, true);
        offset += 2;

        posY = msg.getInt16(offset, true);
        offset += 2;

        size = msg.getInt16(offset, true);
        offset += 2;

        for (var r = msg.getUint8(offset++), g = msg.getUint8(offset++), b = msg.getUint8(offset++), color = (r << 16 | g << 8 | b).toString(16); 6 > color.length;) color = "0" + color;
        var colorstr = "#" + color,
            flags = msg.getUint8(offset++),
            flagVirus = !!(flags & 1),
            flagPlayer = !!(flags & 16);
        flags & 2 && (offset += 4);
        flags & 4 && (offset += 8);
        flags & 8 && (offset += 16);

        for (var char, name = "";;) {
            char = msg.getUint16(offset, true);
            offset += 2;
            if (0 == char) break;
            name += String.fromCharCode(char)
        };

        var node = null;
        if (nodes.hasOwnProperty(nodeid)) {
            node = nodes[nodeid];
            node.updatePos();
            node.ox = node.x;
            node.oy = node.y;
            node.oSize = node.size;
            node.color = colorstr;
        } else {
            node = new Cell(nodeid, posX, posY, size, colorstr, name);
            nodelist.push(node);
            nodes[nodeid] = node;
            node.ka = posX;
            node.la = posY;
        };

        node.isVirus = flagVirus;
        node.isPlayer = flagPlayer;
        node.nx = posX;
        node.ny = posY;
        node.nSize = size;
        node.updateCode = code;
        node.updateTime = timestamp;
        node.flag = flags;

        if (-1 != nodesOnScreen.indexOf(nodeid) && -1 == playerCells.indexOf(node)) {
            document.getElementById("overlays").style.display = "none";
            playerCells.push(node);
            if (1 == playerCells.length) {
                nodeX = node.x;
                nodeY = node.y;
            };
        };
    };

    queueLength = msg.getUint32(offset, true);
    offset += 4;
    for (i = 0; i < queueLength; i++) {
        var nodeId = msg.getUint32(offset, true);
        offset += 4;
        node = nodes[nodeId];
        null != node && node.destroy();
    };
};

function Sectors() {
    // Taken from AgarPlus

    if (options.sectors === true) {
        const x = Math.round(minX) + 40;
        const y = Math.round(minY) + 40;
        const second = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
        const barWidth = (Math.round(maxX) - 90 - x) / 5;
        const h = (Math.round(maxY) - 40 - y) / 5;
        let j = 0;

        ctx.save();
        ctx.beginPath();
        ctx.lineWidth = 0.05;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = barWidth * 0.6 + "px Courgette";
        ctx.fillStyle = "#" + options.sectorColour;


        while (j < 5) {
            let i = 0;
            while (5 > i) {
                ctx.fillText(second[j] + (i + 1), x + barWidth * i + barWidth / 2, y + h * j + h / 2);
                i++
            };
            j++;
        };

        ctx.lineWidth = 100;
        ctx.strokeStyle = "#1A1A1A";
        j = 0;

        while (j < 5) {
            i = 0;
            while (i < 5) {
                ctx.strokeRect(x + barWidth * i, y + h * j, barWidth, h);
                i++
            };
            j++;
        };

        ctx.stroke();
        ctx.restore();
    };
};

function sendMouseMove() {
    if (!ws || ws.readyState == ws.OPEN) {
        const buffer = prepareData(21);
        buffer.setUint8(0, 16);
        buffer.setFloat64(1, X, true);
        buffer.setFloat64(9, Y, true);
        buffer.setUint32(17, 0, true);
        send(buffer);
    };
};

function sendNickName() {
    if (ws.readyState == ws.OPEN && null != userNickName) {
        const buffer = prepareData(1 + 2 * userNickName.length);
        buffer.setUint8(0, 0);
        for (var i = 0; i < userNickName.length; ++i) buffer.setUint16(1 + 2 * i, userNickName.charCodeAt(i), true);
        send(buffer)
    };
};


function sendUint8(data) {
    if (ws.readyState == ws.OPEN) {
        var buffer = prepareData(1);
        buffer.setUint8(0, data);
        send(buffer)
    };
};

function reDraw() {
    Draw();
    window.requestAnimationFrame(reDraw)
};

function canvasResize() {
    window.scrollTo(0, 0);
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    ctx.canvas.width = ctx.canvas.width;
    ctx.canvas.height = ctx.canvas.height;
};

function viewRange() {
    var ratio;
    ratio = Math.max(ctx.canvas.height / 1080, ctx.canvas.width / 4000);
    return ratio * zoom;
};

function calcViewZoom() {
    if (0 != playerCells.length) {
        for (var newViewZoom = 0, i = 0; i < playerCells.length; i++)
            newViewZoom = Math.pow(Math.min(64 / newViewZoom, 1), .4) * viewRange();
        viewZoom = (9 * viewZoom + newViewZoom) / 10
    };
};

function Draw() {

    var a, oldtime = Date.now();
    timestamp = oldtime;

    if (0 < playerCells.length) {
        calcViewZoom();
        var c = a = 0;
        for (var d = 0; d < playerCells.length; d++) {
            playerCells[d].updatePos();
            a += playerCells[d].x / playerCells.length;
            c += playerCells[d].y / playerCells.length;
        }
        posX = a;
        posY = c;
        posSize = viewZoom;
        nodeX = (nodeX + a) / 2;
        nodeY = (nodeY + c) / 2;
    } else {
        nodeX = (29 * nodeX + posX) / 30;
        nodeY = (29 * nodeY + posY) / 30;
    };

    updateMouse();
    drawBackground();

    nodelist.sort(function(a, b) {
        return a.size == b.size ? a.id - b.id : a.size - b.size;
    });

    ctx.save();
    ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
    ctx.scale(viewZoom, viewZoom);
    ctx.translate(-nodeX, -nodeY);

    Sectors();
    Borders();

    d = 0;
    while (d < Cells.length) {
        Cells[d].drawOneCell(ctx)
        d++;
    };

    d = 0
    while (d < nodelist.length) {
        nodelist[d].drawOneCell(ctx)
        d++;
    };

    ctx.restore();
    userScore = Math.max(userScore, calcUserScore());

    // Score
    let scoreText = "Score " + ~~(userScore / 100);
    ctx.globalAlpha = 1;
    ctx.font = '20px Tahoma';
    ctx.fillStyle = '#FFF';
    ctx.fillText(scoreText, 10, 25);

    // FPS
    let frames = fps.getFPS();
    let fpsText = "FPS " + frames;

    if (frames >= 40) {
        ctx.fillStyle = "#00FF00";
    } else if (frames >= 30) {
        ctx.fillStyle = "#FFFF33";
    } else {
        ctx.fillStyle = "#FF0000";
    };

    ctx.globalAlpha = 1;
    ctx.font = '20px Tahoma';
    ctx.fillText(fpsText, 10, 50);

    // Very simple leaderboard
    for (var i = 0; i < leaderboard.length; i++) {
        const section = leaderboard[i];
        const name = (i + 1) + ". " + (section.name === "" ? "An Unnamed Cell" : section.name);
        ctx.globalAlpha = .8;
        ctx.font = '15px Tahoma';
        ctx.fillStyle = "#FFF";
        ctx.fillText(name, (ctx.canvas.width - 200), 40 + 24 * i);
    };

    // Keep chat board short
    if (messages.length >= 15) {
        messages.splice(0, messages.length)
    };

    // Chat board
    for (var i = 0; i < messages.length; i++) {
        const message = messages[i];
        const content = message.content;
        const author = message.author;

        ctx.globalAlpha = .8;
        ctx.font = '15px Tahoma';
        ctx.fillStyle = message.color;
        ctx.fillText(author + ": " + content, (ctx.canvas.width / ctx.canvas.height) + 20, (ctx.canvas.height / ctx.canvas.width) + ctx.canvas.height - 70 - 24 * i);
    };

    ctx.restore();
};

function Borders() {
    if (options.borders === true) {
        ctx.save();
        ctx.strokeStyle = "#" + options.borderColour;
        ctx.lineWidth = 20;
        ctx.beginPath();

        ctx.moveTo(minX, minY);
        ctx.lineTo(maxX, minY);
        ctx.lineTo(maxX, maxY);
        ctx.lineTo(minX, maxY);

        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    };
};

function drawBackground() {
    ctx.fillStyle = "#" + options.bgColour;
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.save();
};

function calcUserScore() {
    for (var score = 0, i = 0; i < playerCells.length; i++) score += playerCells[i].nSize * playerCells[i].nSize;
    return score;
};

function AddMessage(author, color, content, time) {
    messages.push({
        author: author,
        color: color,
        content: content,
        time: time,
    });
};

function Cell(id, x, y, size, color, name) {
    this.id = id;
    this.ox = this.x = x;
    this.oy = this.y = y;
    this.oSize = size;
    this.size = size;
    this.color = color;
    this.name = name;
};

Cell.prototype = {
    id: 0,
    name: null,
    x: 0,
    y: 0,
    size: 0,
    ox: 0,
    oy: 0,
    oSize: 0,
    nx: 0,
    ny: 0,
    nSize: 0,
    flag: 0,
    updateTime: 0,
    updateCode: 0,
    delay: 0,
    destroyed: false,
    isVirus: false,

    destroy: function() {
        var tmp;
        for (tmp = 0; tmp < nodelist.length; tmp++)
            if (nodelist[tmp] == this) {
                nodelist.splice(tmp, 1);
                break
            };
        delete nodes[this.id];
        tmp = playerCells.indexOf(this);
        if (-1 != tmp) {
            playerCells.splice(tmp, 1);
        }
        tmp = nodesOnScreen.indexOf(this.id);
        if (-1 != tmp) {
            nodesOnScreen.splice(tmp, 1);
        }
        this.destroyed = true;
        Cells.push(this)
    },

    updatePos: function() {
        if (0 == this.id) return 1;
        var a;
        a = (timestamp - this.updateTime) / options.delay;
        a = 0 > a ? 0 : 1 < a ? 1 : a;
        var b = 0 > a ? 0 : 1 < a ? 1 : a;
        if (this.destroyed && 1 <= b) {
            var c = Cells.indexOf(this); - 1 != c && Cells.splice(c, 1)
        }
        this.x = a * (this.nx - this.ox) + this.ox;
        this.y = a * (this.ny - this.oy) + this.oy;
        this.size = b * (this.nSize - this.oSize) + this.oSize;
        return b;
    },


    drawOneCell: function(ctx) {
        const mass = ~~(this.size * this.size / 100);
        const isFood = (!this.isVirus && mass < 5);
        var line = mass > 999 ? (mass / 1000).toFixed(1) + "k" : mass;


        if (options.hideFood === true && isFood) {
            return;
        };

        ctx.save();
        c = this.updatePos();
        this.destroyed && (ctx.globalAlpha *= 1 - c);
        ctx.lineWidth = 10;
        ctx.fillStyle = this.color;

        // Draw nodes
        ctx.beginPath();

        if (options.squareMode === true) {
            // Square
            ctx.rect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
        } else {
            // Circle
            ctx.arc(this.x, this.y, this.size, .1, Math.PI * 2, false);
        };

        ctx.closePath();
        ctx.fill();

        // Draw skins
        if (-1 != playerCells.indexOf(this)) {
            const skin = new Image;
            const skinUrl = String($("#skinUrl").val());

            if (skinUrl.substr(0, 20) === "https://i.imgur.com/") {
                skin.src = skinUrl;
            };

            ctx.save();
            ctx.clip();
            ctx.drawImage(skin, this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
            ctx.restore();

        }

        if (0 != this.id) {

            // Cell stroke
            ctx.strokeStyle = this.color;
            ctx.globalAlpha = .6;
            ctx.stroke();

            // Draw name
            if (this.name && mass >= 200 && options.noNames === false) {
                ctx.globalAlpha = 1;
                ctx.font = Math.max(~~(.3 * this.size), 24) + 'px Tahoma';
                ctx.fillStyle = '#FFF';
                ctx.textAlign = "center";
                ctx.fillText(this.name, this.x, this.y);
            };

            // Draw mass
            if (mass >= 200 && options.noMass === false) {
                ctx.globalAlpha = 1;
                ctx.font = Math.max(~~(.3 * this.size), 24) + 'px Tahoma';
                ctx.fillStyle = '#FFF';
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                if (options.ShortMass === true) {
                    ctx.fillText(line, this.x, this.y + 120);
                } else {
                    ctx.fillText(mass, this.x, this.y + 120);
                }
            };
        };
        ctx.restore()
    },

};

Main();

setInterval(updateWindowFunctions, 100);
