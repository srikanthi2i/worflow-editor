import './base.css';

export default class Base {
  constructor() {

  }

  randomString(prefix, an) {
    var len = 6;
    an = an && an.toLowerCase();
    var str = "",
      i = 0,
      min = an == "a" ? 10 : 0,
      max = an == "n" ? 10 : 62;
    for (; i++ < len;) {
      var r = Math.random() * (max - min) + min << 0;
      str += String.fromCharCode(r += r > 9 ? r < 36 ? 55 : 61 : 48);
    }
    return prefix + '-' + str;
  }

  ce(elemType, attributes, child = null) {
    let elem;
    if (typeof (elemType) === 'string') {
      elem = document.createElement(elemType);
    } else if (elemType instanceof HTMLElement || elemType instanceof Text || elemType instanceof SVGElement) {
      elem = elemType;
    } else {
      elem = document.createElementNS(Object.values(elemType)[0], Object.values(elemType)[1]);
    }
    for (const attr in attributes) {
      if (attr === 'on') {
        for (const addEvent in attributes[attr]) {
          elem.addEventListener(addEvent, attributes[attr][addEvent], {
            passive: false
          });
        }
      } else if (attr === 'nativeStyle') {
        for (const styleKey in attributes[attr]) {
          elem['style'][styleKey] = attributes[attr][styleKey];
        }
      } else if (attr === 'keys') {
        for (const objectKey in attributes[attr]) {
          elem[objectKey] = attributes[attr][objectKey];
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
    } else if (child instanceof HTMLElement || child instanceof Text || child instanceof SVGElement) {
      element.appendChild(child);
    }
  }
}
