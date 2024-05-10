function UpdateNodes(destroyQueue, nodes, nonVisibleNodes, scrambleX, scrambleY, gameServer) {
  this.destroyQueue = destroyQueue;
  this.nodes = nodes;
  this.nonVisibleNodes = nonVisibleNodes;
  this.scrambleX = scrambleX;
  this.scrambleY = scrambleY;
  this.gameServer = gameServer;
}

module.exports = UpdateNodes;

UpdateNodes.prototype.build = function () {
  // Calculate nodes sub packet size before making the data view
  var nodesLength = 0;
  for (var i = 0; i < this.nodes.length; i++) {
    var node = this.nodes[i];

    if (typeof node == "undefined") {
      continue;
    }

    /////        nodesLength = nodesLength + 20 + (node.getName().length * 2);
    /////
    if (this.gameServer.config.packetversion == 1) {
    nodesLength = nodesLength + 17 + (node.getName().length * 2) + node.getPremium().length;
    } else {
      nodesLength = nodesLength + 21 + (node.getName().length * 2) + node.getPremium().length;
    }
    /////
  }

  var buf = new ArrayBuffer(3 + (this.destroyQueue.length * 12) + (this.nonVisibleNodes.length * 4) + nodesLength + 8);
  var view = new DataView(buf);

  view.setUint8(0, 16, true); // Packet ID
  view.setUint16(1, this.destroyQueue.length, true); // Nodes to be destroyed

  var offset = 3;
  for (var i = 0; i < this.destroyQueue.length; i++) {
    var node = this.destroyQueue[i];

    if (!node) {
      continue;
    }

    var killer = 0;
    if (node.getKiller()) {
      killer = node.getKiller().nodeId;
    }

    view.setUint32(offset, killer, true); // Killer ID
    view.setUint32(offset + 4, node.nodeId, true); // Node ID

    offset += 8;
  }

  for (var i = 0; i < this.nodes.length; i++) {
    var node = this.nodes[i];

    if (typeof node == "undefined") {
      continue;
    }
if (this.gameServer.config.packetversion == 1) {
    view.setUint32(offset, node.nodeId, true); // Node ID
    view.setUint16(offset + 4, node.position.x + this.scrambleX, true); // X position
    view.setUint16(offset + 6, node.position.y + this.scrambleY, true); // Y position
    view.setUint16(offset + 8, node.getSize(), true); // Mass formula: Radius (size) = (mass * mass) / 100
    view.setUint8(offset + 10, node.color.r, true); // Color (R)
    view.setUint8(offset + 11, node.color.g, true); // Color (G)
    view.setUint8(offset + 12, node.color.b, true); // Color (B)
    /////view.setUint8(offset + 17, node.spiked, true); // Flags
    /////
    view.setUint8(offset + 13, node.spiked); // Flags
    /////
    offset += 14;
} else {
   view.setUint32(offset, node.nodeId, true); // Node ID
    view.setInt32(offset + 4, node.position.x + this.scrambleX, true); // X position
    view.setInt32(offset + 8, node.position.y + this.scrambleY, true); // Y position
    view.setUint16(offset + 12, node.getSize()); // Mass formula: Radius (size) = (mass * mass) / 100
    view.setUint8(offset + 14, node.color.r); // Color (R)
    view.setUint8(offset + 15, node.color.g); // Color (G)
    view.setUint8(offset + 16, node.color.b); // Color (B)
    /////view.setUint8(offset + 17, node.spiked, true); // Flags
    /////
    view.setUint8(offset + 17, (node.spiked | 4)); // Flags
    /////
    offset += 18;
        /////

    /////
}
      var skin = node.getPremium();
    if (skin) {
      for (var j = 0; j < skin.length; j++) {
        var c = skin.charCodeAt(j);
        if (c) {
         view.setUint8(offset, c);
        }
        offset++;
    }
    }
    view.setUint8(offset, 0); // End of string
    offset++;

    var name = node.getName();

    if (name) {
      for (var j = 0; j < name.length; j++) {
        var c = name.charCodeAt(j);
        if (c) {
          view.setUint16(offset, c, true);
        }
        offset += 2;
      }
    }

    view.setUint16(offset, 0, true); // End of string
    offset += 2;
  }

  var len = this.nonVisibleNodes.length + this.destroyQueue.length;
  view.setUint32(offset, 0, true); // End
  view.setUint32(offset + 4, len, true); // # of non-visible nodes to destroy

  offset += 8;

  // Destroy queue + nonvisible nodes
  for (var i = 0; i < this.destroyQueue.length; i++) {
    var node = this.destroyQueue[i];

    if (!node) {
      continue;
    }

    view.setUint32(offset, node.nodeId, true);
    offset += 4;
  }
  for (var i = 0; i < this.nonVisibleNodes.length; i++) {
    var node = this.nonVisibleNodes[i];

    if (!node) {
      continue;
    }

    view.setUint32(offset, node.nodeId, true);
    offset += 4;
  }

  return buf;
};
