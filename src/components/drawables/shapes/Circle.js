import Shape from './Shape';

export default class Circle extends Shape {
  static schema(...extend) {
    return Shape.schema({
      key: 'circle',
      label: 'circle',
      type: 'circle'
    }, ...extend);
  }

  static design(...extend) {
    return Shape.design(...extend);
  }

  constructor(elem, schema, options) {
    super(elem, schema, options);
  }

  get baseSchema() {
    return Circle.schema();
  }

  get baseDesign() {
    return Circle.design();
  }

  getShapePath({ x: mx, y: my }, scale) {
    const { width, height } = this.design;
    const x = width*scale/2;
    const y = height*scale/2;
    const r = x-1;
    return `M ${mx+x} ${my+y} m ${-r} -1 a ${r} ${r} 0 1 0 ${r*2} 0 a ${r} ${r} 0 1 0 ${-r*2} 0`;
  }
}