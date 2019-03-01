import Base from '../base/Base';
import Modal from '../modal/Modal';
import Tools from './Tools';
import './workspace.css';
export default class Workspace extends Base {
  constructor() {
    super();
    this.current = {
      x: 0,
      y: 0,
      zoom: 1
    }
    this.workspace;
    this.offset = {};
    this.element;
    this.component;
    this.line;
    this.svg;
    this.highlighted;
    this.menuOptions;
    this.flows = [{
        "id": "comp-867607",
        "data": {
          "formId": "id for purchase order"
        },
        "key": "event",
        "label": "Track PO",
        "out": [{
          "id": "linecomp-867607-0",
          "direction": "bottom",
          "destination": "comp-513476",
          "position": {
            "x": 209.5,
            "y": 157.5
          },
          "height": 104.5,
          "width": 19.5,
          "points": [{
            "x": 9.5,
            "y": 94.5
          }],
          "completed": false
        }],
        "in": [],
        "position": {
          "x": 165,
          "y": 65
        },
        "type": "event"
      },
      {
        "id": "comp-513476",
        "data": {
          "rule": "rule for purchased"
        },
        "key": "condition",
        "label": "If Purchased?",
        "out": [{
          "id": "linecomp-513476-0",
          "direction": "right",
          "destination": "comp-465141",
          "position": {
            "x": 279,
            "y": 309.5
          },
          "height": 21.5,
          "width": 116,
          "points": [{
            "x": 106,
            "y": 11.5
          }],
          "action": "yes",
          "completed": false
        }],
        "in": [{
          "direction": "top",
          "source": "comp-867607"
        }],
        "position": {
          "x": 165,
          "y": 265
        },
        "type": "condition"
      },
      {
        "id": "comp-465141",
        "data": {
          "formId": "id for invoice"
        },
        "key": "action",
        "label": "Create Invoice",
        "out": [{
          "id": "linecomp-465141-0",
          "direction": "bottom",
          "destination": "comp-067317",
          "position": {
            "x": 424.5,
            "y": 333.5
          },
          "height": 92.5,
          "width": 21.5,
          "points": [{
            "x": 11.5,
            "y": 82.5
          }],
          "completed": false
        }],
        "in": [{
          "direction": "left",
          "source": "comp-513476"
        }],
        "position": {
          "x": 380,
          "y": 290
        },
        "type": "action"
      },
      {
        "id": "comp-067317",
        "data": {
          "rule": "rule for invoice detail"
        },
        "key": "condition",
        "label": "Is having ID?",
        "out": [{
          "id": "linecomp-067317-0",
          "direction": "right",
          "destination": "comp-171995",
          "position": {
            "x": 492.5,
            "y": 473.5
          },
          "height": 20.5,
          "width": 142.5,
          "points": [{
            "x": 132.5,
            "y": 10.5
          }],
          "action": "yes",
          "completed": false
        }],
        "in": [{
          "direction": "top",
          "source": "comp-465141"
        }],
        "position": {
          "x": 380,
          "y": 430
        },
        "type": "condition"
      },
      {
        "id": "comp-171995",
        "data": {
          "formId": "id for invoice-detail"
        },
        "key": "action",
        "label": "Create Invoice-detail",
        "out": [],
        "in": [{
          "direction": "left",
          "source": "comp-067317"
        }],
        "position": {
          "x": 620,
          "y": 455
        },
        "type": "action"
      }
    ];
    document.addEventListener("componentUpdate", this.componentUpdate.bind(this), false);
  }

  componentUpdate(e) {
    console.log('flows', this.flows);
  }

  reset(e) {
    this.current = {
      x: 0,
      y: 0,
      zoom: 1
    };
    this.workspace.setAttribute('style', '');
  }

