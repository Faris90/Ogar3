function Message(msg) {
    this.msg = msg;
}

module.exports = Message;

Message.prototype.build = function() {
    
    var a = new ArrayBuffer(1 + 2 * this.msg.length),
    b = new DataView(a);
    b.setUint8(0, 42);
    for (var c = 0; c < this.msg.length; ++c) b.setUint16(1 + 2 * c, this.msg.charCodeAt(c), !0);
    
    return a;
}
