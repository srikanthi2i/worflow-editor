import Drawable from '../Drawable';

export default class Stroke extends Drawable {
  static schema(...extend) {
    return Drawable.schema({
      points: [{
        x: 0,
        y: 0
      }],
      label: '',
      type: 'stroke'
    }, ...extend);
  }

  static design(...source) {
    return Object.assign({
      stroke: '#000',
      width: 100,
      height: 100,
      strokeWidth: 1,
      strokeDasharray: '',
      fill: 'none'
    }, ...source);
  }

  constructor(elem, schema, options) {
    super(elem, schema, options);
    this.offsetAxis = '';
    this.pushed = 0;
  }

  get baseSchema() {
    return Stroke.schema();
  }

  get baseDesign() {
    return Stroke.design();
  }

  getStrokePath({
    x: mx,
    y: my
  }, points, scale) {
    const lines = [];
    points.reduce((acc, {
      x,
      y
    }) => {
      lines.push(`M ${acc.x} ${acc.y} l ${x * scale} ${y * scale}`);
      return {
        x: acc.x + x * scale,
        y: acc.y + y * scale
      };
    }, {
      x: mx,
      y: my
    });
    return lines;
  }

  getStroke(scale = 1) {
    const {
      stroke,
      strokeWidth,
      strokeDasharray,
      fill
    } = this.design;
    const linePaths = [];
    const lines = this.getStrokePath(this.schema.position, this.schema.points, scale);
    lines.forEach((line) => {
      const path = this.ce(this.getSVGTag('path'), {
        class: 'path',
        nativeStyle: {
          strokeWidth,
          stroke,
          strokeDasharray,
          fill
        },
        d: line
      });
      const pseudoPath = path.cloneNode(true);
      this.ce(pseudoPath, {
        on: {
          mouseover: this.hover.bind(this)
        },
        nativeStyle: {
          stroke: 'transparent',
          strokeWidth: 10
        }
      });
      linePaths.push(path, pseudoPath);
    });
    return this.ce(this.getSVGTag('g'), {
      class: 'drawable',
      nativeStyle: {
        position: 'absolute'
      },
      'data-type': this.schema.type
    }, [...linePaths, this.ce(this.getSVGTag('path'), {
      id: 'arrow',
      nativeStyle: {
        strokeWidth: 1,
        opacity: 1,
        stroke: 'black'
      },
      d: this.getArrowPath(this.schema.position, this.schema.points),
    })]);
  }

  getArrowPath(position, points) {
    let arrowPath = '';
    const currIndex = points.length - 1;
    let { x, y } = position;
    for (let index = 0; index <= currIndex; index++) {
      x += points[index].x;
      y += points[index].y;
    }
    let nx = x - points[currIndex].x;
    let ny = y - points[currIndex].y;
    const direction = this.getLineDirection({
      x: nx,
      y: ny
    }, {
      x,
      y
    });
    if (direction === 'up' || direction === 'down') {
      nx -= 6;
    } else {
      ny -= 6;
    }
    switch (direction) {
      case 'up':
        arrowPath = (`M ${2.5 + nx} ${y} L ${nx + 6.25} ${y - 7.5} 
                      L ${nx + 10} ${y} z`);
        break;
      case 'right':
        arrowPath = (`M ${x} ${2.5 + ny} L ${x + 7.5} ${6.25 + ny}
                      L ${x} ${ny + 10} z`);
        break;
      case 'down':
        arrowPath = (`M ${2.5 + nx} ${y} L ${6.25 + nx} ${y + 7.5} 
                      L ${10 + nx} ${y} z`);
        break;
      case 'left':
        arrowPath = (`M ${x} ${2.5 + ny} L ${x - 7.5} ${6.25 + ny}
                      L ${x} ${10 + ny} z`);
        break;
      default:
        break;
    }
    return arrowPath;
  }


  getLineDirection(start, end) {
    if (start.x === end.x) {
      if (start.y < end.y) {
        return 'down';
      }
      return 'up';
    } if (start.y === end.y) {
      if (start.x < end.x) {
        return 'right';
      }
      return 'left';
    }
    return null;
  }