  zoom(e, action) {
    var delta;
    const layer = {
      x: e.layerX,
      y: e.layerY
    }
    if (action) {
      const rect = this.workspace.getBoundingClientRect();
      layer.x = (rect.width / this.current.zoom) / 2;
      layer.y = (rect.height / this.current.zoom) / 2;
      delta = action === 'zoomIn' ? 120 : -120;
    } else {
      delta = (e.wheelDelta || -e.detail);
    }
    this.scrollTop += (delta < 0 ? 1 : -1) * 30;
    e.preventDefault();
    var oz = this.current.zoom,
      nz = this.current.zoom + (delta < 0 ? -0.2 : 0.2);
    if (nz < 1 || nz > 15) {
      return;
    }
    // calculate click at current zoom
    var ix = (layer.x - this.current.x) / oz,
      iy = (layer.y - this.current.y) / oz,
      // calculate click at new zoom
      nx = ix * nz,
      ny = iy * nz,
      // move to the difference
      // make sure we take mouse pointer offset into account!
      cx = (ix + (layer.x - ix) - nx),
      cy = (iy + (layer.y - iy) - ny);
    // update current
    this.current.zoom = nz;
    this.current.x = cx;
    this.current.y = cy;
    // make sure we scale before translate!
    const event = new CustomEvent("onZoom", {
      detail: {
        zoom: nz
      }
    });
    document.dispatchEvent(event);
    this.workspace.style.transform = `translate(${cx}px, ${cy}px) scale(${nz})`;
  };

  allowDrop(e) {
    e.preventDefault();
  }

  drop(e) {
    var droppedId = e.dataTransfer.getData('data');
    e.preventDefault();
    var component = {
      id: this.randomString('comp', 'n'),
      data: {},
      key: droppedId,
      label: droppedId,
      out: [],
      in: [],
      position: {
        x: (e.layerX - (this.current.x + 50)) / this.current.zoom,
        y: (e.layerY - (this.current.y + 25)) / this.current.zoom
      },
      type: droppedId
    };
    component.position.x = Math.round(component.position.x / 5) * 5;
    component.position.y = Math.round(component.position.y / 5) * 5;
    if (component.type === 'condition') {
      component.position.x += 20;
      component.position.y += 20;
    }
    this.flows.push(component);
    this.workspace.appendChild(this.placeComponent(component));
    if (this.modal) {
      this.modal.remove();
    }
    this.modal = new Modal(component).open()
    this.workspace.parentNode.appendChild(this.modal);
  }

  placeComponent(comp) {
    this.component = comp;
    var wrapperStyle = 'position: absolute; border: #faebd7; box-shadow: 2px 2px 4px #393939;';
    var compStyle =
      'position: relative; width: 100px; height: 100px; color: black; display: flex; align-items: center; justify-content: center;'
    if (comp.type === 'event') {
      wrapperStyle += `border-radius: 50%; transform: translate(${comp.position.x}px, ${comp.position.y}px)`;
      compStyle += 'border-radius: 50%';
    } else if (comp.type === 'action') {
      wrapperStyle += `transform: translate(${comp.position.x}px, ${comp.position.y}px)`;
      compStyle += 'height: 50px';
    } else if (comp.type === 'condition') {
      wrapperStyle +=
        `transform: translate(${comp.position.x}px, ${comp.position.y}px) rotate(45deg)`;
    }
    var compChildren = [
      this.ce('span', {
        style: 'text-transform: capitalize;' +
          `${comp.type === 'condition' ? 'transform: rotate(-45deg)': ''}`,
        keys: {
          innerHTML: comp.label
        }
      })
    ];
    compChildren.push(this.getAvailableDirections(comp).map((line) => this.addNode(line)));
    comp.out.map(line => this.createLineSVG(line));

    var wrappedComp = this.ce('div', {
      id: comp.id,
      style: wrapperStyle,
      on: {
        dblclick: this.openModal.bind(this),
        mouseover: this.showNodes.bind(this),
        mouseleave: this.hideNodes.bind(this)
      }
    }, this.ce('div', {
      class: 'drag-item',
      style: compStyle
    }, compChildren));
    this.component = null;
    return wrappedComp;
  }

