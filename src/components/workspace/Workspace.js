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
      id: 'comp-12345',
      data: {},
      key: '',
      label: 'Start',
      out: [{
        direction: 'top',
        destination: '',
        completed: true,
        height: 10,
        points: [{
          x: 0,
          y: 20
        }],
        position: {
          x: '',
          y: ''
        },
        width: 250
      }],
      in: [{
        direction: 'right',
        source: '',
      }, {
        direction: 'right',
        source: '',
      }],
      position: {
        x: 50,
        y: 50
      },
      type: 'event'
    }];
  }

  zoom(e) {
    var delta = e.wheelDelta || -e.detail;
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
    this.flows.push(component);
    this.workspace.appendChild(this.placeComponent(component));
    this.workspace.parentNode.appendChild(new Modal(component).open());
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
        `transform: translate(${comp.position.x += 20}px, ${comp.position.y += 20}px) rotate(45deg)`;
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

    var wrappedComp = this.ce('div', {
      id: comp.id,
      style: wrapperStyle,
      on: {
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
    const componentId = e.target.parentElement.id;
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
    if (this.svg) {
      this.svg.remove();
      return;
    }
    e.preventDefault();
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
      this.drawLine(e);
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
      x: (1 - e.offsetX) * this.current.zoom * 1.5,
      y: (1 - e.offsetY) * this.current.zoom * 1.5
    }
    this.offset.x = e.x + correction.x;
    this.offset.y = e.y + correction.y;
    const line = {
      id: 'line' + this.component + '-' + this.component.out.length,
      direction: this.element.dataset.direction,
      destination: '',
      position: {
        x: (this.offset.x - rect.x) / this.current.zoom,
        y: (this.offset.y - rect.y) / this.current.zoom
      },
      height: 15,
      width: 15,
      points: [{
        x: 0,
        y: 0
      }],
      completed: false
    }
    this.component.out.push(line);
    this.createLineSVG(line);
  }
  
  createLineSVG(line) {
    this.svg = this.ce({
      namespace: 'http://www.w3.org/2000/svg',
      tag: 'svg'
    }, {
      id: line.id,
      style: 'position: absolute; z-index: -2; cursor: crosshair;' +
        `transform: translate(${line.position.x}px, ${line.position.y}px);`,
      width: line.width,
      height: line.height
    }, this.ce({
      namespace: 'http://www.w3.org/2000/svg',
      tag: 'path'
    }, {
      id: 'path-1',
      nativeStyle: {
        strokeWidth: 3,
        opacity: 1,
        fill: 'none'
      }
    }));
  }

  drawLine(e) {
    this.line;
    if (Object.keys(this.offset).length) {
      const displaceX = (e.x - this.offset.x) / this.current.zoom;
      const displaceY = (e.y - this.offset.y) / this.current.zoom;
      let points;
      const currDirection = this.element.dataset.direction;
      switch (currDirection) {
        case 'top':
          this.svg.style.top = `${displaceY}`;
          points = `M 10 ${(displaceY*-1)} l 0 ${displaceY-1*this.current.zoom}`;
          break;
        case 'right':
          points = `M 0 10 l ${displaceX+1*this.current.zoom} 0`;
          break;
        case 'bottom':
          points = `M 10 0 l 0 ${displaceY+1*this.current.zoom}`;
          break;
        case 'left':
          this.svg.style.left = `${displaceX}`;
          points = `M ${(displaceX*-1)} 10 l ${displaceX-1*this.current.zoom} 0`;
          break;
        default:
          break;
      }
      this.svg.setAttribute('height', displaceY > 0 ? displaceY + 10 : (displaceY * -1) + 10);
      this.svg.setAttribute('width', displaceX > 0 ? displaceX + 10 : (displaceX * -1) + 10);
      const newPath = this.ce(this.svg.getElementsByTagName('path')[0], {
        stroke: 'orangered',
        ['stroke-dasharray']: '5,5',
        d: points,
      });
      this.line = {
        x: 60,
        y: 5
      }
      this.svg.appendChild(newPath);
      this.workspace.appendChild(this.svg);
    }
  }

  endLineDraw(e) {
    this.offset = {};
    if (this.highlighted && this.highlighted.id.indexOf(this.element.id) < 0) {
      const newPath = this.ce(this.svg.getElementsByTagName('path')[0], {
        ['stroke-dasharray']: ''
      });
      this.svg.appendChild(newPath);
      const topArrow = `M 5 50 L 10 32.5  L 15 50 z`;
      const rightArrow = `M 50 5 L 62.5 10  L 50 15 z`;
      const bottomArrow = `M 5 50 L 10 62.5  L 15 50 z`;
      const leftArrow = `M50 5 L 37.5 10  L 50 15 z`;
      const arrow = this.ce({
        namespace: 'http://www.w3.org/2000/svg',
        tag: 'path'
      }, {
        id: 'arrow',
        nativeStyle: {
          strokeWidth: 3,
          opacity: 1,
          stroke: 'black'
        },
        d: bottomArrow,
      });
      console.log(arrow);
      this.svg.appendChild(arrow);
      this.svg.style.cursor = 'default';
      e.target.parentElement.classList.remove('temp');
    } else {
      this.svg.remove();
      if (this.element.children.length < 2) {
        this.element.remove();
        this.element = null;
      }
    }
    this.svg = null;
  }

  create() {
    this.workspace = this.ce('div', {
      id: 'workspace',
      on: {
        wheel: this.zoom.bind(this),
        mousedown: this.mouseDown.bind(this),
        mousemove: this.mouseMove.bind(this),
        mouseup: this.mouseEnd.bind(this),
        drop: this.drop.bind(this),
        dragover: this.allowDrop.bind(this),
      }
    }, this.flows.map((component) => this.placeComponent(component)));
    return this.workspace;
  }
}