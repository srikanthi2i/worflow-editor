import Rectangle from '../shapes/Rectangle';

export default class Action extends Rectangle {
  static schema() {
    return Rectangle.schema({
      key: 'action',
      label: 'action',
      type: 'action'
    });
  }

  static design() {
    return Rectangle.design();
  }

  get baseSchema() {
    return Action.schema();
  }

  get baseDesign() {
    return Action.design();
  }
}
