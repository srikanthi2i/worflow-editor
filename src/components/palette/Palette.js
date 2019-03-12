import Base from '../base/Base';
import EventEmitter from '../EventEmitter/EventEmitter';
import './palette.css';

export default class Palette extends Base {
  constructor() {
    super();
    this.eventEmitter = EventEmitter.getInstance();
    this.palette;
    this.dragElem;
    this.zoom = 1;
    this.eventEmitter.subscribe('onZoom', this.onZoom.bind(this));
  }

  onZoom(e) {
    this.zoom = e.detail.zoom;
  }

  dragStart(e) {
    var dropStyle = 'width: 100px; height: 100px;';
    e.dataTransfer.setData('data', e.target.id);
    this.dragElem = e.target.cloneNode(true);
    this.ce(this.dragElem, {
      nativeStyle: {
        position: 'absolute',
        zIndex: -1,
        top: '100px',
        left: '100px'
      }
    });
    if (e.target.id === 'event') {
      dropStyle += `border-radius: 50%; transform: scale(${this.zoom});`;
    } else if (e.target.id === 'action') {
      dropStyle += `height: 50px; transform: scale(${this.zoom});`;
    } else {
      dropStyle += `transform: rotate(45deg) scale(${this.zoom});`;
    }
    this.ce(this.dragElem.getElementsByClassName("drag-item")[0], {
      style: dropStyle,
    });
    document.getElementById('workflow').appendChild(this.dragElem);
    e.dataTransfer.setDragImage(this.dragElem, 50, 25);
  }

  dragOver(e) {
    this.dragElem.remove();
  }

  create() {
    this.palette = this.ce('div', {
      id: 'palette',
      class: 'palette',
    }, [
      this.ce('div', {
        id: 'event',
        draggable: true,
        on: {
          dragstart: this.dragStart.bind(this),
          dragover: this.dragOver.bind(this)
        }
      }, this.ce('div', {
        class: 'drag-item',
        style: 'margin-top: 5px; border-radius: 50%;'
      })),
      this.ce('div', {
        id: 'action',
        draggable: true,
        on: {
          dragstart: this.dragStart.bind(this),
          dragover: this.dragOver.bind(this)
        }
      }, this.ce('div', {
        class: 'drag-item',
        style: 'margin-top: 5px; height: 25px;'
      })),
      this.ce('div', {
        id: 'condition',
        draggable: true,
        on: {
          dragstart: this.dragStart.bind(this),
          dragover: this.dragOver.bind(this)
        }
      }, this.ce('div', {
        class: 'drag-item',
        style: 'margin-top: 5px; transform: rotate(45deg) scale(0.75)'
      }))
    ]);
    return this.palette;
  }
}
