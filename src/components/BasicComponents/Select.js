import Base from '../base/Base';
import EventEmitter from '../EventEmitter/EventEmitter';
import * as CommonUtils from '../Common/CommonUtils';
import '../modal/modal.css';

export default class Select extends Base {

  constructor(component, option) {
    super();
    this.eventEmitter = EventEmitter;
    this.option = option;
    this.urlResponse = {};
    this.dataPathResponse;
    this.component = component;
  }

  enableSelect() {
    this.addSourceType()
    if (!this.option.sourceType) {
      this.addOptions();
    }
    if (this.option.sourceType === 'URL' && this.option.url) {
      this.fetchData(null, this.option.url);
    }
    this.enableContent();
  }

  deleteComponent() {
    this.eventEmitter.emit('deleteComponent', {
      option: this.option,
    });
  }

  addSourceType() {
    let value = this.ce('div', {
      id: `selectComponent${this.option.key ? `-${this.option.key}` : ''}`
    }, [
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
      (!this.option.sourceType && this.ce('span', {}, [
        this.ce('label', {
          keys: {
            innerHTML: 'Source Type'
          }
        }),
        this.ce('select', {
          class: 'select',
          id: `sourceTypeSelect${this.option.key ? `-${this.option.key}` : ''}`,
          on: {
            change: this.enableContent.bind(this),
          }
        })
      ]))
    ])
    document.getElementById("componentType").appendChild(value);
  }

  //Add options to the source type select drop down
  addOptions() {
    let selectOption = document.getElementById(`sourceTypeSelect${this.option.key ? `-${this.option.key}` : ''}`);
    CommonUtils.removeAllChildren(selectOption);
    const optionsValues = ['URL', 'VALUES'];
    let options;
    optionsValues.map(item => {
      options = this.ce('option', {
        keys: {
          innerHTML: item,
          value: item
        },
      })
      document.getElementById(`sourceTypeSelect${this.option.key ? `-${this.option.key}` : ''}`).appendChild(options)
    })
  }

  //Update content when url is selected.
  enableContent() {
    let currentValue;
    currentValue = document.getElementById(`sourceTypeSelect${this.option.key ? `-${this.option.key}` : ''}`) ?
      document.getElementById(`sourceTypeSelect${this.option.key ? `-${this.option.key}` : ''}`).selectedOptions[0].value :
      this.option.sourceType;
    if (document.getElementById(`urlContent${this.option.key ? `-${this.option.key}` : ''}`)) {
      document.getElementById(`urlContent${this.option.key ? `-${this.option.key}` : ''}`).remove();
    }
    if (document.getElementById(`valuesContent${this.option.key ? `-${this.option.key}` : ''}`)) {
      document.getElementById(`valuesContent${this.option.key ? `-${this.option.key}` : ''}`).remove();
    }
    this.option.sourceType = currentValue;
    this.option.name = 'Select';
    if (currentValue === "URL") {
      let value = this.ce('div', {}, [this.ce('div', {
        id: `urlContent${this.option.key ? `-${this.option.key}` : ''}`
      }, [

        this.ce('div', {
          id: 'loader',
          class: 'loadingOverlay',
          style: 'display:none'
        }, [
          this.ce('div', {
            class: 'loader'
          })
        ]),

        (!this.option.url && this.ce('span', {}, [
          this.ce('label', {
            keys: {
              innerHTML: 'Source Url'
            }
          }),
          this.ce('input', {
            keys: {
              type: 'text'
            },
            on: {
              blur: this.fetchData.bind(this)
            }
          })
        ])),
        (!this.option.dataPath && this.ce('span', {}, [
          this.ce('label', {
            keys: {
              innerHTML: 'Data Path'
            }
          }),
          this.ce('input', {
            keys: {
              type: 'text'
            },
            on: {
              blur: this.fetchDataPath.bind(this)
            }
          })
        ])),
        (!this.option.valueProperty && this.ce('span', {}, [

          this.ce('label', {
            keys: {
              innerHTML: 'Value Property'
            }
          }),
          this.ce('input', {
            keys: {
              type: 'text'
            },
            on: {
              blur: this.fetchValueProperty.bind(this)
            }
          })
        ])),
        (!this.option.labelProperty && this.ce('span', {}, [

          this.ce('label', {
            keys: {
              innerHTML: 'Label Property'
            }
          }),
          this.ce('input', {
            keys: {
              type: 'text'
            },
            on: {
              blur: this.fetchLabelProperty.bind(this)
            }
          })
        ])),
        this.ce('div', {}, [
          this.ce('span', {
            id: 'urlSelectValues'
          }, [
            this.ce('label', {
              keys: {
                innerHTML: 'Select'
              }
            }), this.ce('select', {
              class: 'select',
              id: 'responseSelectValues',
              on: {
                change: this.updateAceEditor.bind(this),
              }
            })
          ])
        ])
      ])])
      document.getElementById(`selectComponent${this.option.key ? `-${this.option.key}` : ''}`).appendChild(value);
    } else {
      this.option.dataPath && delete this.option.dataPath;
      this.option.labelProperty && delete this.option.labelProperty;
      this.option.url && delete this.option.url;
      this.option.valueProperty && delete this.option.valueProperty;
      this.dataPathResponse = this.option.values;
      let value = this.ce('div', {}, [this.ce('div', {
        id: `valuesContent${this.option.key ? `-${this.option.key}` : ''}`
      }, [
        this.ce('div', {}, [
          this.ce('span', {
            id: 'urlSelectValues'
          }, [
            this.ce('label', {
              keys: {
                innerHTML: 'Select'
              }
            }), this.ce('select', {
              class: 'select',
              id: 'responseSelectValues',
              on: {
                change: this.updateAceEditor.bind(this),
              }
            })
          ])
        ])
      ])])
      document.getElementById(`selectComponent${this.option.key ? `-${this.option.key}` : ''}`).appendChild(value);
      if (this.option.sourceType === 'URL' && this.option.labelProperty) {
        this.addSelectOptions();
      }
    }
    if (currentValue === 'VALUES') {
      this.addSelectOptionsByValues();
      this.dataPathResponse = this.option.values;
    }
  }

