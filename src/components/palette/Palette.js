import Base from '../base/Base';
import { Drawables } from '../drawables';
import FlowEmitter from '../event-emitter/EventEmitter';
import './palette.css';

export default class Palette extends Base {
  constructor() {
    super();
    this.palette = null;
    this.dragElem = null;
    this.zoom = 1;
    this.events = FlowEmitter;
    this.events.on('zoom', this.onZoom.bind(this));
  }

  onZoom(zoom) {
    this.zoom = zoom;
  }

  dragStart(e) {
    e.dataTransfer.setData('data', e.target.id);
    this.dragElem = e.target.cloneNode(true);
    this.ce(this.dragElem, {
      nativeStyle: {
        position: 'absolute',
        zIndex: -1,
        top: '100px',
        left: '100px',
        padding: 0
      }
    });
    this.dragElem.firstChild.style.transform = `scale(${this.zoom * 2})`;
    document.getElementById('workflow').appendChild(this.dragElem);
    e.dataTransfer.setDragImage(this.dragElem, 50 * this.zoom, 25 * this.zoom);
  }

  dragOver() {
    this.dragElem.remove();
  }

  getPaletteItems() {
    return Object.keys(Drawables.categories)
      .filter(category => (category !== 'strokes'))
      .map(category => this.ce('div', {
        class: 'category'
      }, [
        this.ce('div', {
          class: 'title',
          keys: {
            innerHTML: category
          }
        }),
        this.ce('div', {
          class: 'content'
        },
        Object.keys(Drawables.categories[category]).map(comp => this.ce('div', {
          id: comp,
          class: 'icon',
          draggable: true
        }, new Drawables.components[comp]().getIcon())))
      ]));
  }

  create() {
    this.palette = this.ce('div', {
      id: 'palette',
      class: 'palette',
      on: {
        dragstart: this.dragStart.bind(this),
        dragover: this.dragOver.bind(this)
      }
    }, [
      ...this.getPaletteItems()
    ]);
    return this.palette;
  }
}
