function ClearNodes() {
}

module.exports = ClearNodes;

ClearNodes.prototype.build = function () {
  var buf = new ArrayBuffer(1);
  var view = new DataView(buf);

  view.setUint8(0, 20);

  return buf;
};
