import Shape from './Shape';

export default class Rhombus extends Shape {
  static schema(...extend) {
    return Shape.schema({
      key: 'rhombus',
      label: 'rhombus',
      type: 'rhombus'
    }, ...extend);
  }

  static design(...extend) {
    return Shape.design(...extend);
  }

  get baseSchema() {
    return Rhombus.schema();
  }

  get baseDesign() {
    return Rhombus.design();
  }

  getShapePath({ x: mx, y: my }, scale) {
    const { width, height } = this.design;
    const x = width * scale / 2;
    const y = height * scale / 2;
    return `M ${mx} ${y + my} l ${x} ${-y} l ${x} ${y} l ${-x} ${y} z`;
  }
}
