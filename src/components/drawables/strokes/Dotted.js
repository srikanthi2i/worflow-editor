import Stroke from './Stroke';

export default class Dotted extends Stroke {
  static schema(...extend) {
    return Stroke.schema({
      points: [{
        x: 100,
        y: 100,
      }],
      type: 'dotted'
    }, ...extend);
  }
  
  static design(...extend) {
    return Stroke.design({
      strokeDasharray: '5,5'
    }, ...extend);
  }

  constructor(elem, schema, options) {
    super(elem, schema, options);
  }

  get baseSchema() {
    return Dotted.schema();
  }

  get baseDesign() {
    return Dotted.design();
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
}