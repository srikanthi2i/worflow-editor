import Base from '../base/Base';
import EventEmitter from '../event-emitter/EventEmitter';
import '../modal/modal.css';

export default class TextField extends Base {

  constructor(component, option) {
    super();
    this.eventEmitter = EventEmitter;
    this.component = component;
    this.option = option;
  }

  //Text field components
  enableTextFieldComponent() {
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

        (!this.option.type &&
          this.ce('span', {}, [
            this.ce('label', {
              keys: {
                innerHTML: 'Type'
              }
            }), this.ce('select', {
                class: 'select',
                id: 'componentSelect',
                on: {
                  change: this.changeComponentType.bind(this)
                }
              },
              this.addTextFieldTypeOptions())

          ])),
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
                  blur: this.updateTextFieldKey.bind(this)
                }
              }),

            ])),
        this.ce('span', {},
          [this.ce('label', {
              keys: {
                innerHTML: 'Value'
              }
            }),
            this.ce('input', {
              id: `inputField${this.option.key ? `-${this.option.key}` : ''}`,
              keys: {
                type: this.option.type ? this.option.type : 'text'
              },
              on: {
                blur: this.updateTextFieldValue.bind(this)
              }
            })
          ])
      ])
    if (!this.option.type) {
      this.option.type = "Text";
    }
    document.getElementById('componentType').appendChild(textValue);
  }

  deleteComponent() {
    this.eventEmitter.emit('deleteComponent', {
      option: this.option,
    });
  }

  updateTextFieldKey(e) {
    this.option.key = e.target.value;
  }

  updateTextFieldValue(e) {
    this.option.value = e.target.value;
    this.component.data[this.option.key] = e.target.value;
  }

  changeComponentType() {
    let value = document.getElementById("componentSelect").selectedOptions[0].value;
    this.option.type = value;
    if (document.getElementById(`inputField${this.option.key ? `-${this.option.key}` : ''}`)) {
      document.getElementById(`inputField${this.option.key ? `-${this.option.key}` : ''}`).value = '';
      document.getElementById(`inputField${this.option.key ? `-${this.option.key}` : ''}`).type = value;
    }
  }

  addTextFieldTypeOptions() {
    let options = [];
    ['Text', 'Number', 'Password'].map(item => {
      let value = this.ce('option', {
        keys: {
          innerHTML: item,
          value: item
        }
      })
      options.push(value)
    })
    return options;
  }

}
