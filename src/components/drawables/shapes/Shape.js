import Drawable from '../Drawable';
import Stroke from '../strokes/Stroke';

export default class Shape extends Drawable {
  static schema(...extend) {
    return Drawable.schema({
      out: [],
      in: [],
      scale: 1,
      key: 'square',
      label: 'square',
      type: 'square'
    }, ...extend);
  }

  static design(...source) {
    return Object.assign({
      stroke: '#ababab',
      width: 100,
      height: 100,
      strokeWidth: 1,
      strokeDasharray: '2,2',
      fill: '#fff'
    }, ...source);
  }

  constructor(elem, schema, options) {
    super(elem, schema, options);
  }

  get baseSchema() {
    return Shape.schema();
  }

  get baseDesign() {
    return Shape.design();
  }

  get nodes() {
    this._nodes = [{
        x: 50,
        y: 0
      },
      {
        x: 100,
        y: 50
      },
      {
        x: 50,
        y: 100
      },
      {
        x: 0,
        y: 50
      }
    ];
    console.log('here second');
    return this._nodes;
  }

  getShapePath({
    x: mx,
    y: my
  }, scale) {
    const lx = this.design.width * scale;
    const ly = this.design.height * scale;
    return `M ${mx} ${my} l ${lx} 0 l 0 ${ly} l ${-lx} 0 z`;
  }

  getShape(scale) {
    const {
      fill,
      stroke,
      strokeWidth,
      strokeDasharray
    } = this.design;
    return this.ce(this.getSVGTag('g'), {
      class: 'drawable',
      nativeStyle: {
        position: 'absolute'
      },
      ['data-type']: this.schema.type
    }, this.ce(this.getSVGTag('path'), {
      id: 'path',
      class: 'path',
      nativeStyle: {
        strokeWidth,
        strokeDasharray,
        stroke,
        fill
      },
      d: this.getShapePath(this.schema.position, scale)
    }));
  }

  getIcon() {
    const scale = 0.5;
    const {
      width,
      height
    } = this.design;
    return this.ce(this.getSVGTag('svg'), {
      width: width * scale,
      height: height * scale
    }, this.getShape(scale));
  }

  build() {
    const {
      x: textX,
      y: textY
    } = this.getOrigin();
    const lineHeightOff = 3.25;
    const {
      id,
      position,
      label
    } = this.schema;
    this.element = this.ce(this.getShape(this.schema.scale), {
      id,
      on: {
        dblclick: this.doubleClick.bind(this),
        mouseover: this.showNodes.bind(this),
        mouseleave: this.hideNodes.bind(this)
      }
    }, this.ce(this.getSVGTag('text'), {
      x: position.x + textX,
      y: position.y + textY + lineHeightOff,
      ['text-anchor']: "middle",
      nativeStyle: {
        textTransform: 'capitalize'
      },
      keys: {
        innerHTML: label
      }
    }));
    this.ac(this.parent, this.element);
    return this.element;
  }

  setPosition({
    x,
    y
  }) {
    this.schema.position.x += x;
    this.schema.position.y += y;
  }

  setScale(scale) {
    this.schema.scale = scale;
  }

  redraw() {
    const clone = this.element.parentElement;
    this.element.remove();
    this.build();
    this.ac(clone, this.element);
  }

  getOrigin() {
    let {
      width: x,
      height: y
    } = this.design;
    x /= 2;
    y /= 2;
    return {
      x,
      y
    };
  }

  doubleClick(e) {
    this.openModal(this.parent.parentElement);
  }

  showNodes(e) {
    if (!this.tempNodes) {
      const {
        x,
        y
      } = this.schema.position;
      this.tempNodes = this.nodes.map((point, i) => {
        return this.ce(this.getSVGTag('circle'), {
          on: {
            mouseover: this.highlightNode.bind(this),
            mouseout: this.highlightNode.bind(this)
          },
          class: 'node',
          ['data-index']: i,
          cx: `${x+point.x}`,
          cy: `${y+point.y}`,
          r: "5",
          ['stroke-width']: "1",
          fill: "blue"
        });
      });
      this.ac(this.element, this.tempNodes);
    }
  }

  hideNodes(e) {
    this.tempNodes.map(node => node.remove());
    this.tempNodes = null;
  }

  highlightNode(e) {
    e.preventDefault();
    if (!this.highlighted) {
      e.target.style.r = 10;
      this.highlighted = e.target;
      return;
    }
    e.target.style.r = 5;
    this.highlighted = null;
  }

  getOffsetAxis(point) {
    if (point.x === 0 || point.x === this.design.width) {
      return 'y';
    }
    return 'x';
  }

  beginLineConnect(e) {
    this.line = new Stroke(this.parent);
    let {
      x,
      y
    } = this.schema.position;
    const node = this.nodes[e.target.dataset.index];
    this.line.offsetAxis = this.getOffsetAxis(node);
    x += node.x;
    y += node.y;
    this.line.schema.position = {
      x,
      y
    };
    this.line.schema.points = [{
      x: 0,
      y: 0
    }];
    this.line.build(true);
  }

  endLineConnect(e, component) {
    if (this.line) {
      this.line.schema.destination = component._id;
      this.schema.out.push(this.line.schema);
      this.line = null;
    } else {
      this.schema.in.push({
        source: component._id
      });
    }
  }
  
  clearLine() {
    this.line.element.remove();
    this.line = null;
  }
}