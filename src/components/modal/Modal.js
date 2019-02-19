import Base from '../base/Base';
import './modal.css';

export default class Modal extends Base {
  constructor(component) {
    super();
    this.component = component;
    this.editor = this.ce('div', {
      id: 'editor',
      keys: {
        innerHTML: "{}"
      }
    });
    this.getTabContent('display');
    ace.edit(this.editor);
    this.modal;
  }

  open() {
    this.modal = this.ce('div', {
      class: 'modal',
    }, [this.ce('div', {
        style: 'position: absolute; top: 0; right: 0; width: 25px; height: 25px;',
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
            on: {
              click: this.setTabContent.bind(this)
            }
          }, this.ce('span', {
            keys: {
              innerHTML: 'Display'
            }
          })),
          this.ce('div', {
            class: 'tab-header',
            ['data-tab']: 'custom',
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
    this.tabContent.replaceWith(this.getTabContent(e.target.parentElement.dataset.tab));
    ace.edit(this.editor);
  }

  getTabContent(tab) {
    if (tab === 'display') {
      this.tabContent = this.ce('div', {}, [this.ce('div', {
          class: 'field'
        }, [
          this.ce('label', {
            keys: {
              innerHTML: 'Label'
            }
          }),
          this.ce('input', {
            on: {
              keydown: this.updateLabel.bind(this)
            },
            keys: {
              type: 'text',
              value: this.component.label
            }
          })
        ]),
        this.ce('div', {
          class: 'field'
        }, this.editor)
      ]);
    } else {
      this.tabContent = this.ce('div', {
        class: 'under-construction',
        keys: {
          innerHTML: `I'm under construction (- _ -)`
        }
      });
    }
    return this.tabContent;
  }

  updateLabel(e) {
    console.log('log', e);
  }
}
