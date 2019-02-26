import Base from '../base/Base';
import Modal from '../modal/Modal';
import './workspace.css';
export default class Workspace extends Base {
  constructor() {
    super();
    this.workspace;
    this.offset = {};
    this.config = {
      event: {
        width: 100,
        height: 100,
      },
      action: {
        width: 100,
        height: 50,
      },
      conditional: {
        width: 100,
        height: 100,
      },
      nodeIn: {
        width: 15,
        height: 15,
      },
      nodeOut: {
        width: 15,
        height: 15,
      }
    };
    this.element;
    this.component;
    this.current = {
      x: 0,
      y: 0,
      zoom: 1
    }
    this.highlighted;
    this.flows = [{
        "id": "comp-12345",
        "data": {},
        "key": "",
        "label": "Start",
        "out": [{
          "id": "linecomp-12345-1",
          "direction": "right",
          "destination": "comp-063733",
          "position": {
            "x": 277,
            "y": 123
          },
          "height": 28,
          "width": 110,
          "points": [{
            "x": 100,
            "y": 18
          }],
          "completed": false
        }],
        "in": [],
        "position": {
          "x": 184,
          "y": 80
        },
        "type": "event"
      },
      {
        "id": "comp-063733",
        "data": {},
        "key": "action",
        "label": "Track",
        "out": [{
          "id": "linecomp-063733-0",
          "direction": "bottom",
          "destination": "comp-295841",
          "position": {
            "x": 416.5,
            "y": 150.5
          },
          "height": 111.5,
          "width": 19.5,
          "points": [{
            "x": 9.5,
            "y": 101.5
          }],
          "completed": false
        }],
        "in": [{
          "direction": "left",
          "source": "comp-12345"
        }],
        "position": {
          "x": 373,
          "y": 108
        },
        "type": "action"
      },
      {
        "id": "comp-295841",
        "data": {},
        "key": "condition",
        "label": "Is Passed",
        "out": [{
            "id": "linecomp-295841-0",
            "direction": "right",
            "destination": "comp-103524",
            "position": {
              "x": 483.5,
              "y": 311.5
            },
            "height": 13.5,
            "width": 139.5,
            "points": [{
              "x": 129.5,
              "y": 3.5
            }],
            "completed": false
          },
          {
            "id": "linecomp-295841-2",
            "direction": "bottom",
            "destination": "comp-605937",
            "position": {
              "x": 413.5,
              "y": 382.5
            },
            "height": 109.5,
            "width": 22.5,
            "points": [{
              "x": 12.5,
              "y": 99.5
            }],
            "completed": false
          }
        ],
        "in": [{
          "direction": "top",
          "source": "comp-063733"
        }],
        "position": {
          "x": 372,
          "y": 267
        },
        "type": "condition"
      },
      {
        "id": "comp-103524",
        "data": {},
        "key": "action",
        "label": "Mailed",
        "out": [{
          "id": "linecomp-103524-0",
          "direction": "right",
          "destination": "comp-342539",
          "position": {
            "x": 703.5,
            "y": 312
          },
          "height": 22,
          "width": 145.5,
          "points": [{
            "x": 135.5,
            "y": 12
          }],
          "completed": false
        }],
        "in": [{
          "direction": "left",
          "source": "comp-295841"
        }],
        "position": {
          "x": 610,
          "y": 294
        },
        "type": "action"
      },
      {
        "id": "comp-605937",
        "data": {},
        "key": "event",
        "label": "Stop",
        "out": [],
        "in": [{
          "direction": "top",
          "source": "comp-295841"
        }],
        "position": {
          "x": 371,
          "y": 473
        },
        "type": "event"
      },
      {
        "id": "comp-342539",
        "data": {},
        "key": "event",
        "label": "Stop",
        "out": [],
        "in": [{
          "direction": "left",
          "source": "comp-103524"
        }],
        "position": {
          "x": 836,
          "y": 270
        },
        "type": "event"
      }
    ];
    document.addEventListener("updateLabel", this.customEvent.bind(this), false);
  }

  customEvent(e) {
    var FilterComponent = this.flows.find(function(flow){
      return flow.id === e.detail.componentId
    })
    var index = this.flows.indexOf(FilterComponent);
    FilterComponent.label = e.detail.value;
    this.flows[index] = FilterComponent;
  }

