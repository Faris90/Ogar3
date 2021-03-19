'use strict';
/*
Proverbs 20:18:
   Bread obtained by falsehood is sweet to a man, But afterward his mouth will be filled with gravel.

We worked really hard for this project. Although we dont care if you enhance it and publish, we would care
if you copy it and claim our work as your own. Although it might feel good, to take the credit, you would ultimatly
regret it. But please feel free to change the files and publish putting your name up as well as ours.
We will also not get into legalities. but please dont take advantage that we dont use
legalities. Instead, treat us with respect like we treat you. 

Sincerely
The AJS Dev Team.

*/
let Physics = require('./Physics.js');
module.exports = {
  getRandomColor: function () {
    var colorRGB = [0xFF, 0x07, (Math.random() * 256) >> 0];
    colorRGB.sort(function () {
      return 0.5 - Math.random();
    });

    return {
      r: colorRGB[0],
      b: colorRGB[1],
      g: colorRGB[2]
    };
  },
  getRandomPosition: function (borderRight, borderLeft, borderBottom, borderTop) {
    return {
      x: Math.floor(Math.random() * (borderRight - borderLeft)) + borderLeft,
      y: Math.floor(Math.random() * (borderBottom - borderTop)) + borderTop
    }
  },
  getDist: function (x1, y1, x2, y2) { // Use Pythagoras theorem
    let from = {'x': x1, 'y': y1 };
    let to = {'x': x2, 'y': y2};
    return Physics.getDist(from, to);
  },
  getAngleFromClientToCell: function (client, cell) {
    return Physics.getAngleFromTo(client.mouse, cell.position);
  },
  log10: function (x) {
    return Math.log(x) / Math.LN10;
  }
};
