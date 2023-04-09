function SetBorder(left, right, top, bottom) {
    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
}

module.exports = SetBorder;

SetBorder.prototype.build = function() {
    var version = "Ogar3 by Faris90";
    var buf = new ArrayBuffer(39+2*version.length);
    var view = new DataView(buf);

    view.setUint8(0, 64, true);
    view.setFloat64(1, this.left, true);
    view.setFloat64(9, this.top, true);
    view.setFloat64(17, this.right, true);
    view.setFloat64(25, this.bottom, true);
    var offset = 33;
    view.setUint32(offset, 1, true);
    offset += 4;
    for (var j = 0; j < version.length; j++) {
        view.setUint16(offset, version.charCodeAt(j), true);
        offset += 2;
    }
    view.setUint16(offset, 0, true);
    return buf;
};

