import Base from '../base/Base';
import EventEmitter from '../event-emitter/EventEmitter';
import '../modal/modal.css';

export default class CheckBox extends Base {
  constructor(component, option) {
    super();
    this.eventEmitter = EventEmitter;
    this.component = component;
    this.option = option;
    this.checkBoxValues = [];
  }

  //Enable checkbox components
  enableCheckBoxComponent() {
    let textValue = this.ce('div', {},
      [
        this.ce('span', {
          class:'displayFlex'
        }, [
          this.ce('label', {
            style: 'font-size:12px;',
            keys: {
              innerHTML: this.option.key
            }
          }),
          this.ce('button', {
           class:'buttonStyle',
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
                  blur: this.updateSelectKey.bind(this)
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
              keys: {
                type: 'text'
              },
              on: {
                blur: this.updateChecKBoxKey.bind(this)
              }
            }),
          ]),
        this.ce('span', {
            class: 'displayFlexSpace'
          },
          [
            this.ce('span', {
              id: 'checkBoxContent',
              style: 'width:100%;'
            })
          ])
      ])
    document.getElementById('componentType').appendChild(textValue);
  }

  deleteComponent() {
    this.eventEmitter.emit('deleteComponent', {
      option: this.option,
    });
  }

  //Add key to the option if given
  updateSelectKey(e) {
    if (e.target.value !== '') {
      this.option.key = e.target.value;
    }
  }

  //Add checkbox value
  updateChecKBoxKey(e) {
    if (e.target.value !== '') {
      this.checkBoxValues.indexOf(e.target.value) === -1 && this.checkBoxValues.push(e.target.value)
      let checkBoxContent = document.getElementById('checkBoxContent');
      this.removeAllChildren(checkBoxContent);
      e.target.value = '';
      this.checkBoxValues.map(item => {
        let value = this.ce('span', {
          style: 'padding: 5px;'
        }, [
          this.ce('input', {
            id: `checkBox-${item}`,
            keys: {
              type: "checkbox"
            },
            on: {
              click: this.updateCheckBoxValue.bind(this)
            }
          }),
          this.ce('span', {
            id: `label-${item}`,

            keys: {
              innerHTML: item
            }
          })
        ])
        document.getElementById('checkBoxContent').appendChild(value);
      })
    }
  }

  //Update the selected checkbox to the option
  updateCheckBoxValue(e) {
    let values = this.component.data[this.option.key] || [];
    values.push((e.target.id.split('-')[1]))
    this.component.data[this.option.key] = values;
  }
}
