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

// This is our shared data type. It contains all of the data about the state of the would that needs to be shared
// among our processes.
const Cell = require('../entity/Cell.js');
const SortedMap = require("collections/fast-map");

'use strict';
module.exports = class WorldModel {
  constructor(borderRight, borderLeft, borderBottom, borderTop) {
    this.borderRight = borderRight;
    this.borderLeft = borderLeft;
    this.borderBottom = borderBottom;
    this.borderTop = borderTop;
   
    this.lastNodeId = 2;    // todo why 2?
    this.nodes = new SortedMap();
    
    this.quadMap = {
      1: [],
      2: [],
      3: [],
      4: [],
    };
   
    this.movingNodes = new SortedMap();
    this.playerNodes = SortedMap();
    this.virusNodes = SortedMap();
    this.rainbowNodes = SortedMap();
    this.ejectedNodes = new SortedMap();
  }

  setNode(id, node, type) {
    this.nodes.set(id, node);
    switch (type) {
      case "player":
        this.playerNodes.set(id, node);
        break;
      case "moving":
        this.setNodeAsMoving(id, node);
        break;
      case "virus":
        this.setNodeAsVirus(id,node);
        break;
      case "ejected":
        this.setNodeAsEjected(id,node);
        break;
      case "rainbow":
        this.setNodeAsRainbow(id,node);
        break;
    }
  }

  addNode(node, type) {
    let id = this.getNewNodeId();
    this.setNode(id, node, type);
    this.setAsNode(id, node);
    return id;
  }

  getNode(id) {
    return this.nodes.get(id);
  }

  getNodes(type) {
    let nodes = undefined;
    switch (type) {
      case 'node':
        nodes = this.nodes;
        break;
      case 'moving':
        nodes = this.movingNodes;
        break;
      case 'player':
        nodes = this.playerNodes;
        break;
      case 'virus':
        nodes = this.virusNodes;
        break;
      case 'ejected':
        nodes = this.ejectedNodes;
        break;
      case 'rainbow':
        nodes = this.rainbowNodes;
        break;
      default:
        nodes = this.nodes;
    }
    return nodes;
  }

  getNearestNodeToNode(node, type, radius) {
    let nodes = this.getNodes(type);

    // More like getNearbyVirus
    let foundNode = undefined;
    let r = (radius) ? radius : 100; // Checking radius

    let topY = node.position.y - r;
    let bottomY = node.position.y + r;

    let leftX = node.position.x - r;
    let rightX = node.position.x + r;

    // Loop through all nodes on the map. There is probably a more efficient way of doing this
    nodes.some((check)=> {
      //if (typeof check === 'undefined') return false;
      if (!check || !check.collisionCheck(bottomY, topY, rightX, leftX)) return false;

      // Add to list of cells nearby
      foundNode = check;
      return true; // stop checking when a virus found
    });
    return foundNode;

  }
clearAll() {
   this.nodes.clear();
    this.movingNodes.clear();
    this.playerNodes.clear();
    this.ejectedNodes.clear();
    this.rainbowNodes.clear();
    this.virusNodes.clear();
    this.clearQuadMap()
    this.lastNodeId = 2;
}
  removeNode(id) {
    this.nodes.delete(id);
    this.movingNodes.delete(id);
    this.rainbowNodes.delete(id);
    this.playerNodes.delete(id);
    this.ejectedNodes.delete(id);
    this.virusNodes.delete(id);
  }

  removeMovingNode(id) {
    this.movingNodes.delete(id);
  }

  getNewNodeId() {
    // Resets integer
    if (this.lastNodeId > 2147483647) {
      this.lastNodeId = 1;
    }
    return this.lastNodeId++;
  }

  getNextNodeId() {
    return this.getNewNodeId();
  }
setAsNode(id, node) {
  this.nodes.set(id, node)
}
 clearEjected() {
   this.ejectedNodes.clear();
 }
 clearMoving() {
   this.movingNodes.clear();
 }
 clearVirus() {
   this.virusNodes.clear();
   
 }
getQuadMap(quad) {
  return this.quadMap[quad];
}
 clearQuadMap() {
   this.quadMap = {
      1: [],
      2: [],
      3: [],
      4: [],
    };
 }
 setQuadMap(quad, id) {
   this.quadMap[quad][id] = id;
 }
 removeQuadMap(quad, ind) {
   try {
     if (quad) {
          
   this.quadMap[quad].splice(ind,1);
     } else {
       
       this.quadMap[1].splice(ind,1);
      
       this.quadMap[2].splice(ind,1);
     
       this.quadMap[3].splice(ind,1);
     
       this.quadMap[4].splice(ind,1);
     }
   } catch (e) {
     console.log("[Quadmap] " + e);
   }
 }
 
 clearPlayer() {
   this.playerNodes.clear();
 }
  setNodeAsMoving(id, node) {
    this.movingNodes.set(id, node);
  }
  setNodeAsEjected(id, node) {
    this.ejectedNodes.set(id,node);
    
  }
  setNodeAsRainbow(id,node) {
    this.rainbowNodes.set(id,node);
  }
  setNodeAsVirus(id, node) {
    this.virusNodes.set(id, node);
  }

  removeEjectedNode(id) {
    this.ejectedNodes.delete(id);
  }
  removePlayerNode(id) {
    this.playerNodes.delete(id);
  }
  removeVirusNode(id) {
    this.virusNodes.delete(id);
  }

  getMovingNodes() {
    return this.movingNodes;
  }

  getPlayerNodes() {
    return this.playerNodes;
  }

  getRandomPosition() {
    return {
      x: Math.floor(Math.random() * (this.borderRight - this.borderLeft)) + this.borderLeft,
      y: Math.floor(Math.random() * (this.borderBottom - this.borderTop)) + this.borderTop
    }
  }


};
