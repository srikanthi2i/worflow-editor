class EventEmitter {
  constructor() {
    this.events = {};
  }

  subscribe(eventName, fn) {
    document.addEventListener(eventName, fn);
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(fn);
    return () => {
      this.events[eventName] = this.events[eventName].filter(eventFn => fn !== eventFn);
    }
  }

  emit(eventName, data) {
    const event = this.events[eventName];
    if (event) {
      var emitEvent = new CustomEvent(eventName, {
        detail: data
      });
      document.dispatchEvent(emitEvent);
    }
  }
}
export default Object.freeze(new EventEmitter());
