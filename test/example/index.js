import Transformable from '../../src/transformable';

let element = document.getElementById('element');
let container = document.getElementsByTagName('body')[0];
let t = new Transformable(element, container);

const events = [
  'rotation:start',
  'rotation:ongoing',
  'rotation:stop',
  'move:start',
  'move:ongoing',
  'move:stop',
  'resize:start',
  'resize:ongoing',
  'resize:stop',
]

for(let event of events) {
  t.on(event, () => console.log(event));
}

t.greet();

window.transformable = t;
