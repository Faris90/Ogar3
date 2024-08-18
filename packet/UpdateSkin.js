function UpdateSkin(node) {
    this.node = node;
}

module.exports = UpdateSkin;

UpdateSkin.prototype.build = function() {
    var buf = new ArrayBuffer(9);
    var view = new DataView(buf);

    view.setUint8(0, 30, true);
    view.setUint32(1, this.node.nodeId, true);

    view.setInt32(5, this.node.skin, true);

    return buf;
};

