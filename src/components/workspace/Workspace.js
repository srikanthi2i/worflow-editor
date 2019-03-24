import {
  Drawables
} from '../drawables';
import Component from '../Component';
import Tools from './Tools';
import './workspace.css';

export default class Workspace extends Component {
  constructor(elem, schema, options) {
    super(schema, options);
    this.root = elem;
    this._id = 'workspace';
    this.components = [];
    this.workspace = {
      x: 0,
      y: 0,
      zoom: 1
    }
    this.component;
    this.menuOptions;
    this.flows = [{
        "id": "flow-914272",
        "data": {},
        "key": "event",
        "label": "event",
        "position": {
          "x": 57,
          "y": 155
        },
        "type": "event",
        "out": [{
          "id": "flow-541922",
          "data": {},
          "key": "",
          "label": "",
          "position": {
            "x": 157,
            "y": 205
          },
          "type": "stroke",
          "points": [{
            "x": 126,
            "y": 0
          }],
          "destination": "flow-525308"
        }],
        "in": [],
        "scale": 1
      },
      {
        "id": "flow-525308",
        "data": {},
        "key": "action",
        "label": "action",
        "position": {
          "x": 292,
          "y": 180
        },
        "type": "action",
        "out": [{
          "id": "flow-340892",
          "data": {},
          "key": "",
          "label": "",
          "position": {
            "x": 328,
            "y": 230
          },
          "type": "stroke",
          "points": [{
            "x": 0,
            "y": 88
          }],
          "destination": "flow-372591"
        }],
        "in": [{
          "source": "flow-914272"
        }],
        "scale": 1
      },
      {
        "id": "flow-372591",
        "data": {},
        "key": "condition",
        "label": "condition",
        "position": {
          "x": 278,
          "y": 327
        },
        "type": "condition",
        "out": [{
          "id": "flow-240265",
          "data": {},
          "key": "",
          "label": "",
          "position": {
            "x": 377,
            "y": 377
          },
          "type": "stroke",
          "points": [{
            "x": 148,
            "y": 0
          }],
          "destination": "flow-276009"
        }],
        "in": [{
          "source": "flow-525308"
        }],
        "scale": 1
      },
      {
        "id": "flow-276009",
        "data": {},
        "key": "event",
        "label": "event",
        "position": {
          "x": 534,
          "y": 327
        },
        "type": "event",
        "out": [],
        "in": [{
          "source": "flow-372591"
        }],
        "scale": 1
      }
    ];
    this.components.push(this);
    document.addEventListener("componentUpdate", this.componentUpdate.bind(this), false);
  }

  componentUpdate(e) {
    let schema = this.flows.find((schema) => schema.id === e.detail.componentId);
    schema.label = e.detail.value;
  }

  reset(e) {
    this.workspace = {
      x: 0,
      y: 0,
      zoom: 1
    };
    this.element.setAttribute('style', '');
  }

  zoom(e, action) {
    e.preventDefault();
    var delta;
    const layer = {
      x: e.layerX,
      y: e.layerY
    }
    if (action) {
      const rect = this.element.getBoundingClientRect();
      layer.x = (rect.width / this.workspace.zoom) / 2;
      layer.y = (rect.height / this.workspace.zoom) / 2;
      delta = action === 'zoomIn' ? 120 : -120;
    } else {
      delta = (e.wheelDelta || -e.detail);
    }
    this.scrollTop += (delta < 0 ? 1 : -1) * 30;
    var oz = this.workspace.zoom,
      nz = this.workspace.zoom + (delta < 0 ? -0.2 : 0.2);
    if (nz < 1 || nz > 15) {
      return;
    }
    // calculate click at current zoom
    var ix = (layer.x - this.workspace.x) / oz,
      iy = (layer.y - this.workspace.y) / oz,
      // calculate click at new zoom
      nx = ix * nz,
      ny = iy * nz,
      // move to the difference
      // make sure we take mouse pointer offset into account!
      cx = (ix + (layer.x - ix) - nx),
      cy = (iy + (layer.y - iy) - ny);
    // update current
    this.workspace.zoom = nz;
    this.workspace.x = cx;
    this.workspace.y = cy;
    // make sure we scale before translate!
    const event = new CustomEvent("onZoom", {
      detail: {
        zoom: nz
      }
    });
    document.dispatchEvent(event);
    this.element.style.transform = `translate(${cx}px, ${cy}px) scale(${nz})`;
  };

  allowDrop(e) {
    e.preventDefault();
  }

  getDroppedPosition(e, {
    x,
    y,
    zoom
  }) {
    const dropOffset = {
      x: x + 50 * zoom, // x offset is 50 while drag
      y: y + 25 * zoom // y offset is 25 while drag
    }
    const offset = {
      x: e.layerX - dropOffset.x,
      y: e.layerY - dropOffset.y
    }
    return {
      x: Math.round(offset.x / zoom),
      y: Math.round(offset.y / zoom)
    }
  }

