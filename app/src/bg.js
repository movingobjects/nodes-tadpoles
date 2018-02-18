
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
    return random.int(config.env.padding, this.w - config.env.padding);
  }
  get randomY() {
    return random.int(config.env.padding, this.h - config.env.padding);
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

    this.updateNodes();
    this.redraw();

    window.requestAnimationFrame(this.handleFrame);

  }


  // Methods

  start() {

    window.addEventListener('resize', this.handleResize);
    window.requestAnimationFrame(this.handleFrame);

    this.nodes   = _.times(config.nodes.count, () => ({
      ...this.randomPt,
      vel: {
        x: random.num(-1, 1),
        y: random.num(-1, 1)
      }
    }));
    this.trgts = _.times(config.trgts.count, () => this.randomPt);

  }

  redraw() {

    const cvs = this.canvas,
          ctx = this.context;

    ctx.clearRect(0, 0, cvs.width, cvs.height);

    this.trgts.forEach((trgt, i) => {
      this.drawCircle(trgt.x, trgt.y, 4, '#f05');
    });

    this.nodes.forEach((node, i) => {
      this.drawCircle(node.x, node.y, config.nodes.radius, config.nodes.colorOff);
    });

  }

  updateNodes() {

    this.nodes.forEach((node, i) => {

      let velX = node.vel.x,
          velY = node.vel.y;

      // Find nearest trgt

      if (this.trgts.length) {

        let trgtNearest = this.trgts[0],
            distSqMin   = geom.distSq(node, trgtNearest);

        this.trgts.forEach((trgt, j) => {
          let distSq = geom.distSq(node, trgt);
          if (distSq < distSqMin) {
            distSqMin   = distSq;
            trgtNearest = trgt;
          }
        });


        // Check for eats

        let trgtDist = Math.sqrt(distSqMin),
            trgtX    = trgtNearest.x,
            trgtY    = trgtNearest.y;

        if (trgtDist < config.trgts.minDist) {
          trgtNearest.x = this.randomX;
          trgtNearest.y = this.randomY;
        }

        // Recalc vel

        let factorDist = 1 / Math.max(5, trgtDist * trgtDist),
            pullX      = (trgtX - node.x) * factorDist * config.env.gravity,
            pullY      = (trgtY - node.y) * factorDist * config.env.gravity;

        velX += pullX;
        velY += pullY;

      }

      velX = (velX * (1 - config.env.friction)) + ((node.vel.x - velX) * 0.5);
      velY = (velY * (1 - config.env.friction)) + ((node.vel.y - velY) * 0.5);

      velX = maths.clamp(velX, -config.nodes.maxVel, config.nodes.maxVel);
      velY = maths.clamp(velY, -config.nodes.maxVel, config.nodes.maxVel);

      node.vel.x = velX;
      node.vel.y = velY;

      node.x += node.vel.x;
      node.y += node.vel.y;


    });

  }


  // Helpers

  drawCircle(x, y, radius, color) {

    const ctx = this.context;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();

  }


}
