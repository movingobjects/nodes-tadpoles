
import config from './config';

// TODO: Look into Path2D for drawing circles (?)

export default class Bg {

  // Constructor

  constructor(canvasId) {

    this.canvas  = document.getElementById(canvasId);
    this.context = this.canvas.getContext('2d');

    this.initResize();

    this.redraw();

  }
  initResize() {

    window.addEventListener('resize', this.handleResize);
    this.updateSize();

  }


  // Event handlers

  handleResize = () => {

    this.updateSize();

  }

  // Methods

  updateSize() {

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

  redraw() {

    const c   = this.canvas,
          ctx = this.context;

    this.drawCircle(this.w / 2, this.h / 2, 50, '#f55');

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
