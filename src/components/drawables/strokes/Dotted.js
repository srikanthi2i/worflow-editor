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
    const lines = [];
    points.reduce((acc, {
      x,
      y
    }) => {
      lines.push(`M ${acc.x} ${acc.y} l ${x*scale} ${y*scale}`);
      return {
        x: acc.x + x*scale,
        y: acc.y + y*scale
      };
    }, {
      x: mx,
      y: my
    });
    return lines;
  }
}