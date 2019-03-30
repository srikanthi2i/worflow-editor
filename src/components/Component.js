import Base from './base/Base';

export default class Component extends Base {
  constructor() {
    super();
    this.element = null;
    this.initial = null;
  }

  getMovedDistance(pos, initial) {
    return {
      x: Math.round(pos.x - initial.x),
      y: Math.round(pos.y - initial.y)
    };
  }

  setInitialPos(pos) {
    this.initial = {
      ...pos
    };
  }

  setUpMove(pos) {
    this.element.style.cursor = 'grabbing';
    this.setInitialPos(pos);
  }

  endMove() {
    this.element.style.cursor = 'default';
    this.initial = null;
  }
}
