function Prize(coupon) {
    this.coupon = coupon;
}

module.exports = Prize;

Prize.prototype.build = function () {
    var buf = new ArrayBuffer(9 + 2 * this.coupon.length);
    var view = new DataView(buf);
    view.setUint8(0, 70);
    var offset = 1;
    // Send coupon
    for (var j = 0; j < this.coupon.length; j++) {
        view.setUint16(offset, this.coupon.charCodeAt(j), true);
        offset += 2;
    }
    view.setUint16(offset, 0, true);
    offset += 2;
    return buf;
};