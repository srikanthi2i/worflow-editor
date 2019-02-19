import Base from '../base/Base';
import './palette.css';

export default class Palette extends Base {
  constructor() {
    super();
    this.palette;
    this.dragElem;
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
      dropStyle += `border-radius: 50%; transform: scale(1);`;
    } else if (e.target.id === 'action') {
      dropStyle += `height: 50px; transform: scale(1);`;
    } else {
      dropStyle += `transform: rotate(45deg) scale(1);`;
    }
    this.ce(this.dragElem.getElementsByClassName("drag-item")[0], {
      style: dropStyle,
    });
    document.getElementById('workflow').appendChild(this.dragElem);
    e.dataTransfer.setDragImage(this.dragElem, 20, 20);
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
