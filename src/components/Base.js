export default class Base {
  constructor() {

  }

  ce(elemType, attributes, child = null) {
    let elem;
    if (typeof (elemType) === 'string') {
      elem = document.createElement(elemType);
    } else if (elemType instanceof HTMLElement || elemType instanceof Text) {
      elem = elemType;
    } else {
      elem = document.createElementNS(Object.values(elemType)[0], Object.values(elemType)[1]);
    }
    for (const attr in attributes) {
      if (attr === 'on') {
        for (const addEvent in attributes[attr]) {
          elem.addEventListener(addEvent, attributes[attr][addEvent], false);
        }
      } else {
        elem.setAttribute(attr, attributes[attr])
      }
    }
    this.ac(elem, child);
    return elem;
  }

  ac(element, child) {
    if (Array.isArray(child)) {
      child.forEach((oneChild) => this.ac(element, oneChild));
    } else if (child instanceof HTMLElement || child instanceof Text) {
      element.appendChild(child);
    }
  }
}