
// Imports

import * as _ from 'lodash';
import { maths, random, geom } from 'varyd-utils';


// Constants

const Mode = Object.freeze({
  LINKS: 'Mode.LINKS',
  TADPOLES: 'Mode.TADPOLES'
});

const PADDING             = 100,
      GRAVITY             = 25,
      FRICTION            = 0.02;

const NODE_COUNT          = 50,
      NODE_RADIUS         = 8,
      LINE_WIDTH          = 8,
      TADPOLE_VEL_MAG_MAX = 7,
      TADPOLE_RADIUS_MAX  = 11,
      TADPOLE_RADIUS_MIN  = 4,
      TADPOLE_CLEAR_INT   = 40;

const COLOR_BG            = "#fff",
      COLOR_NODE          = "#eee",
      COLOR_LINK          = "#3fd",
      COLOR_TADPOLE       = "#fff",
      TADPOLE_CLEAR_STYLE = "rgba(51, 255, 221, 0.15)";

const NODE_MAX_VEL        = 8,
      LINK_MAX_DIST_SQ    = 15000,
      TRGT_COUNT          = 4,
      TRGT_CAPTURE_DIST   = 10;


// Class

export default class Bg {

  // Constructor

  constructor(canvasId) {

    this.canvas  = document.getElementById(canvasId);
    this.context = this.canvas.getContext('2d');

    this.nodes   = [];
    this.links   = [];
    this.trgts   = [];

    this.mode    = Mode.LINKS;

    this.handleResize();

    this.start();

  }


  // Get & set

  get randomX() {
    return random.int(PADDING, this.w - PADDING);
  }
  get randomY() {
    return random.int(PADDING, this.h - PADDING);
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

    if (this.mode === Mode.LINKS) {
      this.redrawLinks();
    } else {
      this.redrawTadpoles();
    }

  }

  handleFrame = () => {

    if (this.mode === Mode.LINKS) {
      this.resetLinks();
    }

    this.updateNodes();

    if (this.mode === Mode.LINKS) {
      this.redrawLinks();
    } else {
      this.redrawTadpoles();
    }

    window.requestAnimationFrame(this.handleFrame);

  }

  handleKey = (e) => { }


  // Methods

  start() {

    window.addEventListener('keypress', this.handleKey);
    window.addEventListener('resize', this.handleResize);
    window.requestAnimationFrame(this.handleFrame);

    this.makeNodes();
    this.makeTrgts();

  }



      this.mode = Mode.TADPOLES;

  }
  makeNodes() {

    this.nodes   = _.times(NODE_COUNT, () => ({
      ...this.randomPt,
      vel: {
        x: random.num(-1, 1),
        y: random.num(-1, 1)
      }
    }));

  }
  makeTrgts() {

    this.trgts = _.times(TRGT_COUNT, () => this.randomPt);

  }

  resetLinks() {

    this.links = [];

    this.nodes.forEach((node) => {
      node.linked = false
    });

  }
  updateNodes() {

    this.nodes.forEach((node) => {

      let velX   = node.vel.x,
          velY   = node.vel.y;

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
            pullX      = (trgtNearest.x - node.x) * factorDist * GRAVITY,
            pullY      = (trgtNearest.y - node.y) * factorDist * GRAVITY;

        velX += pullX;
        velY += pullY;


        // If close, move it somewhere else

        if (Math.sqrt(distSqMin) < TRGT_CAPTURE_DIST) {
          trgtNearest.x = this.randomX;
          trgtNearest.y = this.randomY;
        }

      }

      // Find links

      if (this.mode === Mode.LINKS) {
        this.nodes.forEach((nodeB) => {
          if ((node !== nodeB) && !this.alreadyLinked(node, nodeB)) {
            if (geom.distSq(nodeB, node) < LINK_MAX_DIST_SQ) {
              this.addLink(node, nodeB);
            }
          }
        })
      }

      // Apply friction
      velX *= (1 - FRICTION);
      velY *= (1 - FRICTION);

      // Limit vel
      velX = maths.clamp(velX, -NODE_MAX_VEL, NODE_MAX_VEL);
      velY = maths.clamp(velY, -NODE_MAX_VEL, NODE_MAX_VEL);

      // Apply smoothed new velocity
      node.vel.x = maths.lerp(node.vel.x, velX, 0.5);
      node.vel.y = maths.lerp(node.vel.y, velY, 0.5);

      // Move node position

      node.x += node.vel.x;
      node.y += node.vel.y;

    });

  }

  redrawLinks() {

    const cvs = this.canvas,
          ctx = this.context;

    ctx.clearRect(0, 0, cvs.width, cvs.height);

    this.links.forEach((link) => {

      ctx.lineWidth   = LINE_WIDTH;
      ctx.strokeStyle = COLOR_LINK;

      ctx.beginPath();
      ctx.moveTo(link.nodeA.x, link.nodeA.y);
      ctx.lineTo(link.nodeB.x, link.nodeB.y);
      ctx.stroke();

    });

    this.nodes.forEach((node) => {

      ctx.fillStyle   = node.linked ? COLOR_BG : COLOR_NODE;
      ctx.strokeStyle = node.linked ? COLOR_LINK : COLOR_NODE;
      ctx.lineWidth   = node.linked ? LINE_WIDTH : 0;

      ctx.beginPath();
      ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);
      ctx.fill();

      if (node.linked) {
        ctx.stroke();
      }

    });

  }
  redrawTadpoles() {

    const cvs = this.canvas,
          ctx = this.context;

    const clearTadpoles = (Date.now() - (this.lastTadpoleClearTime || 0) > TADPOLE_CLEAR_INT);

    if (clearTadpoles) {
      this.lastTadpoleClearTime = Date.now();
      ctx.fillStyle = TADPOLE_CLEAR_STYLE;
      ctx.fillRect(0, 0, cvs.width, cvs.height);
    }

    ctx.fillStyle = COLOR_TADPOLE;

    this.nodes.forEach((node) => {

      let velMag = Math.sqrt((node.vel.x * node.vel.x) + (node.vel.y * node.vel.y)),
          radius = maths.map(velMag, 0, TADPOLE_VEL_MAG_MAX, TADPOLE_RADIUS_MAX, TADPOLE_RADIUS_MIN, true);

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fill();

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

  hasClass(elem, cls) {
    return !!elem.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
  }
  addClass(elem, cls) {
    if (!this.hasClass(elem, cls)) {
      elem.className += ' ' + cls;
    }
  }
  removeClass(elem, cls) {
    if (this.hasClass(elem, cls)) {
      var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
      elem.className = elem.className.replace(reg, ' ');
    }
  }


}
