import Base from './components/base/Base';
import Workspace from './components/workspace/Workspace';
import Palette from './components/palette/Palette';
import FlowEmitter from './components/event-emitter/EventEmitter';
import './workflow.css';

export default class Workflow extends Base {
  constructor(elem, flows, options) {
    super();
    this.parent = elem;
    this.flows = flows;
    this.options = options;
    this.events = FlowEmitter;
  }

  on(eventName, fn) {
    this.events.on(eventName, fn);
  }

  create() {
    this.element = this.ce('div', {
      id: 'workflow'
    }, [
      new Palette().create(),
      new Workspace(this.parent, this.flows, this.options).create()
    ]);
    this.ac(this.parent, this.element);
  }
}
