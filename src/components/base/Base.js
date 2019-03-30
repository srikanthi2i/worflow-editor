import './base.css';

export default class Base {
  randomString(prefix, charType) {
    const len = 6;
    const an = charType && charType.toLowerCase();
    let str = '';
    let i = 0;
    const min = an === 'a' ? 10 : 0;
    const max = an === 'n' ? 10 : 62;
    for (; i++ < len;) {
      // eslint-disable-next-line no-bitwise
      let r = Math.random() * (max - min) + min << 0;
      // eslint-disable-next-line no-nested-ternary
      str += String.fromCharCode(r += r > 9 ? r < 36 ? 55 : 61 : 48);
    }
    return `${prefix}-${str}`;
  }

  getSVGTag(tag) {
    return {
      namespace: 'http://www.w3.org/2000/svg',
      tag
    };
  }

  ce(elemType, attributes, child = null) {
    let elem;
    if (typeof (elemType) === 'string') {
      elem = document.createElement(elemType);
    } else if (elemType instanceof HTMLElement
      || elemType instanceof Text
      || elemType instanceof SVGElement) {
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
          elem.style[styleKey] = attributes[attr][styleKey];
        }
      } else if (attr === 'keys') {
        for (const objectKey in attributes[attr]) {
          elem[objectKey] = attributes[attr][objectKey];
        }
      } else {
        elem.setAttribute(attr, attributes[attr]);
      }
    }
    this.ac(elem, child);
    return elem;
  }

  ac(element, child) {
    if (Array.isArray(child)) {
      child.forEach(oneChild => this.ac(element, oneChild));
    } else if (child instanceof HTMLElement
      || child instanceof Text
      || child instanceof SVGElement) {
      element.appendChild(child);
    }
  }

  ge(value, index) {
    return index ? document.getElementsByClassName(value)[index] : document.getElementById(value);
  }

  removeAllChildren(item) {
    while (item && item.firstChild) {
      item.removeChild(item.firstChild);
    }
  }
}
