import Stroke from './Stroke';

export default class Curve extends Stroke {
  static schema(...extend) {
    return Stroke.schema({
      points: [{
        x: 100,
        y: 100
      }],
      type: 'curve'
    }, ...extend);
  }
  
  static design(...extend) {
    return Stroke.design({
      fill: 'transparent'
    }, ...extend);
  }

  constructor(elem, schema, options) {
    super(elem, schema, options);
  }

  get baseSchema() {
    return Curve.schema();
  }

  get baseDesign() {
    return Curve.design();
  }

  getStrokePath({
    x: mx,
    y: my
  }, points, scale) {
    return `M 50 0 C 12.5 12.5, 12.5 12.5, 50 50 C 87.5 87.5, 87.5 87.5, 50 100`;
  }
}