  zoom(e, key) {
    var delta;
    if (key === 'zoomIn') {
      delta = 120;
      this.workspace.style.transformOrigin = '50% 50% 0';
    } else if (key === 'zoomOut') {
      delta = -120
    } else {
      delta = (e.wheelDelta || -e.detail)
      this.workspace.style.transformOrigin = '0 0 0';
    }
    this.scrollTop += (delta < 0 ? 1 : -1) * 30;
    e.preventDefault();
    var oz = this.current.zoom,
      nz = this.current.zoom * (delta < 0 ? 0.9 : 1.2);
    if (nz < 1 || nz > 15) {
      return;
    }
    // calculate click at current zoom
    var ix = (e.layerX - this.current.x) / oz,
      iy = (e.layerY - this.current.y) / oz,
      // calculate click at new zoom
      nx = ix * nz,
      ny = iy * nz,
      // move to the difference
      // make sure we take mouse pointer offset into account!
      cx = (ix + (e.layerX - ix) - nx),
      cy = (iy + (e.layerY - iy) - ny);
    // update current
    this.current.zoom = nz;
    this.current.x = cx;
    this.current.y = cy;
    // make sure we scale before translate!
    var event = new CustomEvent("updateZoom", 	{
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
        x: (e.layerX - (this.current.x + 20)) / this.current.zoom,
        y: (e.layerY - (this.current.y + 20)) / this.current.zoom
      },
      type: droppedId
    };
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
    compChildren.push(this.getAvailableDirections().map((line) => this.addNode(line)));
    comp.out.map(line => this.createLineSVG(line));

    var wrappedComp = this.ce('div', {
      id: comp.id,
      style: wrapperStyle,
      on: {
        contextmenu: this.contextmenu.bind(this),
        dblclick: this.openModal.bind(this),
        mouseover: this.showNodes.bind(this),
        mouseleave: this.hideNodes.bind(this),
        mousedown: this.mouseDown.bind(this),
        mousemove: this.mouseMove.bind(this),
        mouseup: this.mouseEnd.bind(this)
      }
    }, this.ce('div', {
      class: 'drag-item',
      style: compStyle
    }, compChildren));
    this.component = null;
    return wrappedComp;
  }

  openModal(e) {
    const componentId = e ? e.target.parentElement.id : this.currentEventId;
    if (componentId.indexOf('comp') !== 0) {
      return;
    }
    this.flows.forEach((comp) => {
      if (comp.id === componentId) {
        this.component = comp;
      }
    });
    this.workspace.parentNode.appendChild(new Modal(this.component).open());
  }

  showNodes(e) {
    e.preventDefault();
    const componentId = e.target.parentElement.id;
    if (componentId.indexOf('comp') !== 0) {
      return;
    }
    this.flows.forEach((comp) => {
      if (comp.id === componentId) {
        this.component = comp;
      }
    });
    let tempDirections = ['top', 'right', 'bottom', 'left'];
    this.getAvailableDirections().map(direction => {
      tempDirections.splice(tempDirections.indexOf(direction), 1)
    });
    tempDirections.map(direction => {
      e.target.appendChild(this.addNode(direction, 'temp'));
    });
  }

  getAvailableDirections() {
    const availableDirections = [...this.component.out.map(line => (line.direction)), ...this.component.in.map(line => (line.direction))];
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
    this.component = null;
  }

