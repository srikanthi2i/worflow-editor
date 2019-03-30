import Component from '../Component';
import Modal from '../modal/Modal';

export default class Drawable extends Component {
  static schema(...source) {
    return Object.assign({
      id: '',
      data: {},
      key: '',
      label: '',
      position: {
        x: 0,
        y: 0
      },
      type: '',
    }, ...source);
  }

  constructor(elem, schema, options) {
    super(elem, schema, options);
    this.parent = elem;
    this.schema = {
      ...this.baseSchema,
      ...schema
    };
    this._id = schema && schema.id ? schema.id : this.randomString('flow', 'n');
    this.schema.id = this._id;
    this.design = {
      ...this.baseDesign
    };
    if (options && options[this.schema.type]) {
      this.design = {
        ...this.design,
        ...options[this.schema.type]
      };
    }
    this.modal = null;
  }

  get baseSchema() {
    return Drawable.schema();
  }

  getCurrentPos(pos, zoom) {
    return {
      x: pos.x / zoom,
      y: pos.y / zoom
    };
  }

  startMove(e, zoom) {
    this.setUpMove(this.getCurrentPos(e, zoom));
  }

  trackMove(e, zoom) {
    const { x, y } = this.getMovedDistance(this.getCurrentPos(e, zoom), this.initial);
    this.element.style.transform = `translate(${x}px, ${y}px)`;
  }

  stopMove(e, zoom) {
    this.element.style.transform = '';
    const moved = this.getMovedDistance(this.getCurrentPos(e, zoom), this.initial);
    this.setPosition(moved);
    this.redraw();
    this.endMove();
  }

  openModal(elem, options) {
    this.modal = new Modal(this.schema, options).open();
    this.ac(elem, this.modal);
  }

  menuOptions(cb, key, id) {
    const deleteMenu = (this.ce('li', {
      on: {
        click: this.deleteMenu.bind(this, cb, key, id)
      },
      keys: {
        innerHTML: 'Delete'
      }
    }));
    return deleteMenu;
  }

  deleteMenu(cb, key, id) {
    key === 'component' ? this.element.remove() : this.ge(id).remove();
    this.modal && this.modal.remove();
  }
}
  