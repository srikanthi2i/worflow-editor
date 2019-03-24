import Base from '../base/Base';
import EventEmitter from '../event-emitter/EventEmitter';
import './modal.css';

export default class Modal extends Base {
  constructor(component, options) {
    super();
    this.component = component;
    this.options = options;
    this.events = EventEmitter;
    this.clone = {
      ...this.component
    };
    this.currentTab;
    this.keys = {};
    this.modal;
    this.prevActiveTab;
    this.prevCustomKey = '';
    this.getTabContent('display');
    this.loadAceJs();
  }

  loadAceJs() {
    let head = document.getElementsByTagName('head')[0];
    let script = this.ce('script', {
      type: 'text/javascript',
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.2/ace.js',
      on: {
        load: this.initAce.bind(this)
      }
    });
    this.ac(head, script);
    this.editor = this.ce('div', {
      id: 'editor',
      keys: {
        innerHTML: "{}"
      }
    });
  }

  initAce() {
    let editor = ace.edit(this.editor);
    editor.setOptions({
      "highlightActiveLine": false,
      "minLines": 20,
      "tabSize": 2
    });
    editor.getSession().on('change', function () {});
  }

  open() {
    this.prevActiveTab = "display";
    this.modal = this.ce('div', {
      class: 'modal',
    }, [this.ce('div', {
        class: 'modal-close',
        on: {
          click: this.close.bind(this)
        }
      }, this.ce('span', {
        style: 'color: black; cursor: pointer;',
        keys: {
          innerHTML: '&#8609;'
        }
      })),
      this.ce('div', {
        class: 'modal-title',
        keys: {
          innerHTML: this.component.type + ' Component'
        }
      }),
      this.ce('div', {
        class: 'tabs-container'
      }, [this.ce('div', {
          class: 'tab-headers'
        }, [this.ce('div', {
            class: 'tab-header active',
            ['data-tab']: 'display',
            id: 'display',
            on: {
              click: this.setTabContent.bind(this)
            }
          }, this.ce('span', {
            keys: {
              innerHTML: 'Display'
            }
          })), this.ce('div', {
            class: 'tab-header',
            ['data-tab']: 'data',
            id: 'data',
            on: {
              click: this.setTabContent.bind(this)
            }
          }, this.ce('span', {
            keys: {
              innerHTML: 'Data'
            }
          })),
          this.ce('div', {
            class: 'tab-header',
            ['data-tab']: 'custom',
            id: 'custom',
            on: {
              click: this.setTabContent.bind(this)
            }
          }, this.ce('span', {
            keys: {
              innerHTML: 'Custom'
            }
          }))
        ]),
        this.ce('div', {
          class: 'tab-content'
        }, this.tabContent)
      ])
    ]);
    const timeout = setTimeout(() => {
      this.modal.style.height = '500px';
      this.enableSubmit();

      clearTimeout(timeout)
    }, 1);
    return this.modal;
  }

  close() {
    this.modal.innerHTML = "";
    this.modal.style.height = 0;
    const timeout = setTimeout(() => {
      this.modal.remove();
      clearTimeout(timeout)
    }, 1000);
  }

  setTabContent(e) {
    let element;
    if (e.target.classList.contains('tab-header')) {
      element = e.target;
    } else if (e.target.parentElement.classList.contains('tab-header')) {
      element = e.target.parentElement;
    }
    let selectedOption = this.ge(this.prevActiveTab);
    selectedOption.classList.remove('active');
    this.prevActiveTab = element.dataset.tab;
    let activeOption = this.ge(element.dataset.tab);
    activeOption.classList = "tab-header active"
    this.tabContent.replaceWith(this.getTabContent(element.dataset.tab));
    ace.edit(this.editor);
    // For populating component custom
    if (this.ge('customKeys')) {
      if (this.component['custom']) {
        this.keys = {
          ...this.component['custom']
        };
        this.showKeys(this);
      }
    }
  }

  getTabContent(tab) {
    this.currentTab = tab;
    if (tab === 'display') {
      this.tabContent = this.ce('div', {}, [this.ce('div', {}, [this.ce('div', {
            class: 'field'
          },
          [this.ce('label', {
              keys: {
                innerHTML: 'Label'
              }
            }),
            this.ce('input', {
              on: {
                keyup: this.updateLabel.bind(this),
              },
              keys: {
                type: 'text',
                value: this.component.label
              }
            })
          ]
        ), this.ce('div', {
            class: 'field'
          },
          [this.ce('label', {
            keys: {
              innerHTML: 'Key'
            }
          }), this.ce('input', {
            id: `${this.component.id}-key`,
            on: {
              keyup: this.updateComponentKey.bind(this)
            },
            keys: {
              type: 'text',
              value: this.makeFirstLetterLowerCase(this.component.key)
            }
          })]
        ),
        this.ce('div', {
            class: 'field'
          },
          [this.ce('label', {
            keys: {
              innerHTML: 'Type'
            }
          }), this.ce('label', {
            id: `${this.component.id}-Type`,
            keys: {
              innerHTML: this.component.type
            }
          })]
        )
      ])]);
    } else if (tab === 'data') {
      this.tabContent = this.ce('div', {
          class: 'field',
          style: 'overflow-y: auto;max-height: 330px;',
        },
        [
          (!this.options && this.ce('span', {}, [
            this.ce('label', {
              class: 'data',
              keys: {
                innerHTML: 'Data'
              }
            }),
            this.editor
          ]))
        ])
    } else {
      this.tabContent = this.ce('div', {},
        [this.ce('div', {
              class: 'field under-construction',
              id: 'customKeys'
            },
            [this.ce('input', {
              class: 'inputStyle',
              keys: {
                  id: 'keyLabel',
                  type: 'text',
                  placeholder: 'Key',
                },
                on: {
                  blur: this.checkDuplicateKey.bind(this),
                  keyup: this.changeCustomValue.bind(this)
                }
              }),
              this.ce('input', {
                class: 'inputStyle',
                keys: {
                  id: 'valueLabel',
                  type: 'text',
                  placeholder: 'Value',
                },
              }),
              this.ce('button', {
                class: 'addKey',
                keys: {
                  innerHTML: "&#10133;",
                },
                on: {
                  click: this.addKey.bind(this)
                }
              })
            ]
          ),
          this.ce('div', {
            class: 'field allCustom',
            style: 'overflow-y: auto;max-height: 260px;',
            id: 'allCustom'
          })
        ]);
    }
    return this.tabContent;
  }

