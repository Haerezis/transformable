import Events from 'minivents'

class Transformable {
  constructor(element, container) {
    Events(this);

    this.element = element;
    this.container = container;
  }

  greet() {
    console.log('hello world');
  }
}

export default Transformable;