  openModal(e) {
    const componentId = e ? e.target.parentElement.id : this.component.id;
    if (componentId.indexOf('comp') !== 0) {
      return;
    }
    this.component = this.getComponentById(this.flows, componentId);
    this.workspace.parentNode.appendChild(new Modal(this.component).open());
  }

  showNodes(e) {
    e.preventDefault();
    const componentId = e.target.parentElement.id;
    if (componentId.indexOf('comp') !== 0) {
      return;
    }
    this.tempComp = this.getComponentById(this.flows, componentId);
    let tempDirections = ['top', 'right', 'bottom', 'left'];
    this.getAvailableDirections(this.tempComp).map(direction => {
      tempDirections.splice(tempDirections.indexOf(direction), 1)
    });
    tempDirections.map(direction => {
      e.target.appendChild(this.addNode(direction, 'temp'));
    });
  }

  getAvailableDirections(comp) {
    const availableDirections = [...comp.out.map(line => (line.direction)), ...comp.in.map(line => (line.direction))];
    return availableDirections.filter((direction, index) => availableDirections.indexOf(direction) === index);
  }

  hideNodes(e) {
    e.preventDefault();
    if (e.target.id.indexOf('comp') !== 0) {
      return;
    }
    const tempNodes = e.target.firstChild.getElementsByClassName('temp');
    while (tempNodes.length > 0) {
      tempNodes[0].remove();
    }
    this.tempComp = null;
  }

  addNode(direction, isTemp) {
    const comp = isTemp ? this.tempComp : this.component;
    var nodeStyle =
      'width: 15px; height: 15px; position: absolute; z-index: -1; border-radius: 50%; cursor: crosshair;';
    const calc = comp.type === 'condition' ? 0 : 50;
    if (direction === 'top') {
      nodeStyle += `top: -8px; left: calc(${calc}% - 8px);`;
    } else if (direction === 'right') {
      nodeStyle += `right: -8px; top: calc(${calc}% - 8px);`;
    } else if (direction === 'bottom') {
      nodeStyle += `bottom: -8px; right: calc(${calc}% - 8px);`;
    } else {
      if (calc) {
        nodeStyle += `left: -8px; bottom: calc(${calc}% - 8px);`;
      }
    }
    var createdNode = this.ce('div', {
      id: `node-${comp.id}-${direction}`,
      class: 'node-' + `${isTemp ? isTemp+' temp': comp.id}`,
      style: nodeStyle,
      ['data-comp']: comp.id,
      ['data-direction']: direction
    }, this.ce('div', {
      style: 'width: 100%; height: 100%; position: relative; background: blue; border-radius: 50%; cursor: crosshair;',
      on: {
        mouseover: this.highlight.bind(this),
        mouseout: this.highlight.bind(this)
      }
    }));
    return createdNode;
  }

  highlight(e) {
    e.preventDefault();
    if (!this.highlighted) {
      e.target.style.transform = 'scale(1.5)';
      this.highlighted = e.target.parentElement;
      this.highlighted.style.zIndex = 1;
      return;
    }
    e.target.style.transform = 'scale(1)';
    this.highlighted.style.zIndex = -1;
    this.highlighted = null;
  }

  mouseDown(e) {
    e.preventDefault();
    // check mouse click button is left
    if (e.which !== 1) {
      return;
    }
    if (this.svg) {
      this.svg.remove();
      return;
    }
    this.setElemByEvent(e);
    if (this.element.id.indexOf('workspace') === 0) {
      this.element.style.cursor = 'grabbing';
      this.initWorkspaceMove(e);
    } else if (this.element.id.indexOf('comp') === 0) {
      this.element.style.cursor = 'grabbing';
      this.component = this.getComponentById(this.flows, this.element.id);
      this.initCompMove(e);
    } else if (this.element.id.indexOf('node') === 0) {
      this.component = this.getComponentById(this.flows, this.element.dataset.comp)
      e.target.parentElement.classList.remove('temp');
      this.initLineDraw(e);
    }
  }