  drop(e) {
    e.preventDefault();
    const compType = e.dataTransfer.getData('data');
    const schema = {
      position: {
        ...this.getDroppedPosition(e, this.workspace)
      }
    }
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
    const id = e.target.parentElement.id;
    if (id === 'workspace') {
      this.startMove(e);
    } else if (id.indexOf('flow') === 0) {
      this.component = this.getComponentById(this.components, id);
      this.component && this.component.startMove(e, this.workspace.zoom);
    }
  }

  mouseMove(e) {
    if (this.menuOptions) {
      return;
    }
    if (this.component) {
      this.component.trackMove(e, this.workspace.zoom);
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
      this.updateFlowsByComponent(this.component);
    } else {
      this.initial && this.stopMove(e);
    }
  }

  updateFlowsByComponent(comp) {
    const { schema, line } = comp;
    this.flows.map(flow => {
      if (flow.id === schema.id) {
        flow = schema;
      }
      if (line) {
        if (flow.id === line.schema.destination) {
          flow.in.push(line.schema.id); 
        }
      }
    });
    this.component.line = null;
    this.component = null;
  }

  startMove(e) {
    this.setUpMove({ x: e.x, y: e.y });
    this.element.style.transition = 'none';
    this.element.style.transitionTimingFunction = 'unset';
  }

  trackMove(e) {
    const {
      x,
      y
    } = this.getMovedDistance({ x: e.x, y: e.y }, this.initial);
    this.workspace.x += x;
    this.workspace.y += y;
    this.setInitialPos({ x: e.x, y: e.y });
    this.element.style.transform =
      `translate(${this.workspace.x}px, ${this.workspace.y}px) scale(${this.workspace.zoom})`;
  }

  stopMove(e) {
    this.endMove(e);
    this.element.style.transition = 'transform 0.3s';
    this.element.style.transitionTimingFunction = 'ease-in-out';
  }

  getComponentById(comps, id) {
    return comps.find(comp => {
      return comp._id === id;
    });
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
      height: '100%'
    }, this.ce(this.getSVGTag('g'), {
      class: 'connect-lines'
    }));
    this.parent = this.ce('div', {
      id: this._id,
      on: {
        wheel: this.zoom.bind(this),
        mousedown: this.mouseDown.bind(this),
        mousemove: this.mouseMove.bind(this),
        mouseup: this.mouseEnd.bind(this)
      }
    });
    this.renderComponents(this.flows);
    this.ac(this.parent, this.element);
    return [this.parent, new Tools({
      zoom: this.zoom.bind(this),
      reset: this.reset.bind(this)
    }).create()];
  }

  renderComponents(flows) {
    this.element.remove();
    flows.forEach(schema => {
      const component = Drawables.createComponent(schema.type, this.element, schema);
      this.components.push(component);
      component.build();
    });
  }

  // Provide options for deleting and editing the components
  openMenuOptions(e) {
    e.preventDefault();
    this.closeMenuOptions();
    if (e.target.id !== "sheet") {
      const id = e.target.parentElement.id;
      this.component = this.getComponentById(this.components, id);
      let value;
      if (this.component) {
        const removeComponent = () => {
          this.flows.splice(this.flows.indexOf(this.component), 1);
        };
        value = this.component.menuOptions(removeComponent, 'component');
      } else {
        let id = e.target.parentElement.id;
        this.flows.map(comp => {
          if (comp.out.length > 0) {
            comp.out.map(line => {
              if (line.id === id) {
                this.component = this.getComponentById(this.components, comp.id);
              }
            })
          }
        })
        const removeLine = () => {
          this.flows.map(comp => {
            if (comp.out.length > 0) {
              comp.out.map((outLine, lineIndex) => {
                if (outLine.id === id) {
                  comp.out.splice(comp.out.indexOf(outLine), 1);
                }
              })
            }
          })
          this.flows.map(comp => {
            if (comp.in.length > 0) {
              comp.in.map((inLine, lineIndex) => {
                if (inLine.id === id) {
                  comp.in.splice(comp.in.indexOf(inLine), 1);
                }
              })
            }
          })
        };
        value = this.component.menuOptions(removeLine, 'line', id);
      }
      this.menuOptions = this.ce('div', {
        id: 'menuOptions',
        style: `transform: translate(${e.x}px, ${e.y}px)`,
        on: {
          click: this.closeMenuOptions.bind(this)
        }
      }, this.ce('ul', {
        id: 'items'
      }, value));
      this.ac(this.parent.parentElement, this.menuOptions);
    }
  }

  // Close the menu options while clicking other than components.
  closeMenuOptions(e) {
    this.menuOptions && this.menuOptions.remove();
    this.menuOptions = null;
    this.component = null;
  }
}
