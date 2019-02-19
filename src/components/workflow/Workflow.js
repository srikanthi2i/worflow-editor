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
      id: 'workflow',
      style: 'background: #fff;'
    }, [
      new Palette().create(),
      this.ce('div', {
        id: 'workspace-container',
        style: 'width: 100%; height: 100%; background: #00000033; overflow: hidden;'
      }, new Workspace().create())
    ]);
  }
}
