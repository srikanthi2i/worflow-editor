import Base from '../base/Base';
import './workspace.css';

export default class Workspace extends Base {
  constructor() {
    super();
    this.workspace;
    this.create();
    return this.workspace;
  }

  create() {
    this.workspace = this.ce('div', {
      id: 'workspace'
    });
  }
}