
// Imports

import * as _ from 'lodash';
import { maths, random } from 'varyd-utils';

import config from './config';


// TODO: Look into Path2D for drawing circles (?)

export default class Bg {

  // Constructor

  constructor(canvasId) {

    this.canvas  = document.getElementById(canvasId);
    this.context = this.canvas.getContext('2d');

    this.nodes   = [];
    this.links   = [];
    this.targets = [];

    this.handleResize();

    this.start();

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

    this.redraw();

    window.requestAnimationFrame(this.handleFrame);

  }


  // Methods

  start() {

    window.addEventListener('resize', this.handleResize);
    window.requestAnimationFrame(this.handleFrame);

    this.nodes   = _.times(config.nodes.count, () => ({
      x: random.int(0, this.w),
      y: random.int(0, this.h)
    }));

  }

  redraw() {

    const cvs = this.canvas,
          ctx = this.context;

    ctx.clearRect(0, 0, cvs.width, cvs.height);

    this.nodes.forEach((node, i) => {
      this.drawCircle(node.x, node.y, config.nodes.radius, config.nodes.colorOff);
    });

  }


  // Helpers

  drawCircle(x, y, radius, color) {

    const ctx = this.context;
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(x, y, radius, radius, 0, Math.PI * 2, 0);
          ctx.fill();

  }

}
