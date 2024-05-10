// A fake socket for bot players

function MinionSocket(gameServer) {
  this.server = gameServer;
}

module.exports = MinionSocket;

// Override

MinionSocket.prototype.sendPacket = function (packet) {
  // Fakes sending a packet

};

MinionSocket.prototype.close = function (error) {
  // Removes the bot
  var self = this;
  this.playerTracker.cells.forEach(function (cell) {
    // todo why are we null checking cell? seems like unneeded defensive programming
    if (cell) {
      self.server.removeNode(cell);
    }
  });

  var index = this.server.clients.indexOf(this);
  if (index != -1) {
    // todo splice is slow, can we do this better?
    this.server.clients.splice(index, 1);
  }
};
