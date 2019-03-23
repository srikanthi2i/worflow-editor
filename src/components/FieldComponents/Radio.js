import Base from '../base/Base';
import EventEmitter from '../EventEmitter/EventEmitter';
import * as CommonUtils from '../Common/CommonUtils';
import '../modal/modal.css';

export default class Radio extends Base {
  constructor(component, option) {
    super();
    this.eventEmitter = EventEmitter;
    this.component = component;
    this.option = option;
    this.radio = {};
    this.currentKey;
  }

  //Enable Radio components
  enableRadioComponent() {
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
                  blur: this.updateRadioKey.bind(this)
                }
              }),
            ])),
        (!this.option.value &&
          this.ce('span', {},
            [this.ce('label', {
                keys: {
                  innerHTML: 'Label'
                }
              }),
              this.ce('input', {
                keys: {
                  type: 'text'
                },
                on: {
                  blur: this.updateRadioLabel.bind(this)
                }
              }),
            ])),
        (!this.option.value &&
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
                  blur: this.updateRadioName.bind(this)
                }
              }),
            ])),
        this.ce('span', {
            class: 'displayFlexSpace'
          },
          [
            this.ce('span', {
              id: 'radioContent',
              style: 'width:100%;'
            })
          ])
      ])
    document.getElementById('componentType').appendChild(textValue);
  }

  updateRadioKey(e) {
    if (e.target.value !== '') {
      this.option.key = e.target.value;
    }
  }

  updateRadioLabel(e) {
    if (e.target.value !== '') {
      this.radio[e.target.value] = '';
      this.currentKey = e.target.value;
    }
  }


  deleteComponent() {
    this.eventEmitter.emit('deleteComponent', {
      option: this.option,
    });
  }

  updateRadioName(e) {
    if (e.target.value !== '') {
      Object.keys(this.radio).map(item => {
        if (item === this.currentKey) {
          this.radio[item] = e.target.value;
        }
      })
      this.currentKey = '';
      this.generateRadioButton();
    }
  }

  //Populate radio button based on the given values.
  generateRadioButton() {
    let radioContent = document.getElementById('radioContent');
    CommonUtils.removeAllChildren(radioContent);
    Object.keys(this.radio).map(item => {
      let value =
        this.ce('span', {
          style: 'padding: 5px;'
        }, [
          this.ce('input', {
            id: `radio-${this.radio[item]}`,
            keys: {
              type: "radio",
              value: this.radio[item],
              name: this.option.key
            },
            on: {
              click: this.updateRadioButtonValue.bind(this)
            }
          }),
          this.ce('span', {
            keys: {
              for: `radio-${this.radio[item]}`,
              innerHTML: this.radio[item]
            }
          })
        ])
      document.getElementById('radioContent').appendChild(value)
    })
  }

  //Update the selected radio button value to the option.
  updateRadioButtonValue(e) {
    this.component.data[this.option.key] = e.target.id.split('-')[1];
  }
}
