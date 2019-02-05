import Base from '../base/Base';
import Workspace from '../workspace/Workspace';
import Palette from '../palette/Palette';
import './workflow.css';

export default class Workflow extends Base {
  constructor() {
    super();
  }

  create() {
    return this.ce('div', {
      id: 'workflow'
    }, [
      new Palette(),
      new Workspace()
    ]);
  }
}