import Base from '../base/Base';
import EventEmitter from '../EventEmitter/EventEmitter';
import '../modal/modal.css';

export default class TextArea extends Base {

  constructor(component, option) {
    super();
    this.eventEmitter = EventEmitter;
    this.component = component;
    this.option = option;
  }

  deleteComponent() {
    this.eventEmitter.emit('deleteComponent', {
      option: this.option,
    });
  }

  enableTextAreaComponent() {
    let textValue = this.ce('div', {},
      [
        this.ce('span', {
          class: 'displayFlex'
        }, [
          this.ce('label', {
            style: 'font-size:12px;',
            keys: {
              innerHTML: this.option.key
            }
          }),
          this.ce('button', {
            class: 'buttonStyle',
            keys: {
              innerHTML: '&#128465;'
            },
            on: {
              click: this.deleteComponent.bind(this)
            }
          })
        ]),
        (!this.option.key &&
          this.ce('span', {},
            [this.ce('label', {
                keys: {
                  innerHTML: 'Key'
                }
              }),
              this.ce('input', {
                keys: {
                  type: 'text'
                },
                on: {
                  blur: this.updateTextAreaKey.bind(this)
                }
              }),

            ])),
        this.ce('span', {
            style: 'display:flex;align-items:center;'
          },
          [this.ce('label', {
              keys: {
                innerHTML: 'Value'
              }
            }),
            this.ce('textarea', {
              on: {
                blur: this.updateTextAreaValue.bind(this)
              }
            })
          ])
      ])
    if (!this.option.type) {
      this.option.type = "Text";
    }
    document.getElementById('componentType').appendChild(textValue);
  }

  updateTextAreaKey(e) {
    this.option.key = e.target.value;
  }

  updateTextAreaValue(e) {
    this.option.value = e.target.value;
    this.component.data[this.option.key] = e.target.value;
  }
}
