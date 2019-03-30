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
    this._id = schema && schema.id ? schema.id : this.randomString('flow-connect', 'n');
    this.schema.id = this._id;
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
    const nx = position.x;
    const ny = position.y;
    const x = nx + points[0].x;
    const y = ny + points[0].y;
    const direction = this.getLineDirection(points[0]);
    switch (direction) {
      case 'up':
        arrowPath = (`M ${nx - 5} ${(ny + y) / 2} l ${5} ${-10}
                      l ${5} ${10} z`);
        break;
      case 'right':
        arrowPath = (`M ${(x + nx) / 2} ${ny - 5} l ${0} ${10}
                      l ${10} ${-5} z`);
        break;
      case 'down':
        arrowPath = (`M ${nx - 5} ${(y + ny) / 2} l ${5} ${10} 
                      l ${5} ${-10} z`);
        break;
      case 'left':
        arrowPath = (`M ${(x + nx) / 2} ${ny - 5} l ${0} ${10}
                      l ${-10} ${-5} z`);
        break;
      default:
        break;
    }
    return arrowPath;
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

  build(node) {
    if (node) {
      this.setOffsetAxis(node);
    }
    const {
      id,
      position,
      points,
      label
    } = this.schema;
    const lineHeightOff = 9.75;
    this.element = this.ge(id) || this.ce(this.getStroke(), {
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
    !this.ge(id) && this.ac(this.parent.firstChild, this.element);
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

  setOffsetAxis(node) {
    this.offsetAxis = node.x ? 'y' : 'x';
  }

  trackNewLine(axis) {
    const oppAxis = this.getOppAxis(axis);
    const initial = {};
    const bound = this.parent.getBoundingClientRect();
    initial[oppAxis] = this.schema.position[oppAxis] + bound[oppAxis];
    initial[axis] = this.schema.position[axis] + bound[axis];
    for (let index = 0; index < this.schema.points.length - 1; index++) {
      initial[oppAxis] += this.schema.points[index][oppAxis];
      initial[axis] += this.schema.points[index][axis];
    }
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
      this.trackNewLine(axis);
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
          this.trackNewLine(axis);
        }
      }
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

  alignLine(e, zoom, component) {
    const moved = this.getMovedDistance(this.getCurrentPos(e, zoom), this.initial);
    const pointsLength = this.schema.points.length;
    const sourceDirection = this.getLineDirection(this.schema.points[0]);
    const destinationDirection = this.getLineDirection(this.schema.points[pointsLength - 1]);
    const axis = this.isVertical(sourceDirection) ? 'y' : 'x';
    const oppAxis = this.getOppAxis(axis);
    const isSourceMoved = this.schema.destination !== component.schema.id;
    let mustOffsetLines = true;
    if (pointsLength === 1 && moved[oppAxis]) {
      this.schema.points = this.breakLines(this.schema.points, 3);
    } else if (pointsLength === 3 && this.schema.points[pointsLength - 2][oppAxis] === 0 &&
      sourceDirection !== this.getOppositeDirection(destinationDirection)) {
      this.schema.points = this.breakLines(this.schema.points, 1);
      mustOffsetLines = false;
    }
    if (mustOffsetLines) {
      this.validateNodeDirection(this.schema, isSourceMoved, component);
      this.moveLines(this.schema, isSourceMoved, moved);
    }
    this.setInitialPos(this.getCurrentPos(e, zoom));
    this.redraw();
  }

  moveLines(schema, isSourceMoved, moved) {
    const pointsLength = schema.points.length;
    const sourceDirection = this.getLineDirection(schema.points[0]);
    const isSameDirection = sourceDirection === this.getOppositeDirection(this.getLineDirection(schema.points[pointsLength - 1]));
    const axis = this.isVertical(sourceDirection) ? 'y' : 'x';
    const oppAxis = this.getOppAxis(axis);
    const maxIndex = Math.abs(schema.points[0][axis]) >= Math.abs(schema.points[pointsLength - 1][axis]) ? 0 : pointsLength - 1;
    const minIndex = Math.abs(schema.points[0][axis]) < Math.abs(schema.points[pointsLength - 1][axis]) ? 0 : pointsLength - 1;
    const direction = isSourceMoved ? this.getOppositeDirection(sourceDirection) : sourceDirection;
    if (isSourceMoved) {
      schema.position[axis] += moved[axis];
      schema.position[oppAxis] += moved[oppAxis];
    }
    for (let i = 0, currentAxis = axis; i < pointsLength; i++) {
      if (isSameDirection && pointsLength === 3) {
        if (i !== (isSourceMoved ? pointsLength - 1 : 0)) {
          schema.points[i][currentAxis] += (moved[currentAxis] * (isSourceMoved ? -1 : 1));
        }
      } else {
        if (pointsLength === 3 &&
          ((['right', 'down'].indexOf(direction) !== -1 && ((moved[axis] < 0 && i === minIndex) ||
              (moved[axis] > 0 && i === maxIndex))) ||
            (['left', 'up'].indexOf(direction) !== -1 && ((moved[axis] > 0 && i === minIndex) ||
              (moved[axis] < 0 && i === maxIndex))))) {
          currentAxis = this.getOppAxis(currentAxis);
          continue;
        }
        schema.points[i][currentAxis] += (moved[currentAxis] * (isSourceMoved ? -1 : 1));
      }
      currentAxis = this.getOppAxis(currentAxis);
    }
  }

  validateNodeDirection(schema, isSourceMoved, component) {
    const totalOffset = this.getSumInCoordinates(schema.points);
    const sourceDirection = this.getLineDirection(schema.points[0]);
    const isSameDirection = sourceDirection === this.getOppositeDirection(this.getLineDirection(schema.points[schema.points.length - 1]));
    const axis = this.isVertical(sourceDirection) ? 'y' : 'x';
    const oppAxis = this.getOppAxis(axis);
    let quadrant = this.getQuadrant(totalOffset);
    if (isSourceMoved) {
      quadrant = (quadrant + 2) % 4 || 4;
    }
    if (isSameDirection) {
      if (isSourceMoved) {
        totalOffset[axis] = schema.points[0][axis];
        totalOffset[oppAxis] = schema.points[0][oppAxis];
      } else {
        totalOffset[axis] = schema.points[schema.points.length - 1][axis];
        totalOffset[oppAxis] = schema.points[schema.points.length - 1][oppAxis];
      }
    }
    const isClockwiseRotation = this.getNodeRotation(schema, totalOffset, quadrant, isSourceMoved);
    if (isClockwiseRotation !== undefined) {
      this.setNewPoints(component, quadrant, isClockwiseRotation);
    }
  }

  getNodeRotation(schema, totalOffset, quadrant, isSourceMoved) {
    let isClockwiseRotation;
    const sourceDirection = this.getLineDirection(schema.points[0]);
    const axis = this.isVertical(sourceDirection) ? 'y' : 'x';
    const oppAxis = this.getOppAxis(axis);
    const isPositiveOffset = totalOffset[axis] < 20 && totalOffset[axis] > 0;
    const isNegativeOffset = totalOffset[axis] > -20 && totalOffset[axis] < 0;
    const isPositiveOppositeOffset = totalOffset[oppAxis] < 50 && totalOffset[oppAxis] > 0;
    const isNegativeOppositeOffset = totalOffset[oppAxis] > -50 && totalOffset[oppAxis] < 0;
    const isUpperQuadrant = [1, 2].indexOf(quadrant) !== -1;
    const isLeftQuadrant = [2, 3].indexOf(quadrant) !== -1;
    if (schema.points.length === 2) {
      if (((['right', 'up'].indexOf(sourceDirection) !== -1) && isNegativeOppositeOffset) ||
        ((['down', 'left'].indexOf(sourceDirection) !== -1) && isPositiveOppositeOffset)) {
        isClockwiseRotation = true;
      } else if (((['right', 'up'].indexOf(sourceDirection) !== -1) && isPositiveOppositeOffset) ||
        ((['down', 'left'].indexOf(sourceDirection) !== -1) && isNegativeOppositeOffset)) {
        isClockwiseRotation = false;
      }
    }
    if ((this.isHorizontal(sourceDirection) &&
        (((isUpperQuadrant && isPositiveOffset) || (!isUpperQuadrant && isNegativeOffset)))) ||
      (this.isVertical(sourceDirection) &&
        (((isLeftQuadrant && isNegativeOffset) || (!isLeftQuadrant && isPositiveOffset))))) {
      isClockwiseRotation = isSourceMoved ? true : false;
    } else if ((this.isHorizontal(sourceDirection) &&
        (((isUpperQuadrant && isNegativeOffset) || (!isUpperQuadrant && isPositiveOffset)))) ||
      (this.isVertical(sourceDirection) &&
        (((isLeftQuadrant && isPositiveOffset) || (!isLeftQuadrant && isNegativeOffset))))) {
      isClockwiseRotation = isSourceMoved ? false : true
    }
    return isClockwiseRotation;
  }

  breakLines(points, numberOfLines, startAxis) {
    let axis = startAxis;
    if (axis === undefined) {
      const direction = this.getLineDirection(points[0]);
      axis = this.isVertical(direction) ? 'y' : 'x';
    }
    const sumPoint = this.getSumInCoordinates(this.schema.points);
    if (numberOfLines === 1) {
      if (points.length !== 3) {
        return points;
      }
      const point = {
        x: 0,
        y: 0
      };
      for (let i = 0; i < 3; i++) {
        point[axis] += points[i][axis];
      }
      return [point];
    } else {
      const newPoints = [];
      for (let i = 0, currentAxis = axis; i < numberOfLines; i++) {
        const oppAxis = this.getOppAxis(currentAxis);
        let offset;
        if (numberOfLines === 2) {
          offset = sumPoint[currentAxis]
        } else {
          offset = currentAxis === axis ? sumPoint[currentAxis] / 2 : sumPoint[currentAxis];
        }
        newPoints.push({
          [currentAxis]: offset,
          [oppAxis]: 0
        });
        currentAxis = this.getOppAxis(currentAxis);
      }
      return newPoints;
    }
  }

  setNewPoints(component, quadrant, isClockwiseRotation) {
    const isSourceMoved = this.schema.destination !== component.schema.id;
    const sourceNode = Number(this.schema.node);
    const destinationNode = Number(this.schema.destinationNode);
    let currentNode = isSourceMoved ? sourceNode : destinationNode;
    let newNode;
    if (isClockwiseRotation) {
      newNode = currentNode + 1;
      newNode = (newNode === 4) ? 0 : newNode;
    } else {
      newNode = currentNode - 1;
      newNode = (newNode === -1) ? 3 : newNode;
    }
    this.addNodeOffset(quadrant, newNode, currentNode, component);
    const isSameDirection = (isSourceMoved && destinationNode === newNode) || (!isSourceMoved && sourceNode === newNode);
    if ((isSourceMoved && ((destinationNode % 2) === (newNode % 2))) ||
      (!isSourceMoved && ((sourceNode % 2) === (newNode % 2)))) {
      if (isSameDirection) {
        this.schema.points = this.handleSameDirectionOffset(newNode, isSourceMoved);
      } else {
        const axis = newNode % 2 ? 'x' : 'y';
        this.schema.points = this.breakLines(this.schema.points, 3, axis);
      }
    } else {
      let axis = newNode % 2 ? 'y' : 'x';
      if (isSourceMoved) {
        axis = this.getOppAxis(axis);
      }
      this.schema.points = this.breakLines(this.schema.points, 2, axis);
    }
    isSourceMoved && (this.schema.node = newNode);
    !isSourceMoved && (this.schema.destinationNode = newNode);
    component.changeNodePosition(newNode);
  }

  addNodeOffset(quadrant, newNode, currentNode, component) {
    const isSourceMoved = this.schema.destination !== component.schema.id;
    const pointsLength = this.schema.points.length
    const sourceDirection = this.getLineDirection(this.schema.points[0]);
    const destinationNode = Number(this.schema.destinationNode);
    const axis = this.isVertical(sourceDirection) ? 'y' : 'x';
    const oppAxis = this.getOppAxis(axis);
    const isUpperQuadrant = quadrant === 1 || quadrant === 2;
    const isLeftQuadrant = quadrant === 2 || quadrant === 3;
    let offset = {
      x: (component.nodes[newNode].x - component.nodes[currentNode].x),
      y: (component.nodes[newNode].y - component.nodes[currentNode].y)
    }
    if (isSourceMoved) {
      this.schema.position.x += offset.x;
      this.schema.position.y += offset.y;
      for (let i = 0, currentAxis = oppAxis; i < this.schema.points.length; i++) {
        this.schema.points[i][currentAxis] -= offset[currentAxis];
        currentAxis = this.getOppAxis(currentAxis);
      }
      if (destinationNode % 2) {
        if ((newNode % 2 === 0) && isUpperQuadrant) {
          this.schema.points[pointsLength - 1].y += component.design.height / 2;
        } else if ((newNode % 2 === 0) && !isUpperQuadrant) {
          this.schema.points[pointsLength - 1].y -= component.design.height / 2;
        }
      } else {
        if ((newNode % 2) && isLeftQuadrant) {
          this.schema.points[pointsLength - 1].x += component.design.width / 2;
        } else if ((newNode % 2) && !isLeftQuadrant) {
          this.schema.points[pointsLength - 1].x -= component.design.width / 2;
        }
      }
    } else {
      this.schema.points[pointsLength - 1].x += offset.x;
      this.schema.points[pointsLength - 1].y += offset.y;
    }
  }

  handleSameDirectionOffset(node, isSourceMoved) {
    const sumPoint = this.getSumInCoordinates(this.schema.points);
    const isVertical = node % 2 === 0;
    const isPositiveDirection = node === 1 || node === 2;
    const offset = (isPositiveDirection && isSourceMoved) || (!isPositiveDirection && !isSourceMoved) ? -50 : 50;
    let newPoints = [{
      x: !isVertical ? sumPoint.x + offset : 0,
      y: isVertical ? sumPoint.y + offset : 0
    }, {
      x: isVertical ? sumPoint.x : 0,
      y: !isVertical ? sumPoint.y : 0
    }, {
      x: !isVertical ? -offset : 0,
      y: isVertical ? -offset : 0
    }];
    if (isSourceMoved) {
      const temp = newPoints[2];
      newPoints[2] = newPoints[0];
      newPoints[0] = temp;
    }
    return newPoints;
  }

  stopMove(e, zoom) {
    this.schema.destination = e.target.parentElement.id;
    this.schema.destinationNode = e.target.dataset.index;
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


  isVertical(direction) {
    return (direction === 'top' || direction === 'bottom' ||
      direction === 'up' || direction === 'down' || direction === 'y');
  }

  isHorizontal(direction) {
    return (direction === 'left' || direction === 'right' || direction === 'x');
  }

  getLineDirection(point) {
    let direction = 0 < point.y ? 'down' : 'up';
    if (point.x) {
      direction = 0 < point.x ? 'right' : 'left';
    }
    return direction;
  }

  getOppositeDirection(direction) {
    if (direction === 'top' || direction === 'up') {
      return 'down';
    } else if (direction === 'bottom' || direction === 'down') {
      return 'up';
    } else if (direction === 'left') {
      return 'right';
    } else if (direction === 'right') {
      return 'left';
    } else {
      return null;
    }
  }

  getQuadrant(point) {
    if (point.x > 0) {
      if (point.y > 0) {
        return 4;
      } else {
        return 1;
      }
    } else {
      if (point.y > 0) {
        return 3;
      } else {
        return 2;
      }
    }
  }

  getSumInCoordinates(points) {
    const sumPoint = {
      x: 0,
      y: 0
    };
    points.forEach(point => {
      sumPoint.x += point.x;
      sumPoint.y += point.y;
    });
    return sumPoint;
  }
}
