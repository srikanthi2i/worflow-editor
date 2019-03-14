export default class Drawables {
  static get components() {
    if (!Drawables._components) {
      Drawables._components = {};
    }
    return Drawables._components;
  }

  static get categories() {
    if (!Drawables._categories) {
      Drawables._categories = {};
    }
    return Drawables._categories;
  }

  static setComponents(category, comps) {
    Drawables.categories[category] = comps;
    Object.assign(Drawables.components, comps);
  }

  static setComponent(category, type, comp) {
    Drawables.categories[category][type] = comp;
    Drawables.components[type] = comp;
  }

  static createComponent(type, elem, schema, options) {
    let comp = null;
    if (type && Drawables.components.hasOwnProperty(type)) {
      comp = new Drawables.components[type](elem, schema, options);
    }
    return comp;
  }
}