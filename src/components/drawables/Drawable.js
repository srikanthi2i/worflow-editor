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
      }
    }
    this.modalOptions;
    this.modal = null;
  }

  get baseSchema() {
    return Drawable.schema();
  }

  getCurrentPos(pos, zoom) {
    return {
      x: pos.x / zoom,
      y: pos.y / zoom
    }
  }

  startMove(e, zoom) {
    const current = this.getCurrentPos(e, zoom);
    super.startMove(current);
  }

  trackMove(e, zoom) {
    const current = this.getCurrentPos(e, zoom);
    this.setPosition(this.getMovedDistance(current, this.initial));
    this.setInitialPos(current);
    this.redraw();
  }

  stopMove(e, zoom) {
    super.stopMove(e);
  }

  openModal(elem, options) {
    this.modal = new Modal(this.schema, options).open();
    this.ac(elem, this.modal);
  }

  enableContextMenu(cb, key, id) {
    const deleteMenu = (this.ce('li', {
      on: {
        click: this.deleteMenu.bind(this, cb, key, id)
      },
      keys: {
        innerHTML: "Delete"
      }
    }));
    return deleteMenu;
  }

  deleteMenu(cb, key, id) {
    if (key === 'component') {
      if (document.getElementById(this.schema.id)) {
        document.getElementById(this.schema.id).remove();
        document.getElementById("menuOptions").remove();
        if (this.modal) {
          this.modal.remove();
        }
        cb();
      }
    } else {
      document.getElementById(id).remove();
      if (this.modal) {
        this.modal.remove();
      }
      cb();
    }
  
  }
}
