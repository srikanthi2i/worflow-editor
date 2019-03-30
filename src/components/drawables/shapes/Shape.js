import Drawable from '../Drawable';
import {
  Drawables
} from '..';
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
    this.components = [];
  }

  get baseSchema() {
    return Shape.schema();
  }

  get baseDesign() {
    return Shape.design();
  }

  get nodes() {
    //note: Node should start from the first quad
    this._nodes = [
      {
        x: 0,
        y: -50
      },
      {
        x: 50,
        y: 0
      },
      {
        x: 0,
        y: 50
      },
      {
        x: -50,
        y: 0
      }
    ];
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
      'data-type': this.schema.type
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

  menuOptions(cb, key, id) {
    const editMenu = (this.ce('li', {
      on: {
        click: this.doubleClick.bind(this)
      },
      keys: {
        innerHTML: 'Edit'
      }
    }));
    if (key === 'component') {
      return [editMenu, super.menuOptions(cb, key, id)];
    }
    return [super.menuOptions(cb, key, id)];
  }

  build(modal) {
    const {
      x: textX,
      y: textY
    } = this.getOrigin();
    const lineHeightOff = 9.75;
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
    }, this.ce(this.getSVGTag('foreignObject'), {
      x: position.x,
      y: position.y + textY - lineHeightOff,
      width: this.design.width,
      height: 20,
      nativeStyle: {
        textTransform: 'capitalize'
      },
      class: 'ellipsis',

    }, [
      this.ce('span', {
        keys: {
          innerHTML: label,
          title: label

        }
      })
    ]));
    this.schema.out.length && this.schema.out.forEach((lineSchema) => {
      Drawables.createComponent('stroke', this.parent, lineSchema).build();
    });
    modal && this.openModal(modal.parentElement, this.modalOptions);
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
    return { x, y };
  }

  doubleClick(e) {
    this.openModal(this.parent.parentElement.parentElement, this.modalOptions);
  }

  showNodes(e) {
    if (!this.tempNodes) {
      const {
        x,
        y
      } = this.schema.position;
      this.tempNodes = this.nodes.map((point, i) => this.ce(this.getSVGTag('circle'), {
        on: {
          mouseover: this.highlightNode.bind(this),
          mouseout: this.highlightNode.bind(this)
        },
        class: 'node',
        'data-index': i,
        cx: `${x + this.design.width/2 + point.x}`,
        cy: `${y + this.design.height/2 + point.y}`,
        r: '5',
        'stroke-width': '1',
        fill: 'blue'
      }));
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

  startMove(e, zoom, component) {
    if (e.target.classList.contains('node')) {
      this.parent.style.cursor = 'crosshair';
      const nodeIndex = e.target.dataset.index;
      const node = this.nodes[nodeIndex];
      const schema = {
        position: {
          x: this.schema.position.x + node.x + this.design.width / 2,
          y: this.schema.position.y + node.y + this.design.height / 2
        },
        node: nodeIndex
      }
      this.line = this.beginLineConnect(schema);
      this.line.startMove(e, zoom);
    } else {
      super.startMove(e, zoom);
      this.schema.out.forEach(line => {
        const lineElement = this.beginLineConnect(line);
        lineElement.startMove(e, zoom);
        if ((component && (component._id === line.destination)) || !component) {
          this.components.push(lineElement);
        }
      });
    }
  }

  trackMove(e, zoom, component) {
    if (this.line) {
      this.line.trackMove(e, zoom);
    } else {
      if (component) {
        component.trackMove(e, zoom);
      } else {
        super.trackMove(e, zoom);
      }
      this.moveOutLines(e, zoom, component);
    }
  }

  stopMove(e, zoom, component) {
    if (this.line) {
      this.parent.style.cursor = '';
      this.line.stopMove(e, zoom);
      this.endLineConnect(e);
    } else {
      if (!component) {
        super.stopMove(e, zoom);
      }
      this.components.forEach(line => {
        if ((component && (component._id === line.schema.destination)) || !component) {
          this.schema.out.forEach((outLine, index) => {
            if (outLine.id === line.schema.id) {
              this.schema.out.splice(index, 1, line.schema)
            }
          });
        }
      });
      this.components = [];
    }
  }

  getOffsetAxis(point) {
    if (point.x === 0 || point.x === this.design.width) {
      return 'y';
    }
    return 'x';
  }

  beginLineConnect(schema) {
    const node = this.nodes[schema.node];
    const line = Drawables.createComponent('stroke', this.parent, schema);
    line.build(node);
    return line;
  }

  endLineConnect(e) {
    if (e.target.classList.contains('node')) {
      this.schema.out.push(this.line.schema);
    } else {
      this.line.element.remove();
    }
  }

  moveOutLines(e, zoom, component = this) {
    this.components.forEach(lineElement => {
      lineElement.alignLine(e, zoom, component);
    });
  }

  changeNodePosition(nodeIndex) {
    this.schema.nodeIndex = nodeIndex;
  }
}
