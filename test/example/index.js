import Transformable from '../../src/transformable';

let element1 = document.getElementById('element1');
let element2 = document.getElementById('element2');
let container = document.getElementsByTagName('body')[0];
window.transformable1 = new Transformable(element1, container);
window.transformable2 = new Transformable(element2, container);

