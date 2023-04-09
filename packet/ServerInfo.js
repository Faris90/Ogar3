function ServerInfo(uptime, players, msize, mfood, smode) {
    this.uptime = uptime;
    this.players = players;
    this.msize = msize;
    this.mfood = mfood;
    this.smode = smode;

}

module.exports = ServerInfo;

ServerInfo.prototype.build = function() {
    var buf = new ArrayBuffer(41);
    var view = new DataView(buf);

    view.setUint8(0, 90, true);
    view.setFloat64(1, this.uptime, true);
    view.setFloat64(9, this.players, true);
    view.setFloat64(17, this.msize, true);
    view.setFloat64(25, this.mfood, true);
    view.setFloat64(33, this.smode, true);
    return buf;
};

