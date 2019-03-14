import Base from './base/Base';

export default class Component extends Base {
  constructor() {
    super();
    this.element = null;
    this.initial = {};
  }

  getMovedDistance(e, initial) {
    return {
      x: Math.round(e.x - initial.x),
      y: Math.round(e.y - initial.y)
    };
  }

  setInitialPos(e, zoom = 1) {
    this.initial = {
      x: e.x * zoom,
      y: e.y * zoom
    };
  }

  startMove(e, zoom) {
    this.element.style.cursor = 'grabbing';
    this.setInitialPos(e, zoom);
  }

  stopMove(e, zoom) {
    this.element.style.cursor = 'default';
    this.initial = {};
  }
}