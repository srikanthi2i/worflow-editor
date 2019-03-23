import Base from '../base/Base';
import EventEmitter from '../EventEmitter/EventEmitter';
import '../modal/modal.css';

export default class Error extends Base {
  constructor(component, option) {
    super();
    this.eventEmitter = EventEmitter;
    this.component = component;
    this.option = option;
  }

  deleteComponent(){
    this.eventEmitter.emit('deleteComponent', {
      option: this.option,
    });
  }

  showErrorContent() {
    let value = this.ce('div', {}, [
      this.ce('span', {
        class: 'displayFlexEnd'
      }, [
        this.ce('button', {
          class: 'buttonStyle',
          keys: {
            innerHTML: '&#128465;'
          },
          on:{
            click:this.deleteComponent.bind(this)
          }
        })
      ]),
      this.ce('div', {
        style: 'text-align: center;padding: 100px;'
      }, [
        this.ce('span', {
          keys: {
            innerHTML: `No such component ${this.option.name}`
          }
        })
      ])
    ])
    document.getElementById('componentType').appendChild(value);
  }
}
