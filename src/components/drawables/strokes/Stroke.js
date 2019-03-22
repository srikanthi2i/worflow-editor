import Drawable from '../Drawable';

export default class Stroke extends Drawable {
  static schema(...extend) {
    return Drawable.schema({
      points: [{
        x: 100,
        y: 100
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
    this.offsetAxis;
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
      lines.push(`M ${acc.x} ${acc.y} l ${x*scale} ${y*scale}`);
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
    lines.forEach(line => {
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
        nativeStyle: {
          stroke: 'transparent',
          strokeWidth: 10
        }
      })
      linePaths.push(path, pseudoPath);
    });
    return this.ce(this.getSVGTag('g'), {
      class: 'drawable',
      nativeStyle: {
        position: 'absolute'
      },
      ['data-type']: this.schema.type
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
    let x = position.x;
    let y = position.y;
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
        arrowPath = (`M ${x} ${2.5 + ny} L ${x + 7.5 } ${6.25 + ny}
                      L ${x} ${ny + 10} z`);
        break;
      case 'down':
        arrowPath = (`M ${2.5 + nx} ${y } L ${6.25 + nx} ${y  + 7.5} 
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
      } else {
        return 'up';
      }
    } else if (start.y === end.y) {
      if (start.x < end.x) {
        return 'right';
      } else {
        return 'left';
      }
    } else {
      return null;
    }
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
    }, this.getStroke(scale));
  }

  build(isShapeConnect = false) {
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
      ['text-anchor']: "middle",
      nativeStyle: {
        textTransform: 'capitalize'
      },
      keys: {
        innerHTML: label
      }
    }));
    if (isShapeConnect) {
      const parent = this.parent.getElementsByClassName('connect-lines')[0];
      this.ac(parent, this.element);
    } else {
      this.ac(this.parent, this.element);
    }
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
      let newPoint = {
        x: 0,
        y: 0
      };
      this.schema.points[currIndex][axis] = 0;
      this.schema.points.push(newPoint);
      this.trackNewLine(axis, e, zoom, point);
      currIndex++;
      this.pushed++;
      return;
    } else {
      if (Math.abs(point[oppAxis]) > 30 || !currIndex) {
        this.schema.points[currIndex][oppAxis] = point[oppAxis];
      } else {
        if (this.pushed && currIndex) {
          this.schema.points.pop();
          currIndex--;
          this.pushed--;
          this.trackNewLine(axis, e, zoom, this.schema.points[currIndex]);
        }
      }
    }
  }

  redraw(animate) {
    const clone = this.element.parentElement;
    this.element.remove();
    if (animate) {
      this.design.strokeDasharray = '5,5';
    } else {
      this.design.strokeDasharray = 'none';
    }
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

  startMove(e, zoom) {
    const current = this.getCurrentPos(e, zoom);
    this.setInitialPos(current);
  }

  trackMove(e, zoom) {
    const current = this.getCurrentPos(e, zoom);
    this.setPoints(this.getMovedDistance(current, this.initial), e, zoom);
    this.redraw(true);
  }

  stopMove(e, zoom) {
    super.stopMove(e);
    this.redraw();
  }
}