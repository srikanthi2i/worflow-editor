import Base from '../base/Base';
import './modal.css';

export default class Modal extends Base {
  constructor() {
    super();
    this.modal;
    this.create();
    this.addLabel();
    this.addEditorConfig();
    return this.modal;
  }

  addLabel() {
    document.getElementById('close').innerHTML = '&times;';
    document.getElementById('label').innerHTML = 'Label';
    document.getElementById('data').innerHTML = 'Data';
  }

  addEditorConfig() {
    ace = window.ace.edit('editor');
    editor.setOptions({
      enableBasicAutocompletion: true, // the editor completes the statement when you hit Ctrl + Space
      enableLiveAutocompletion: true, // the editor completes the statement while you are typing
      showPrintMargin: false, // hides the vertical limiting strip
      maxLines: Infinity,
      fontSize: "100%" // ensures that the editor fits in the environment
    });
    editor.setTheme("ace/theme/monokai");
    editor.getSession().setMode("ace/mode/javascript");
  }

  closeModal() {   
    var modal = document.getElementById('myModal');
    modal.style.display = "none";
  }

  create() {
    this.modal = this.ce('div', {id: 'modal'}, 
    [
      this.ce('div', {class:'modal-content'},
      [ 
        this.ce('h3', {id:'modal-header'}), 
        this.ce('span', {id: 'close', on: {click: this.closeModal}}),
        this.ce('p', { id: 'label'}),
        this.ce('input', { type: 'text', class: 'input-text'}),
        this.ce('p', { id: 'data'}),
        this.ce('div', { id: 'editor'})
      ])
    ])
  }
};