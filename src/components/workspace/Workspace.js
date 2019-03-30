import Drawables from '../drawables/Drawables';
import Component from '../Component';
import FlowEmitter from '../event-emitter/EventEmitter';
import './workspace.css';

export default class Workspace extends Component {
  constructor(elem, flows, options) {
    super();
    this.root = elem;
    this.parent = null;
    this.flows = flows || [];
    this.options = options;
    this.workspace = {
      x: 0,
      y: 0,
      zoom: 1,
    };
    this.component = null;
    this.menuOptions = null;
    this.components = [];
    this.events = FlowEmitter;
    this.events.on('schemaChange', this.schemaChange.bind(this));
  }

  schemaChange(schema) {
    const component = this.components.find(comp => comp._id === schema.id);
    component.schema = schema;
    component.redraw();
  }

  reset() {
    this.workspace = {
      x: 0,
      y: 0,
      zoom: 1,
    };
    this.element.setAttribute('style', '');
  }

  zoom(e) {
    e.preventDefault();
    let delta;
    const layer = {
      x: e.layerX,
      y: e.layerY,
    };
    if (e.type === 'click') {
      const rect = this.element.getBoundingClientRect();
      layer.x = (rect.width / this.workspace.zoom) / 2;
      layer.y = (rect.height / this.workspace.zoom) / 2;
      delta = e.target.parentElement.classList.contains('zoom-in') ? 120 : -120;
    } else {
      delta = (e.wheelDelta || -e.detail);
    }
    const factor = (delta < 0 ? -0.2 : 0.2)
    let oz = this.workspace.zoom;
    const nz = oz + factor;
    if (nz < 1 || nz > 10) {
      return;
    }
    // calculate click at current zoom
    const ix = (layer.x - this.workspace.x) / oz;
    const iy = (layer.y - this.workspace.y) / oz;
    // calculate click at new zoom
    const nx = ix * nz;
    const ny = iy * nz;
    // move to the difference
    // make sure we take mouse pointer offset into account!
    const cx = (ix + (layer.x - ix) - nx);
    const cy = (iy + (layer.y - iy) - ny);
    // update current
    this.workspace.zoom = nz;
    this.workspace.x = cx;
    this.workspace.y = cy;
    // make sure we scale before translate!
    this.element.style.transform = `translate(${cx}px, ${cy}px) scale(${nz})`;
    this.events.emit('zoom', nz);
  }

  allowDrop(e) {
    e.preventDefault();
  }

  getDroppedPosition(e, { x, y, zoom }) {
    const dropOffset = {
      x: x + 50 * zoom, // x offset is 50 while drag
      y: y + 25 * zoom, // y offset is 25 while drag
    };
    const offset = {
      x: e.layerX - dropOffset.x,
      y: e.layerY - dropOffset.y,
    };
    return {
      x: Math.round(offset.x / zoom),
      y: Math.round(offset.y / zoom)
    };
  }

  drop(e) {
    e.preventDefault();
    const compType = e.dataTransfer.getData('data');
    const schema = {
      position: {
        ...this.getDroppedPosition(e, this.workspace),
      },
    };
    const component = Drawables.createComponent(compType, this.element, schema, this.options);
    component.build(this.parent);
    this.components.push(component);
    this.flows.push(component.schema);
  }

  mouseDown(e) {
    e.preventDefault();
    // check mouse click button is left
    if (e.which !== 1 || this.menuOptions) {
      return;
    }
    const { id } = e.target.parentElement;
    if (id === 'workspace') {
      this.startMove(e);
    } else if (id.indexOf('flow') === 0) {
      this.component = this.getComponentById(this.components, id);
      this.component && this.component.startMove(e, this.workspace.zoom);
      if (!e.target.classList.contains('node')) {
        this.component.schema.in.forEach(line => {
          const source = this.getComponentById(this.components, line.source);
          source.startMove(e, this.workspace.zoom, this.component);
        });
      }
    }
  }

  mouseMove(e) {
    if (this.menuOptions) {
      return;
    }
    if (this.component) {
      this.component.trackMove(e, this.workspace.zoom);
      if (!e.target.classList.contains('node')) {
        this.component.schema.in.forEach(line => {
          const source = this.getComponentById(this.components, line.source);
          source.trackMove(e, this.workspace.zoom, this.component)
        });
      }
    } else {
      this.initial && this.trackMove(e);
    }
  }

