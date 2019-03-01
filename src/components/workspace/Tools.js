import Base from '../base/Base';

export default class Tool extends Base {
  constructor(props) {
    super();
    this.props = props;
  }

  create() {
    const tools = [this.ce('div', {
      style: 'position: absolute; top: 15px; right: 35px; width: 25px; height: 25px;',
    }, this.ce('button', {
      keys: {
        innerHTML: "&#8635"
      },
      on: {
        click: this.props.reset.bind(this)
      }
    })), this.ce('div', {
      style: 'position: absolute; top: 45px; right: 15px; width: 25px; height: 25px;',
    }, this.ce('button', {
      keys: {
        innerHTML: "&#8853"
      },
      on: {
        click: (e) => this.props.zoom(e, "zoomIn")
      }
    })), this.ce('div', {
      style: 'position: absolute; top: 45px; right: 50px; width: 25px; height: 25px;',
    }, this.ce('button', {
      keys: {
        innerHTML: "&#8861"
      },
      on: {
        click: (e) => this.props.zoom(e, "zoomOut")
      }
    }))]
    return tools;
  }
}