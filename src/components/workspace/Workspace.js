import modalOptions from './ModalOptions';
import Tools from './Tools';
import './workspace.css';
import {
  Drawables
} from '../drawables';
import Component from '../Component';
export default class Workspace extends Component {
  constructor() {
    super();
    this._id = 'workspace';
    this.components = [];
    this.components.push(this);
    this.workspace = {
      x: 0,
      y: 0,
      zoom: 1
    }
    this.options = modalOptions;
    this.component;
    this.menuOptions;
    this.flows = [];
    document.addEventListener("componentUpdate", this.componentUpdate.bind(this), false);
  }

  componentUpdate(e) {
    let FilterComponent = this.flows.find(function (flow) {
      return flow.id === e.detail.componentId;
    })
    let index = this.flows.indexOf(FilterComponent);
    FilterComponent.label = e.detail.value;
    this.flows[index] = FilterComponent;
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
    e.preventDefault();
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
    const component = Drawables.createComponent(compType, this.element, null, this.options);
    component.schema.position = {
      ...this.getDroppedPosition(e, this.workspace)
    }
    this.components.push(component);
    this.flows.push(component.schema);
    component.build();
    component.openModal(this.parent.parentElement, this.options);
  }

  mouseDown(e) {
    e.preventDefault();
    // check mouse click button is left
    if (e.which !== 1) {
      return;
    }
    const id = e.target.parentElement.id;
    this.component = this.getComponentById(this.components, id);
    const {
      zoom
    } = this.workspace;
    if (this.component) {
      if (e.target.classList.contains('node')) {
        this.element.style.cursor = 'crosshair';
        this.component.beginLineConnect(e);
        this.component.line.startMove(e, zoom);
      } else {
        this.component.startMove(e, zoom);
      }
    }
  }

  mouseMove(e) {
    if (this.component) {
      const {
        zoom
      } = this.workspace;
      if (this.component.line) {
        this.component.line.trackMove(e, zoom);
      } else {
        this.component.trackMove(e, zoom);
      }
    }
  }

  mouseEnd(e) {
    if (this.component) {
      const {
        zoom
      } = this.workspace;
      if (this.component.line) {
        this.element.style.cursor = '';
        const id = e.target.parentElement.id;
        const target = this.getComponentById(this.components, id);
        if (e.target.classList.contains('node')) {
          this.component.line.stopMove(e, zoom);
          target.endLineConnect(e, this.component.line);
          this.component.endLineConnect(e, target);
        } else {
          this.component.clearLine();
        }
      } else {
        this.component.stopMove(e, zoom);
      }
    }
    this.component = null;
  }

  startMove(e) {
    super.startMove(e);
    this.element.style.transition = 'none';
    this.element.style.transitionTimingFunction = 'unset';
  }

  trackMove(e) {
    const {
      x,
      y
    } = this.getMovedDistance(e, this.initial);
    this.workspace.x += x;
    this.workspace.y += y;
    this.setInitialPos(e);
    this.element.style.transform =
      `translate(${this.workspace.x}px, ${this.workspace.y}px) scale(${this.workspace.zoom})`;
  }

  stopMove(e) {
    super.stopMove(e);
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
    return [this.parent, new Tools({
      zoom: this.zoom.bind(this),
      reset: this.reset.bind(this)
    }).create()];
  }

  renderComponents(flows) {
    this.parent.innerHTML = '';
    this.ac(this.parent, [this.element, flows.map((component) => this.placeComponent(component))]);
  }

  // Provide options for deleting and editing the components
  openMenuOptions(e) {
    e.preventDefault();
    this.closeMenuOptions();
    if (e.target.id !== "sheet") {
      const id = e.target.parentElement.id;
      this.component = this.getComponentById(this.components, id);
      if (this.component) {
        const removeComponent = () => {
          this.flows.splice(this.flows.indexOf(this.component), 1);
        };
        let value = this.component.enableContextMenu(removeComponent, 'component');
        this.menuOptions = this.ce('div', {
          id: 'menuOptions',
          style: `transform: translate(${e.x}px, ${e.y}px)`
        }, this.ce('ul', {
          id: 'items'
        }, value));
        this.ac(this.parent.parentElement, this.menuOptions);
        // document.getElementById(this.component._id).parentElement.parentElement.appendChild(this.menuOptions);
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
        let value = this.component.enableContextMenu(removeLine, 'line', id);
        this.menuOptions = this.ce('div', {
          id: 'menuOptions',
          style: `transform: translate(${e.x}px, ${e.y}px)`
        }, this.ce('ul', {
          id: 'items'
        }, value));
        this.ac(this.parent.parentElement, this.menuOptions);
        // document.getElementById(this.component._id).parentElement.parentElement.appendChild(this.menuOptions);
      }
    }
  }

  // Close the menu options while clicking other than components.
  closeMenuOptions(e) {
    this.menuOptions && this.menuOptions.remove();
  }
}
