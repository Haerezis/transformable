import Transformable from '../../src/transformable';

let element = document.getElementById('element');
let container = document.getElementsByTagName('body')[0];
let t = new Transformable(element, container);

t.greet();
