import Base from '../base/Base';
import EventEmitter from '../event-emitter/EventEmitter';
import './modal.css';

export default class Modal extends Base {
  constructor(schema, options) {
    super();
    this.schema = { ...schema };
    this.options = options;
    this.events = EventEmitter;
    this.element = null;
    this.currentTab = 0;
    this.setTab();
    this.loadAceJs();
  }

  get tabs() {
    this._tabs = [
      {
        title: 'display',
        content: this.ce('div', {},
          [
            this.ce('div', {
              class: 'field'
            },
            [
              this.ce('label', {
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
                  value: this.schema.label
                }
              })
            ]),
            this.ce('div', {
              class: 'field'
            },
            [this.ce('label', {
              keys: {
                innerHTML: 'Key'
              }
            }), this.ce('input', {
              id: `${this.schema.id}-key`,
              on: {
                keyup: this.updateSchemaKey.bind(this)
              },
              keys: {
                type: 'text',
                value: this.makeFirstLetterLowerCase(this.schema.key)
              }
            })]),
            this.ce('div', {
              class: 'field'
            },
            [this.ce('label', {
              keys: {
                innerHTML: 'Type'
              }
            }), this.ce('label', {
              id: `${this.schema.id}-Type`,
              keys: {
                innerHTML: this.schema.type
              }
            })])
          ])
      },
      {
        title: 'data',
        content: this.ce('div', {
          class: 'field',
          style: 'overflow-y: auto;max-height: 330px;',
        },
        [
          this.ce('span', {}, [
            this.ce('label', {
              class: 'data',
              keys: {
                innerHTML: 'Data'
              }
            }),
            this.editor
          ])
        ])
      },
      {
        title: 'custom',
        content: this.ce('div', {},
          [this.ce('div', {
            class: 'field under-construction',
            id: 'customKeys'
          },
          [
            this.ce('input', {
              class: 'input-style',
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
              class: 'input-style',
              keys: {
                id: 'valueLabel',
                type: 'text',
                placeholder: 'Value',
              },
            }),
            this.ce('button', {
              class: 'add-key',
              keys: {
                innerHTML: '&#10133;',
              },
              on: {
                click: this.addCustomKey.bind(this)
              }
            })
          ])
          ])
      }
    ];
    return this._tabs;
  }

  loadAceJs() {
    const head = document.getElementsByTagName('head')[0];
    const script = this.ce('script', {
      type: 'text/javascript',
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ace/1.4.2/ace.js',
      on: {
        load: this.initAce.bind(this)
      }
    });
    this.ac(head, script);
    this.editor = this.ce('div', { id: 'editor' });
  }

  initAce() {
    const editor = ace.edit(this.editor);
    editor.setValue('{}');
    editor.setOptions({
      highlightActiveLine: false,
      minLines: 20,
      tabSize: 2
    });
    editor.getSession().on('change', () => {
      this.schema.data = JSON.parse(editor.getValue());
    });
  }

  getCloseButton() {
    return this.ce('div', {
      class: 'modal-close',
      on: {
        click: this.close.bind(this)
      }
    }, this.ce('span', {
      style: 'color: black; cursor: pointer;',
      keys: {
        innerHTML: '&#8609;'
      }
    }));
  }

  setCurrentTab(e) {
    const targetTab = e.target.dataset.tab || e.target.parentElement.dataset.tab;
    this.currentTab = parseInt('0x', targetTab);
    const parent = this.tabContainer.parentElement;
    this.tabContainer.remove();
    this.setTab();
    this.ac(parent, this.tabContainer);
  }

  getTabHeaders() {
    return this.ce('div', {
      class: 'tab-headers'
    }, this.tabs.map((tab, i) => this.ce('div', {
      class: `tab-header ${this.currentTab === i ? 'active' : ''}`,
      'data-tab': i,
      id: tab.title,
      on: {
        click: this.setCurrentTab.bind(this)
      }
    }, this.ce('span', {
      keys: {
        innerHTML: tab.title
      }
    }))));
  }

  getTabContent() {
    return this.ce('div', {
      class: 'tab-content'
    }, this.tabs[this.currentTab].content);
  }

  // Make the given string to camel case
  camelize(str) {
    return str.replace(/\W+(.)/g, (match, chr) => chr.toUpperCase());
  }

  // Make the first letter of the given string to lower case
  makeFirstLetterLowerCase(string) {
    return this.camelize(string.charAt(0).toLowerCase() + string.slice(1));
  }

  changeCustomValue(e) {
    //
  }

  checkDuplicateKey(e) {
    //
  }

  addCustomKey(e) {
    //
  }

  updateLabel(e) {
    this.schema.label = e.target.value;
    this.events.emit('schemaChange', this.schema);
    //
  }

  updateSchemaKey(e) {
    //
  }

  save() {
    //
  }

  cancel() {
    //
  }

  setTab() {
    this.tabContainer = this.ce('div', {
      class: 'tabs-container'
    }, [
      this.getTabHeaders(),
      this.getTabContent(),
      this.getActionButtons()
    ]);
  }

  getActionButtons() {
    return this.ce('div', {},
      [this.ce('button', {
        class: 'save-btn',
        id: 'save-btn',
        keys: {
          innerHTML: 'Save',
        },
        on: {
          click: this.save.bind(this)
        }
      }),
      this.ce('button', {
        class: 'save-btn delete-btn',
        id: 'delete-btn',
        keys: {
          innerHTML: 'Cancel',
        },
        on: {
          click: this.cancel.bind(this)
        }
      })
      ]);
  }

  setModalElement() {
    this.element = this.ce('div', {
      class: 'modal',
    }, [
      this.getCloseButton(),
      this.ce('div', {
        class: 'modal-title',
        keys: {
          innerHTML: `${this.schema.type} schema`
        }
      }),
      this.tabContainer
    ]);
  }

  open() {
    this.setModalElement();
    const timeout = setTimeout(() => {
      this.element.style.height = '500px';
      clearTimeout(timeout);
    }, 1);
    return this.element;
  }

  close() {
    this.element.innerHTML = '';
    this.element.style.height = 0;
    const timeout = setTimeout(() => {
      this.element.remove();
      clearTimeout(timeout);
    }, 1000);
  }
}