  mouseEnd(e) {
    if (this.menuOptions) {
      return;
    }
    if (this.component) {
      this.component.stopMove(e, this.workspace.zoom);
      this.component.schema.in.forEach(line => {
        const source = this.getComponentById(this.components, line.source);
        source.stopMove(e, this.workspace.zoom, this.component);
        this.updateFlowsByComponent(source);
      });
      this.updateFlowsByComponent(this.component);
      this.component.line = null;
      this.component = null;
    } else {
      this.initial && this.stopMove(e);
    }
  }

  updateFlowsByComponent(comp) {
    const { schema, line } = comp;
    this.flows.forEach((flow, i) => {
      if (flow.id === schema.id) {
        this.flows[i] = schema;
      }
      if (line) {
        if (flow.id === line.schema.destination) {
          this.flows[i].in.push({
            id: line.schema.id,
            source: schema.id
          });
        }
      }
    });
  }

  startMove(e) {
    this.setUpMove({
      x: e.x,
      y: e.y
    });
    this.element.style.transition = 'none';
    this.element.style.transitionTimingFunction = 'unset';
  }

  trackMove(e) {
    const { x, y } = this.getMovedDistance({ x: e.x, y: e.y }, this.initial);
    this.workspace.x += x;
    this.workspace.y += y;
    this.setInitialPos({ x: e.x, y: e.y });
    this.element.style.transform = `translate(${this.workspace.x}px, ${this.workspace.y}px) scale(${this.workspace.zoom})`;
  }

  stopMove(e) {
    this.endMove(e);
    this.element.style.transition = 'transform 0.3s';
    this.element.style.transitionTimingFunction = 'ease-in-out';
  }

  getComponentById(comps, id) {
    return comps.find(comp => comp.schema.id === id);
  }

  create() {
    this.element = this.ce(this.getSVGTag('svg'), {
      id: 'sheet',
      on: {
        contextmenu: this.openMenuOptions.bind(this),
        click: this.closeMenuOptions.bind(this),
        drop: this.drop.bind(this),
        dragover: this.allowDrop.bind(this),
      },
      width: '100%',
      height: '100%',
    }, this.ce(this.getSVGTag('g'), {
      class: 'connect-lines',
    }));
    this.parent = this.ce('div', {
      id: 'workspace',
      on: {
        wheel: this.zoom.bind(this),
        mousedown: this.mouseDown.bind(this),
        mousemove: this.mouseMove.bind(this),
        mouseup: this.mouseEnd.bind(this),
      },
    });
    this.renderComponents(this.flows);
    this.ac(this.parent, this.element);
    return [this.parent, this.attachTools()];
  }

  renderComponents(flows) {
    this.element.remove();
    flows.forEach((schema) => {
      const component = Drawables.createComponent(schema.type, this.element, schema);
      this.components.push(component);
      component.build();
    });
  }

  attachTools() {
    const tools = [
      {
        title: 'Reset Sheet',
        icon: '&#9974',
        click: this.reset.bind(this)
      },
      {
        title: 'Zoom in',
        icon: '&#10133',
        click: this.zoom.bind(this)
      },
      {
        title: 'Zoom out',
        icon: '&#10134',
        click: this.zoom.bind(this)
      }
    ];
    return tools.map((tool) => {
      const { title, icon, click } = tool;
      return this.ce('div', {
        class: `tool ${title.toLowerCase().replace(' ', '-')}`,
      }, this.ce('button', {
        keys: {
          innerHTML: icon,
          title
        },
        on: {
          click
        }
      }));
    });
  }

  // Provide options for deleting and editing the components
  openMenuOptions(e) {
    e.preventDefault();
    this.closeMenuOptions();
    const { id } = e.target.parentElement;
    if (id.indexOf('flow') === 0) {
      const menuItems = [];
      this.menuOptions = this.ce('div', {
        id: 'menu-options',
        style: `transform: translate(${e.x}px, ${e.y}px)`,
        on: {
          click: this.closeMenuOptions.bind(this),
        },
      }, this.ce('ul', {
        class: 'items',
      }, menuItems));
      this.ac(this.parent.parentElement, this.menuOptions);
    }
  }

  // Close the menu options while clicking other than components.
  closeMenuOptions() {
    this.menuOptions && this.menuOptions.remove();
    this.menuOptions = null;
    this.component = null;
  }
}
