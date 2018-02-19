
// Imports

import * as _ from 'lodash';
import { maths, random, geom } from 'varyd-utils';

import config from './config';


// TODO: Look into Path2D for drawing circles (?)

export default class Bg {

  // Constructor

  constructor(canvasId) {

    this.canvas  = document.getElementById(canvasId);
    this.context = this.canvas.getContext('2d');

    this.nodes = [];
    this.links = [];
    this.trgts = [];

    this.handleResize();

    this.start();

  }


  // Get & set

  get randomX() {
    return random.int(config.padding, this.w - config.padding);
  }
  get randomY() {
    return random.int(config.padding, this.h - config.padding);
  }
  get randomPt() {
    return {
      x: this.randomX,
      y: this.randomY
    }
  }


  // Event handlers

  handleResize = () => {

    const w = this.canvas.clientWidth,
          h = this.canvas.clientHeight;

    if (this.w  !== w) {
      this.w            = w;
      this.canvas.width = w;
    }

    if (this.h !== h) {
      this.h             = h;
      this.canvas.height = h;
    }

    this.redraw();

  }

  handleFrame = () => {

    this.resetLinks();
    this.updateNodes();
    this.redraw();

    window.requestAnimationFrame(this.handleFrame);

  }


  // Methods

  start() {

    window.addEventListener('resize', this.handleResize);
    window.requestAnimationFrame(this.handleFrame);

    this.nodes   = _.times(config.nodeCount, () => ({
      ...this.randomPt,
      vel: {
        x: random.num(-1, 1),
        y: random.num(-1, 1)
      }
    }));
    this.trgts = _.times(config.trgtCount, () => this.randomPt);

  }

  redraw() {

    const cvs = this.canvas,
          ctx = this.context;

    ctx.clearRect(0, 0, cvs.width, cvs.height);

    this.links.forEach((link) => this.drawLink(link.nodeA, link.nodeB));
    this.nodes.forEach((node) => this.drawNode(node));

  }

  resetLinks() {

    this.links = [];

    this.nodes.forEach((node) => {
      node.linked = false
    });

  }

  updateNodes() {

    this.nodes.forEach((node) => {

      let velX = node.vel.x,
          velY = node.vel.y;

      if (this.trgts.length) {

        // Find nearest trgt

        let trgtNearest = undefined,
            distSqMin   = Infinity;

        this.trgts.forEach((trgt) => {
          let distSq = geom.distSq(node, trgt);
          if (distSq < distSqMin) {
            distSqMin   = distSq;
            trgtNearest = trgt;
          }
        });


        // Pull node toward trgt

        let factorDist = 1 / Math.max(5, distSqMin),
            pullX      = (trgtNearest.x - node.x) * factorDist * config.gravity,
            pullY      = (trgtNearest.y - node.y) * factorDist * config.gravity;

        velX += pullX;
        velY += pullY;


        // If close, move it somewhere else

        if (Math.sqrt(distSqMin) < config.trgtCaptureDist) {
          trgtNearest.x = this.randomX;
          trgtNearest.y = this.randomY;
        }

      }

      // Find links

      this.nodes.forEach((nodeB) => {
        if (node !== nodeB && !this.alreadyLinked(node, nodeB)) {
          if (geom.distSq(nodeB, node) < config.linkMaxDistSq) {
            this.addLink(node, nodeB);
          }
        }
      })

      // Apply friction
      velX *= (1 - config.friction);
      velY *= (1 - config.friction);

      // Limit vel
      velX = maths.clamp(velX, -config.nodeMaxVel, config.nodeMaxVel);
      velY = maths.clamp(velY, -config.nodeMaxVel, config.nodeMaxVel);

      // Apply smoothed new velocity
      node.vel.x = maths.lerp(node.vel.x, velX, 0.5);
      node.vel.y = maths.lerp(node.vel.y, velY, 0.5);

      // Move node position
      node.x += node.vel.x;
      node.y += node.vel.y;

    });

  }

  alreadyLinked(nodeA, nodeB) {
    return !!this.links.find((link) => {
      return (link.nodeA === nodeA && link.nodeB === nodeB)
          || (link.nodeA === nodeB && link.nodeB === nodeA);
    });
  }
  addLink(nodeA, nodeB) {

    nodeA.linked = true;
    nodeB.linked = true;

    this.links.push({
      nodeA,
      nodeB
    });

  }


  // Helpers

  drawNode(node) {

    const ctx = this.context;

    ctx.fillStyle   = node.linked ? config.colorBg : config.colorNode;
    ctx.strokeStyle = node.linked ? config.colorLink : config.colorNode;
    ctx.lineWidth   = node.linked ? config.lineWidth : 0;

    ctx.beginPath();
    ctx.arc(node.x, node.y, config.nodeRadius, 0, Math.PI * 2);
    ctx.fill();

    if (node.linked) {
      ctx.stroke();
    }

  }

  drawLink(ptA, ptB) {

    const ctx = this.context;

    ctx.lineWidth   = config.lineWidth;
    ctx.strokeStyle = config.colorLink;

    ctx.beginPath();
    ctx.moveTo(ptA.x, ptA.y);
    ctx.lineTo(ptB.x, ptB.y);
    ctx.stroke();

  }


}
