
import config from './config';

export default class Bg {

  constructor() {
    console.log('Good job!');

    console.log(config);

  }

}

/*
var minnows = [],
    treats  = [];

var connections;


// Init

setupConnections();
setupMinnows();
setupTreats();


// Loop

function onFrame(event) {
  updateMinnows();
  updateTreats();
  updateConnections();
}


// Connections

function setupConnections() {
  connections  = new Group();
}

function updateConnections() {
  if (connections.hasChildren) {
    connections.removeChildren();
  }

  if (config.connections.enabled) {
    for (var i = 0; i < config.minnows.count; i++) {
      var minnow1    = minnows[i];
      var pt1      = minnow1.pts[0];
      var minDistSq  = view.size.width * view.size.height;
      for (var j = 0; j < config.minnows.count; j++) {
        if (i != j) {
          var minnow2  = minnows[j];
          var pt2    = minnow2.pts[0];
          var distSq   = pt1.getDistance(pt2, true);
          if (distSq < config.connections.maxDistSq) {
            if (!minnow2.glowing) {
              minnow2.glow();
            }
            if (distSq < minDistSq) {
              minDistSq = distSq;
            }
            connections.addChild(new Path({
              segments: [ pt1, pt2 ],
              strokeWidth: config.connections.strokeW,
              strokeColor: config.connections.color
            }))
          }
        }
      }
      if (minDistSq > config.connections.maxDistSq) {
        if (minnow1.glowing) {
          minnow1.unglow();
        }
      }
    }
  }
}


// Minnows

function Minnow(size, pos) {
  var that      = this;
  this.size      = size;
  this.pts      = [ pos ];
  this.vel      = new Point(0, 0);
  this.glowing    = false;
  this.glowTimeout  = null;
  this.shape      = new Shape.Circle({
    center: pos,
    radius: lerp(config.minnows.minRadius, config.minnows.maxRadius, size),
    strokeWidth: config.minnows.strokeW,
    strokeColor: config.minnows.strokeColor,
    fillColor: config.minnows.fillColor
  })
  this.glow      = function() {
    if (!that.glowing) {
      that.glowing      = true;
      that.shape.bringToFront();
      that.shape.strokeColor  = config.minnows.glowStrokeColor;
      that.shape.fillColor  = config.minnows.glowFillColor;
      if (!config.connections.enabled) {
        clearTimeout(that.glowTimeout);
        that.glowTimeout  = setTimeout(that.unglow, config.minnows.glowSecs * 1000)
      }
    }
  }
  this.unglow      = function() {
    if (that.glowing) {
      that.glowing      = false;
      that.shape.strokeColor  = config.minnows.strokeColor;
      that.shape.fillColor  = config.minnows.fillColor;
    }
  }
}

function setupMinnows() {
  for (var i = 0; i < config.minnows.count; i++) {
    spawnMinnow();
  }
}

function spawnMinnow() {
  var size    = Math.random();
  var pos      = Point.random() * view.size;
  var minnow    = new Minnow(size, pos);
  minnows.push(minnow);
}

function updateMinnows() {

  for (var i = 0; i < config.minnows.count; i++) {

    var minnow    = minnows[i];
    var pt      = minnow.shape.position;
    var vel      = minnow.vel;

    // Find nearest treat


    if (config.treats.count) {

      var nearTreat    = treats[0];
      var minDistSqr    = pt.getDistance(treats[0].position, true);

      for (var j = 0; j < config.treats.count; j++) {
        var distSqr    = pt.getDistance(treats[j].position, true);
        if (distSqr < minDistSqr) {
          nearTreat  = treats[j];
          minDistSqr   = distSqr;
        }
      }

      var treatPos    = nearTreat.position;
      var treatDistX    = treatPos.x - pt.x;
      var treatDistY    = treatPos.y - pt.y;
      var treatDist    = Math.sqrt((treatDistX * treatDistX) + (treatDistY * treatDistY));


      // Check for eating


      if (treatDist < minnow.size + config.treats.eatDist) {
        eat(nearTreat);
        if (!config.connections.enabled) {
          minnow.glow();
        }
      }


      // Calculate velocity


      var massFactor    = config.env.gravity * minnow.size;
      var distFactor    = 1 / (Math.max(2, treatDist) * treatDist);
      var gravX      = treatDistX * massFactor * distFactor;
      var gravY      = treatDistY * massFactor * distFactor;
      var gravVel      = new Point(gravX, gravY);

    }

    vel        = vel + gravVel;
    vel        = vel * (1 - config.env.friction) + ((minnow.vel - vel) * .5);
    vel.x      = Math.max(Math.min(vel.x, config.minnows.maxVel), -config.minnows.maxVel);
    vel.y      = Math.max(Math.min(vel.y, config.minnows.maxVel), -config.minnows.maxVel);

    minnow.vel    = vel;
    minnow.pts.unshift(pt + vel);

    while (minnow.pts.length > config.minnows.tailLength) {
      minnow.pts.pop();
    }

    minnow.shape.position  = minnow.pts[0];

  }

}


// Treats

function setupTreats() {
  for (var i = 0; i < config.treats.count; i++) {
    spawnTreat();
  }
}

function spawnTreat() {
  var treat  = new Shape.Circle({
    center: Point.random() * (view.size * 7/10) + (view.size * 3/20),
    radius: config.treats.radius,
    fillColor: config.treats.color
  });
  treats.push(treat);
}

function updateTreats() { }

function eat(treat) {
  var index  = treats.indexOf(treat);
  if (index != -1) {
    treats.splice(index, 1);
    treat.remove();
    spawnTreat();
  }
}


// Maths

function norm(num, lo, hi) {
  return (num - lo) / (hi - lo);
}

function map(num, lo, hi, tLo, tHi) {
  return ((tHi - tLo) * (num - lo) / (hi - lo)) + tLo;
}

function lerp(num1, num2, amt) {
  return ((num2 - num1) * amt) + num1;
}

function randomInt(min, max) {
  return Math.floor((Math.random() * ((max + 1) - min)) + min);
}

function randomNum(min, max) {
  return Math.random() * (max - min) + min;
}

function maybe() {
  return Math.random() > 0.5;
}

function randomItem(array) {
  return array[randomInt(0, array.length - 1)];
}
*/
