import Base from './components/base/Base';
import Workspace from './components/workspace/Workspace';
import Palette from './components/palette/Palette';
import './workflow.css';

export default class Workflow extends Base {

  constructor(elem, schema) {
    super();
    this.element = elem;
    this.schema = schema;
  }

  create() {
    this.element.appendChild(this.ce('div', {
      id: 'workflow',
      style: 'background: #fff;'
    }, [
      new Palette().create(),
      new Workspace(this.schema).create()
    ]));
  }
}