  mouseMove(e) {
    if (!this.element) {
      return;
    }
    if (this.element.id.indexOf('workspace') === 0) {
      this.moveWorkspace(e);
    } else if (this.element.id.indexOf('comp') === 0) {
      this.moveComp(e);
    } else if (this.element.id.indexOf('node') === 0) {
      this.trackLinePoints(e);
    }
  }

  mouseEnd(e) {
    if (!this.element) {
      return;
    }
    if (this.element.id.indexOf('workspace') === 0) {
      this.element.style.cursor = 'default';
      this.endWorkspaceMove(e);
    } else if (this.element.id.indexOf('comp') === 0) {
      this.element.style.cursor = 'default';
      this.endCompMove(e);
    } else if (this.element.id.indexOf('node') === 0) {
      this.endLineDraw(e);
    }
  }

  clearComponent() {
    this.element = null;
    this.component = null;
  }

  initWorkspaceMove(e) {
    const rect = this.workspace.getBoundingClientRect();
    const offsetCalc = {
      x: e.offsetX,
      y: e.offsetY
    }
    if (e.target.id.indexOf('workspace') != 0) {
      offsetCalc.x = e.x - rect.x;
      offsetCalc.y = e.y - rect.y;
    }
    this.offset.x = offsetCalc.x * this.current.zoom;
    this.offset.y = offsetCalc.y * this.current.zoom;
    this.element.style.transition = 'none';
    this.element.style.transitionTimingFunction = 'unset';
  }

  moveWorkspace(e) {
    if (Object.keys(this.offset).length) {
      this.current.x = e.layerX - this.offset.x;
      this.current.y = e.layerY - this.offset.y;
      this.element.style.transform =
        `translate(${this.current.x}px, ${this.current.y}px) scale(${this.current.zoom})`;
    }
  }

  endWorkspaceMove(e) {
    this.offset = {};
    this.element.style.transition = 'transform 0.3s';
    this.element.style.transitionTimingFunction = 'ease-in-out';
    this.clearComponent();
  }

  initCompMove(e) {
    this.offset.x = (this.current.x + e.offsetX * this.current.zoom);
    this.offset.y = (this.current.y + e.offsetY * this.current.zoom);
  }

  moveComp(e) {
    if (Object.keys(this.offset).length) {
      const validate = {
        x: (e.layerX - this.offset.x) / this.current.zoom,
        y: (e.layerY - this.offset.y) / this.current.zoom
      };
      if (validate.x < 0 || validate.y < 0) {
        return;
      }
      this.component.position = {
        ...validate
      };
      // TODO:: need to realign drawn lines
      this.element.style.transform =
        `translate(${validate.x}px, ${validate.y}px) ${this.component.type === 'condition' ? 'rotate(45deg)' : ''}`;
    }
  }

  endCompMove(e) {
    this.offset = {};
    this.component.position.x = Math.round(this.component.position.x / 5) * 5;
    this.component.position.y = Math.round(this.component.position.y / 5) * 5;
    this.element.style.transform =
      `translate(${this.component.position.x}px, ${this.component.position.y}px) ${this.component.type === 'condition' ? 'rotate(45deg)' : ''}`;
      this.clearComponent();

  }

  initLineDraw(e) {
    const rect = this.workspace.getBoundingClientRect();
    const correction = {
      x: (e.offsetX * 1.5) * this.current.zoom,
      y: (e.offsetY * 1.5) * this.current.zoom
    }
    const highlightOffset = 15 - 15 / 1.5;
    this.offset.x = e.x - correction.x;
    this.offset.y = e.y - correction.y;
    this.line = {
      id: 'line' + this.component.id + '-' + this.component.out.length,
      direction: this.element.dataset.direction,
      destination: '',
      position: {
        x: ((e.x - correction.x - rect.x) / this.current.zoom) + highlightOffset,
        y: ((e.y - correction.y - rect.y) / this.current.zoom) + highlightOffset
      },
      height: 15,
      width: 15,
      points: [{
        x: 0,
        y: 0
      }],
      completed: false
    }
    this.createLineSVG(this.line, e);
  }

