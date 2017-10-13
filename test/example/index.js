import Transformable from '../../src/transformable';

let element = document.getElementById('element');
let container = document.getElementsByTagName('body')[0];
let t = new Transformable(element, container);

const events = [
  'rotation:start',
  'rotation:ongoing',
  'rotation:stop',
  'translation:start',
  'translation:ongoing',
  'translation:stop',
  'scaling:start',
  'scaling:ongoing',
  'scaling:stop',
]

for(let event of events) {
  t.on(event, () => console.log(event));
}

t.greet();

window.transformable = t;
