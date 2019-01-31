import Base from 'Base';
import Workspace from 'Workspace';
import Palette from 'Palette';

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