  addNode(direction, isTemp) {
    var nodeStyle =
      'width: 15px; height: 15px; position: absolute; z-index: -1; border-radius: 50%; cursor: crosshair;';
    const calc = this.component.type === 'condition' ? 0 : 50;
    if (direction === 'top') {
      nodeStyle += `top: -8px; left: calc(${calc}% - 8px);`;
    } else if (direction === 'right') {
      nodeStyle += `right: -8px; top: calc(${calc}% - 8px);`;
    } else if (direction === 'bottom') {
      nodeStyle += `bottom: -8px; right: calc(${calc}% - 8px);`;
    } else {
      if (calc) {
        nodeStyle += `left: -8px; top: calc(${calc}% - 8px);`;
      }
    }
    var createdNode = this.ce('div', {
      id: 'node-' + `${this.component.id}-${direction}`,
      class: 'node-' + `${isTemp ? isTemp+' temp': this.component.id}`,
      style: nodeStyle,
      ['data-direction']: direction,
      on: {
        mousedown: this.mouseDown.bind(this),
        mousemove: this.mouseMove.bind(this),
        mouseup: this.mouseEnd.bind(this)
      }
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
    if (this.svg) {
      this.svg.remove();
      return;
    }
    if (e.target.parentElement.id.indexOf('comp') === 0) {
      this.element = e.target.parentElement;
      this.element.style.cursor = 'grabbing';
      this.flows.forEach((comp) => {
        if (comp.id === this.element.id) {
          this.component = comp;
        }
      });
      this.initCompMove(e);
      e.stopPropagation();
    } else if (e.target.parentElement.id.indexOf('node') === 0) {
      this.element = e.target.parentElement;
      this.flows.forEach((comp) => {
        if (this.element.id.indexOf(comp.id) >= 0) {
          this.component = comp;
          this.source = comp;
        }
      });
      e.target.parentElement.classList.remove('temp');
      this.initLineDraw(e);
      e.stopPropagation();
    } else {
      this.element = this.workspace;
      this.element.style.cursor = 'grabbing';
      this.initWorkspaceMove(e);
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
    this.element = null;
    this.component = null;
  }

  initWorkspaceMove(e) {
    const rect = document.getElementById('workspace').getBoundingClientRect();
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
  }

  initLineDraw(e) {
    const rect = document.getElementById('workspace').getBoundingClientRect();
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
    this.component.out.push(this.line);
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
    if (e) {
      this.workspace.appendChild(this.svg);
    } else {
      // TODO: remove after svg render
      console.log('e', this.svg, this.line);
      this.svg = null;
      this.line = null;
    }
  }

  endLineDraw(e) {
    this.offset = {};
    if (this.highlighted && this.highlighted.id.indexOf(this.element.id) < 0) {
      this.ce(this.svg.getElementById('path'), {
        ['stroke-dasharray']: ''
      });
      this.svg.style.cursor = 'default';
      e.target.parentElement.classList.remove('temp');
    } else {
      this.svg.remove();
      if (this.element.children.length < 2) {
        this.element.remove();
        this.element = null;
      }
    }
    this.line.destination = this.component.id;
    this.component.in.push({
      direction: this.highlighted.dataset.direction,
      source: this.source.id
    });
    this.source = null;
    this.svg = null;
    this.line = null;
    // TODO: remove after fetch
    console.log('flows', this.flows);
  }

  create() {
    this.workspace = this.ce('div', {
      id: 'workspace',
      on: {
        click:this.closeOptions.bind(this),
        wheel: this.zoom.bind(this),
        mousedown: this.mouseDown.bind(this),
        mousemove: this.mouseMove.bind(this),
        mouseup: this.mouseEnd.bind(this),
        drop: this.drop.bind(this),
        dragover: this.allowDrop.bind(this),
      }
    }, this.flows.map((component) => this.placeComponent(component)));
    return [this.workspace, this.createOptions()];
  }

  // Create options for zoomin, zoomout and reset screen size.
  createOptions() {
    const options = [this.ce('div', {
      style: 'position: absolute; top: 15px; right: 35px; width: 25px; height: 25px;',
    }, this.ce('button', {
      keys: {
        innerHTML: "&#8635"
      },
      on: {
        click: this.resetScreen.bind(this)
      }
    })), this.ce('div', {
      style: 'position: absolute; top: 45px; right: 15px; width: 25px; height: 25px;',
    }, this.ce('button', {
      keys: {
        innerHTML: "&#8853"
      },
      on: {
        click: (e) => this.zoom(e, "zoomIn")
      }
    })), this.ce('div', {
      style: 'position: absolute; top: 45px; right: 50px; width: 25px; height: 25px;',
    }, this.ce('button', {
      keys: {
        innerHTML: "&#8861"
      },
      on: {
        click: (e) => this.zoom(e, "zoomOut")
      }
    }))]
    return options;
  }

  // Reset screen size to default zoom.
  resetScreen(e) {
    var screen = document.getElementById('workspace')
    if (screen) {
      screen.setAttribute('style', '');
    }
    this.current = {
      x: 0,
      y: 0,
      zoom: 1
    }
  }

  // Provide options for deleting and editing the components
  contextmenu(e) {
    e.preventDefault();
    const componentId = e.target.parentElement.id;
    this.currentEventId = componentId;
    if (this.currentEventId !== 'workspace') {
      let listItems = [];
      if (componentId.search("line") === -1) {
        listItems.push(this.ce('li', {
            on: {
              click: this.deleteComponent.bind(this)
            },
            keys: {
              innerHTML: "Delete"
            }
          }),
          this.ce('li', {
            on: {
              click: this.editComponent.bind(this)
            },
            keys: {
              innerHTML: "Edit"
            }
          }))
      } else {
        listItems.push(this.ce('li', {
          on: {
            click: this.deleteComponent.bind(this)
          },
          keys: {
            innerHTML: "Delete"
          }
        }))
      }
      const deleteItem = document.getElementById('menuOptions');
      if (deleteItem) {
        deleteItem.remove();
      }
      var actionComponent = this.ce('div', {
        id: 'menuOptions',
        style: `transform: translate(${e.x}px, ${e.y}px)`
      }, this.ce('ul', {
        id: 'items'
      }, listItems))
      this.workspace.appendChild(actionComponent);
    }
  }

  // Delete the component
  deleteComponent(e) {
    const event = document.getElementById(this.currentEventId);
    if (event !== 'workspace') {
      event.remove();
      const deleteItem = document.getElementById('menuOptions');
      if (deleteItem) {
        deleteItem.remove();
      }
      this.flows.map((component,index) =>{
      if(component.id === this.currentEventId) {
        this.flows.splice(index, 1)
      }
      })
    }
  }

  // Close the menu options while clicking other than components.
  closeOptions(e){
    var menu = document.getElementById('menuOptions');
    if(menu){
    menu.remove();
   }
 }
  
  // Open the component Modal
  editComponent(e) {
    this.openModal();
  }
}
