import Shape from './Shape';

export default class Rectangle extends Shape {
  static schema(...extend) {
    return Shape.schema({
      key: 'rectangle',
      label: 'rectangle',
      type: 'rectangle'
    }, ...extend);
  }

  static design(...extend) {
    return Shape.design({
      height: 50
    }, ...extend);
  }

  get baseSchema() {
    return Rectangle.schema();
  }

  get baseDesign() {
    return Rectangle.design();
  }

  get nodes() {
    this._nodes = super.nodes;
    this._nodes.every((node, i) => {
      node.y && (this._nodes[i].y /= 2);
      return node;
    });
    return this._nodes;
  }

  getShapePath({ x: mx, y: my }, scale) {
    const { width, height } = this.design;
    const x = width * scale;
    const y = height * scale;
    return `M ${mx} ${my} l ${x} 0 l 0 ${y} l ${-x} 0 z`;
  }
}
