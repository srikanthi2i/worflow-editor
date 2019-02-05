import Base from '../base/Base';
import './palette.css';

export default class Palette extends Base {
  constructor() {
    super();
    this.palette;
    this.create();
    this.dragElem;
    this.dragComponent.bind(this);
    this.dragOverComponent.bind(this);
    return this.palette;
  }

  dragComponent(e) {
    console.log('dragComponent', e);
    e.dataTransfer.setData('data', e.target.id);
    if (e.target.id === 'event') {

      this.dragElem = e.target.cloneNode(true);
      this.dragElem.style.position = "absolute";
      this.dragElem.style.width = "10px";
      this.dragElem.style.height = "10px";
      this.dragElem.style.top = "100px";
      this.dragElem.style.left = "100px";
      this.dragElem.style.zIndex = -1;

      var inner = this.dragElem.getElementsByClassName("drag-item")[0];
      inner.style.position = "absolute";
      inner.style.width = "100px";
      inner.style.height = "100px";
      inner.style.top = "0px";
      inner.style.left = "0px";
      inner.style.backgroundColor = "orange";
      inner.style.transform = `scale(${current.zoom})`;

      document.body.appendChild(this.dragElem);
      e.dataTransfer.setDragImage(this.dragElem, 20, 20);
    }
  }

  dragOverComponent(e) {
    this.dragElem.remove();
    console.log('dragOverComponent', e, this.dragElem);
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
          drag: this.dragComponent,
          dragover: this.dragOverComponent
        }
      }, this.ce('div', {
        class: 'drag-item',
        style: 'border-radius: 50%;'
      })),
      this.ce('div', {
        id: 'action',
        draggable: true,
        on: {
          drag: this.dragComponent,
          dragover: this.dragOverComponent
        }
      }, this.ce('div', {
        class: 'drag-item',
        style: 'height: 25px;'
      })),
      this.ce('div', {
        id: 'condition',
        draggable: true,
        on: {
          drag: this.dragComponent,
          dragover: this.dragOverComponent
        }
      }, this.ce('div', {
        class: 'drag-item',
        style: 'transform: rotate(45deg) scale(0.75)'
      }))
    ]);
  }
}