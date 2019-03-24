import Base from './components/base/Base';
import Workspace from './components/workspace/Workspace';
import Palette from './components/palette/Palette';
import './workflow.css';

export default class Workflow extends Base {

  constructor(elem, schema, options) {
    super();
    this.parent = elem;
    this.schema = schema;
    this.options = options;
  }

  create() {
    this.element = this.ce('div', {
      id: 'workflow'
    }, [
      new Palette().create(),
      new Workspace(this.schema, this.options).create()
    ]);
    this.ac(this.parent, this.element);
  }
}