  addSelectOptionsByValues() {
    let selectOption = document.getElementById('responseSelectValues');
    CommonUtils.removeAllChildren(selectOption);
    this.dataPathResponse && Object.keys(this.dataPathResponse).map(item => {
      let value = this.ce('option', {
        keys: {
          value: item,
          innerHTML: this.dataPathResponse[item]
        }
      })
      document.getElementById('responseSelectValues').appendChild(value)
    })
  }

  // Fetch data with the corresponding url specified
  fetchData(e, key) {
    if (document.getElementById('loader')) {
      document.getElementById('loader').style.display = 'flex';
    }
    this.option.url = e ? e.target.value : key;
    fetch(this.option.url)
      .then(response => response.json())
      .then(json => {
        this.urlResponse = json;
        if (document.getElementById('loader')) {
          document.getElementById('loader').style.display = 'none';
        }
      })
      .then(() => {
        if (this.option.dataPath) {
          this.fetchDataPath(null, this.option.dataPath);
        }
        document.getElementById('loader').style.display = 'none';
      })
      .catch((error) => {
        if (document.getElementById('loader')) {
          document.getElementById('loader').style.display = 'none';
        }
        console.log('JSON.stringify(error)', JSON.stringify(error));
      });
  }

  // Fetch the data path values.
  fetchDataPath(e, key) {
    this.option.dataPath = e ? e.target.value : key;
    Object.keys(this.urlResponse).map(item => {
      if (item === this.option.dataPath) {
        this.dataPathResponse = this.urlResponse[item]
      }
    })
    if (this.option.labelProperty) {
      this.addSelectOptions();
    }
  }

  // Add the value property for displaying the select component
  fetchValueProperty(e) {
    this.option.valueProperty = e.target.value;
    if (this.option.labelProperty) {
      this.addSelectOptions();
    }
  }

  // Add the label property for displaying the select component
  fetchLabelProperty(e) {
    this.option.labelProperty = e.target.value;
    this.addSelectOptions();
  }

  //Update the component data with the respective selected value.
  updateAceEditor(e) {
    let value = document.getElementById("responseSelectValues").selectedOptions[0].value;
    if (this.option.sourceType === 'URL') {
      this.component.data[this.option.valueProperty] = value;
    } else {
      this.component.data[value] = this.dataPathResponse[value];
    }
  }

  //Populate the url response with the given data path to the select.
  addSelectOptions() {
    let selectOption = document.getElementById('responseSelectValues');
    CommonUtils.removeAllChildren(selectOption);
    this.dataPathResponse && this.dataPathResponse.map(item => {
      let value = this.ce('option', {
        keys: {
          innerHTML: item[this.option.valueProperty],
          value: item[this.option.valueProperty]
        }
      })
      document.getElementById('responseSelectValues').appendChild(value)
    })
  }
}