  getIcon() {
    const scale = 0.5;
    const {
      width,
      height
    } = this.design;
    this.schema.points = [{ x: 0, y: 0 }];
    return this.ce(this.getSVGTag('svg'), {
      width: width * scale,
      height: height * scale
    }, this.getStroke(scale));
  }

  build(node, offsetAxis) {
    if (node) {
      this.setPosition(node);
      this.offsetAxis = offsetAxis;
    }
    const {
      id,
      position,
      points,
      label
    } = this.schema;
    const lineHeightOff = 9.75;
    this.element = this.ce(this.getStroke(), {
      id,
      on: {
        dblclick: this.doubleClick.bind(this),
        mouseover: this.showNodes.bind(this),
        mouseout: this.hideNodes.bind(this)
      }
    }, this.ce(this.getSVGTag('text'), {
      x: position.x + points[0].x / 2,
      y: position.y + points[0].y / 2 - lineHeightOff,
      'text-anchor': 'middle',
      nativeStyle: {
        textTransform: 'capitalize'
      },
      keys: {
        innerHTML: label
      }
    }));
    // const parent = this.parent.getElementsByClassName('connect-lines')[0];
    this.ac(this.parent.firstChild, this.element);
    return this.element;
  }

  setPosition({
    x,
    y
  }) {
    this.schema.position.x += x;
    this.schema.position.y += y;
  }

  getOppAxis(axis) {
    return (axis === 'x') ? 'y' : 'x';
  }

  changeOffsetAxis(axis) {
    this.offsetAxis = this.getOppAxis(axis);
  }

  trackNewLine(axis, e, zoom, point) {
    const initial = this.getCurrentPos(e, zoom);
    initial[axis] -= point[axis];
    this.setInitialPos(initial);
    this.changeOffsetAxis(axis);
  }

  setPoints(point, e, zoom) {
    let currIndex = this.schema.points.length - 1;
    const axis = this.offsetAxis;
    const oppAxis = this.getOppAxis(axis);
    if (currIndex < 2 && Math.abs(point[axis]) > 30) {
      const newPoint = {
        x: 0,
        y: 0
      };
      this.schema.points[currIndex][axis] = 0;
      this.schema.points.push(newPoint);
      this.trackNewLine(axis, e, zoom, point);
      currIndex++;
      this.pushed++;
      return;
    }
    if (Math.abs(point[oppAxis]) > 30 || !currIndex) {
      this.schema.points[currIndex][oppAxis] = point[oppAxis];
    } else if (this.pushed && currIndex) {
      this.schema.points.pop();
      currIndex--;
      this.pushed--;
      this.trackNewLine(axis, e, zoom, this.schema.points[currIndex]);
    }
  }

  redraw() {
    const clone = this.element.parentElement;
    this.element.remove();
    this.build();
    this.ac(clone, this.element);
  }

  doubleClick(e) {
    // Todo:::
  }

  showNodes(e) {
    // Todo:::
  }

  hideNodes(e) {
    // Todo:::
  }

  trackMove(e, zoom) {
    const moved = this.getMovedDistance(this.getCurrentPos(e, zoom), this.initial);
    this.setPoints(moved, e, zoom);
    this.redraw();
  }

  stopMove(e, zoom) {
    this.schema.destination = e.target.parentElement.id;
    this.redraw();
    this.endMove();
  }

  completeConnect(target, nodeIndex) {
    const {
      x,
      y
    } = target.schema.position;
    const {
      x: offX,
      y: offY
    } = target.nodes[nodeIndex];
    const { points } = this.schema;
    const lastIndex = points.length - 1;
    const lastPoint = {
      ...points[lastIndex]
    };
    const {
      x: mx,
      y: my
    } = this.getLineEndPoint();
    // mx = mx - x + offX;
    // my = my - y + offY;
    let direction = lastPoint.y > 0 ? 'down' : 'up';
    if (lastPoint.x) {
      direction = lastPoint.x > 0 ? 'right' : 'left';
    }
  }

  getLineEndPoint() {
    return this.schema.points.reduce((acc, point) => {
      acc.x += point.x;
      acc.y += point.y;
      return acc;
    }, {
      ...this.schema.position
    });
  }

  hover(e) {
    e.target.style.cursor = 'pointer';
  }
}
