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
    return points.reduce((acc, {
      x,
      y
    }) => {
      return `${acc} l ${x*scale} ${y*scale}`;
    }, `M ${mx} ${my}`);
  }

  getStroke(scale = 1) {
    const {
      stroke,
      strokeWidth,
      strokeDasharray,
      fill
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
        stroke,
        strokeDasharray,
        fill
      },
      d: this.getStrokePath(this.schema.position, this.schema.points, scale)
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
    this.setPoints(this.getMovedDistance(current, this.initial), e,zoom);
    this.redraw(true);
  }

  stopMove(e, zoom) {
    super.stopMove(e);
    this.redraw();
  }
}