  createLineSVG(line, e) {
    this.svg = this.ce({
      namespace: 'http://www.w3.org/2000/svg',
      tag: 'svg'
    }, {
      id: line.id,
      class: 'line-' + this.component.id,
      ['data-direction']: line.direction,
      style: 'position: absolute; z-index: -2; cursor: crosshair;' +
        `transform: translate(${line.position.x}px, ${line.position.y}px);`,
      width: line.width,
      height: line.height
    }, [
      this.ce({
        namespace: 'http://www.w3.org/2000/svg',
        tag: 'path'
      }, {
        id: 'path',
        nativeStyle: {
          strokeWidth: 3,
          opacity: 1,
          fill: 'none'
        }
      }),
      this.ce({
        namespace: 'http://www.w3.org/2000/svg',
        tag: 'path'
      }, {
        id: 'arrow',
        nativeStyle: {
          strokeWidth: 3,
          opacity: 1,
          stroke: 'black'
        },
      })
    ]);
    this.drawLine(line, e);
  }

  trackLinePoints(e) {
    if (Object.keys(this.offset).length) {
      const displaceX = (e.x - this.offset.x) / this.current.zoom;
      const displaceY = (e.y - this.offset.y) / this.current.zoom;
      this.line.width = displaceX > 0 ? displaceX + 10 : (displaceX - 10) * -1;
      this.line.height = displaceY > 0 ? displaceY + 10 : (displaceY - 10) * -1;
      this.line.points[0].x = displaceX;
      this.line.points[0].y = displaceY;
    }
    this.drawLine(this.line, e);
  }

  drawLine(line, e) {
    this.svg.setAttribute('width', line.width);
    this.svg.setAttribute('height', line.height);
    let points;
    let arrowPath;
    const {
      x,
      y
    } = line.points[0];
    switch (line.direction) {
      case 'top':
        this.svg.style.top = `${y}`;
        points = `M 6 ${(y*-1)} L 6 0`;
        arrowPath = `M 2.5 ${y*-1/2} L 6.25 ${(y*-1/2) - 7.5}  L 10 ${y*-1/2} z`;
        break;
      case 'right':
        points = `M 0 6 L ${x} 6`;
        arrowPath = `M ${x/2} 2.5 L ${(x/2) + 7.5 } 6.25  L ${x/2} 10 z`;
        break;
      case 'bottom':
        points = `M 6 0 L 6 ${y}`;
        arrowPath = `M 2.5 ${y/2} L 6.25 ${(y/2) + 7.5}  L 10 ${y/2} z`;
        break;
      case 'left':
        this.svg.style.left = `${x}`;
        points = `M ${(x*-1)} 6 L 0 6`;
        arrowPath = `M ${x*-1/2} 2.5 L ${(x*-1/2) - 7.5} 6.25  L ${x*-1/2} 10 z`;
        break;
      default:
        break;
    }
    this.ce(this.svg.getElementById('path'), {
      stroke: 'orangered',
      ['stroke-dasharray']: e ? '5.5' : '',
      d: points,
    });
    this.ce(this.svg.getElementById('arrow'), {
      d: arrowPath,
    });
    this.ac(this.workspace, this.svg);
    if (!e) {
      this.svg = null;
      this.line = null;
    }
  }