  // Check whether duplicate value for the given key
  checkDuplicateKey(e) {
    if (this.keys &&
      Object.keys(this.keys).indexOf(e.target.value) !== -1) {
      this.ge('keyLabel').value = '';
      this.ge('valueLabel').value = '';
    }
  }

  //Change value for custom value
  changeCustomValue(e) {
    this.ge('valueLabel').value = e.target.value;
  }

  // Enable save button
  enableSubmit() {
    let buttons;
    if (!this.ge('saveButton')) {
      buttons = this.ce('div', {},
        [this.ce('button', {
            class: 'saveButton',
            id: 'saveButton',
            keys: {
              innerHTML: "Save",
            },
            on: {
              click: this.saveKeys.bind(this)
            }
          }),
          this.ce('button', {
            class: 'saveButton',
            style: '  border: 1px solid red;color:red;',
            id: 'deleteButton',
            keys: {
              innerHTML: "Cancel",
            },
            on: {
              click: this.cancel.bind(this)
            }
          })
        ])
      document.getElementsByClassName('tab-content')[0].parentElement.appendChild(buttons);
    }
  }

  // Make the given string to camel case
  camelize(str) {
    return str.replace(/\W+(.)/g, function (match, chr) {
      return chr.toUpperCase();
    });
  }

  // Make the first letter of the given string to lower case
  makeFirstLetterLowerCase(string) {
    return this.camelize(string.charAt(0).toLowerCase() + string.slice(1));
  }

  //Drop all the component changes
  cancel() {
    this.component.label = this.clone.label;
    // this.component.key = this.clone.key;
    this.currentTab === 'display' && this.updateLabel(null, this.component.label)
    this.close();
  }

  // Add the key and value
  addKey() {
    if (this.ge('keyLabel').value !== '' &&
      this.ge('valueLabel').value !== '') {
      const key = this.ge('keyLabel').value;
      const value = this.ge('valueLabel').value;
      this.keys[key] = value;
      this.ge('keyLabel').value = '';
      this.ge('valueLabel').value = '';
      this.showKeys();
    }
  }

  // Populate the keys in the arrray.
  showKeys() {
    let labels;
    Object.keys(this.keys).map(item => {
      labels =
        this.ce('div', {
            id: item,
          },
          [
            this.ce('input', {
              class: 'inputStyle',
              keys: {
                type: 'text',
                value: item
              },
              on: {
                blur: this.saveUpdatedKey.bind(this),
                click: this.updateKey.bind(this),
              }
            }),
            this.ce('input', {
              class: 'inputStyle',
              keys: {
                type: 'text',
                value: this.keys[item]
              },
              on: {
                keyup: this.updateValue.bind(this)
              }
            }),
            this.ce('button', {
              class: 'deleteKey',
              keys: {
                innerHTML: "+",
              },
              on: {
                click: this.deleteKey.bind(this)
              }
            })
          ])
      if (this.ge(item)) {
        this.ge(item).remove();
      }
      this.ge('allCustom').appendChild(labels);
    })
  }

  saveKeys() {
    this.component.custom = this.keys;
    this.component.key = this.clone.key;
    this.events.emit('addCustomKeys', {
      component: this.component,
    });
    this.events.emit('componentUpdate', {
      componentId: this.component.id,
      value: this.component.label
    });
    this.keys = {};
    this.close();
  }

  // Stores the previous value to the global variables for updating
  updateKey(e) {
    this.prevCustomKey = e.target.value;
  }

  // Update the given key with the existing key
  saveUpdatedKey(e) {
    if (e.target.value === '') {
      e.target.value = this.prevCustomKey;
    } else {
      if (Object.keys(this.keys).indexOf(e.target.value) !== -1) {
        e.target.value = this.prevCustomKey;
      } else {
        const value = this.keys[this.prevCustomKey];
        if (delete this.keys[this.prevCustomKey]) {
          this.keys[e.target.value] = value;
        }
        this.ge(this.prevCustomKey).id = e.target.value;
      }
    }
  }

  // Update the given value with the existing value.
  updateValue(e) {
    this.keys[e.target.parentElement.id] = e.target.value;
  }

  // Allows to delete a particular row
  deleteKey(e) {
    if (delete this.keys[e.target.parentElement.id]) {
      this.ge(e.target.parentElement.id).remove();
    }
  }

  // Update the component key.
  updateComponentKey(e) {
    this.clone.key = e.target.value
  }

  // Update the component label
  updateLabel(e, key) {
    let componentId = this.component.id;
    let child = this.ge(componentId).children[1].children[0];
    let componentType = this.ge(`${this.component.id}-key`);
    let value = e ? e.target.value : key;
    componentType.value = this.makeFirstLetterLowerCase(value);
    child.innerHTML = e ? e.target.value : key;
    child.title = e ? e.target.value : key;
    this.component.label = e ? e.target.value : key;
    this.clone.key = e ? e.target.value : key;
  }
}