  endLineDraw(e) {
    this.offset = {};
    const destination = this.highlighted && this.highlighted.dataset;
    if (destination && destination.comp !== this.component.id) {
      this.ce(this.svg.getElementById('path'), {
        ['stroke-dasharray']: ''
      });
      this.svg.style.cursor = 'default';
      e.target.parentElement.classList.remove('temp');
      this.line.destination = destination.comp;
      this.component.out.push(this.line);
      this.getComponentById(this.flows, destination.comp).in.push({
        direction: destination.direction,
        source: this.component.id
      });
    } else {
      this.svg.remove();
      if (this.workspace.getElementsByClassName(`line-${this.component.id}`).length < 1) {
        this.element.remove();
        this.element = null;
      }
    }
    this.clearComponent();
    this.svg = null;
    this.line = null;
    // TODO: remove after fetch
  }

  getComponentById(comps, id) {
    return comps.find(comp => {
      return comp.id === id;
    });
  }

  setElemByEvent(e) {
    const rootElem = e.target.parentElement;
    if (rootElem.id.indexOf('comp') === 0) {
      this.element = rootElem;
    } else if (rootElem.id.indexOf('node') === 0) {
      this.element = rootElem;
    } else if (rootElem.id.indexOf('line') === 0) {
      this.element = rootElem;
    } else {
      this.element = this.workspace;
    }
  }

  create() {
    this.workspace = this.ce('div', {
      id: 'workspace',
      on: {
        contextmenu: this.openMenuOptions.bind(this),
        click: this.closeMenuOptions.bind(this),
        wheel: this.zoom.bind(this),
        mousedown: this.mouseDown.bind(this),
        mousemove: this.mouseMove.bind(this),
        mouseup: this.mouseEnd.bind(this),
        drop: this.drop.bind(this),
        dragover: this.allowDrop.bind(this),
      }
    });
    this.renderComponents(this.flows);
    return [this.workspace, new Tools({
      zoom: this.zoom.bind(this),
      reset: this.reset.bind(this)
    }).create()];
  }

  renderComponents(flows) {
    this.workspace.innerHTML = '';
    this.ac(this.workspace, flows.map((component) => this.placeComponent(component)));
  }

  // Provide options for deleting and editing the components
  openMenuOptions(e) {
    e.preventDefault();
    this.closeMenuOptions();
    this.setElemByEvent(e);
    if (this.element.id.indexOf('line') === 0) {
      //
    } else if (this.element.id.indexOf('comp') === 0) {
      this.component = this.getComponentById(this.flows, this.element.id);
    } else {
      return;
    }
    let menuItems = [];
    const deleteMenu = () => (this.ce('li', {
      on: {
        click: this.deleteMenu.bind(this)
      },
      keys: {
        innerHTML: "Delete"
      }
    }));
    const editMenu = () => (this.ce('li', {
      on: {
        click: this.editMenu.bind(this)
      },
      keys: {
        innerHTML: "Edit"
      }
    }));
    menuItems.push(deleteMenu().bind(this));
    console.log('this comp', this.component);
    this.component.id.indexOf('line') === -1 && menuItems.push(editMenu().bind(this));
    this.menuOptions = this.ce('div', {
      id: 'menuOptions',
      style: `transform: translate(${e.x}px, ${e.y}px)`
    }, this.ce('ul', {
      id: 'items'
    }, menuItems));
    this.workspace.appendChild(this.menuOptions);
  }

  // Delete the component
  deleteMenu(e) {
    console.log('this', this.component);
    this.closeMenuOptions();
    if (this.line) {
      this.getElementById(this.line.id).remove();
      const source = this.getComponentById(this.flows, this.component.id).out;
      source.splice(source.indexOf(this.line), 1);
      const destination = this.getComponentById(this.flows, this.line.destination).in;
      destination.find((dest, index) => {
        if (dest.source === source.id) {
          destination.splice(index, 1);
        }
      });
    } else {
      this.getElementById(this.component.id).remove();
      this.flows.splice(this.flows.indexOf(this.component), 1);
    }
  }

  // Open the component Modal
  editMenu(e) {
    this.closeMenuOptions();
    this.openModal();
  }

  // Close the menu options while clicking other than components.
  closeMenuOptions(e) {
    this.menuOptions && this.menuOptions.remove();
  }
}