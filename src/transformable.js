import Events from 'minivents'
import Utils from './utils'
import unmatrix from './unmatrix'

class Transformable {

  ////////////////////////////////////////////
  //// PUBLIC
  ////////////////////////////////////////////
  
  constructor(element, container) {
    // Mixing minivent to this instance for on/off/this.emit methods
    Events(this);

    this.element = element;
    this.container = container;

    // Callback needs to have "this" bound or else "this" won't be the instance of the class.
    this._resizeOnMousedownBound = this._resizeOnMousedown.bind(this);
    this._resizeOnMousemoveBound = this._resizeOnMousemove.bind(this);
    this._resizeOnMouseupBound = this._resizeOnMouseup.bind(this);
    this._moveOnMousedownBound = this._moveOnMousedown.bind(this);
    this._moveOnMousemoveBound = this._moveOnMousemove.bind(this);
    this._moveOnMouseupBound = this._moveOnMouseup.bind(this);
    this._rotationOnMousedownBound = this._rotationOnMousedown.bind(this);
    this._rotationOnMousemoveBound = this._rotationOnMousemove.bind(this);
    this._rotationOnMouseupBound = this._rotationOnMouseup.bind(this);

    this._addHandles();
  }

  greet() {
    console.log('hello world');
  }

  disable() {
    this.handles.classList.add('hidden');
  }

  enable() {
    this.handles.classList.remove('hidden');
  }

  move(dx, dy) {
    this.element.style.top = `${this.element.offsetTop + dy}px`;
    this.element.style.left = `${this.element.offsetLeft + dx}px`;
  }

  resize(dx, dy) {
  }

  rotate(angle) {
    this.transform({x:0,y:0}, {x:0,y:0}, angle);
  }

  transform(translation, scale, rotation) {
    const t = unmatrix(this.element);

    translation.x += t.translateX;
    translation.y += t.translateY;
    scale.x += t.scaleX;
    scale.y += t.scaleY;
    rotation += t.rotate;

    //order : translation, scale, skew, rotation
    const transform = `translate(${translation.x}px, ${translation.y}px) scale(${scale.x}, ${scale.y}) skew(${t.skew}deg) rotate(${rotation}deg)`;
    this.element.style.transform = transform;
  }

  center() {
    const boundingRect = this.element.getBoundingClientRect();

    return {
      x: boundingRect.left + (boundingRect.width / 2),
      y: boundingRect.top + (boundingRect.height / 2)
    }
  }

  ////////////////////////////////////////////
  //// PROTECTED
  ////////////////////////////////////////////
  
  _addHandles() {
    this.element.insertAdjacentHTML('beforeend', '<div class="handles noselect"></div>');
    this.handles = this.element.querySelector('.handles');

    this._addMoveHandle();
    this._addResizeHandles();
    this._addRotationHandle();
  }

  _addResizeHandles() {
    const handles = ['ul', 'um', 'ur', 'ml', 'mr', 'dl', 'dm', 'dr'];

    this.resize_handles = {}
    for(let handle of handles) {
      this.handles.insertAdjacentHTML('beforeend', `<span class='resize_handles ${handle}'></span>`);
      this.resize_handles[handle] = this.element.querySelector(`.resize_handles.${handle}`)
      this.resize_handles[handle].addEventListener('mousedown', this._resizeOnMousedownBound);
    }
  }

  _addMoveHandle() {
    this.handles.insertAdjacentHTML('beforeend', `
        <span class='move_handle'></span>
    `);

    this.move_handle = this.element.querySelector('.move_handle');
    this.move_handle.addEventListener('mousedown', this._moveOnMousedownBound);
  }

  _addRotationHandle() {
    this.handles.insertAdjacentHTML('beforeend', `
        <span class='rotation_handle'></span>
    `);

    this.rotation_handle = this.element.querySelector('.rotation_handle');
    this.rotation_handle.addEventListener('mousedown', this._rotationOnMousedownBound);
  }


  //////////////////////////////////////////////
  // CALLBACK
  /////////////////////////////////////////////
  
  ////////////
  // move callback
  ////////////
  
  _moveOnMousedown(event) {
    this.emit('move:start');

    this.currentMousePosition = { x: event.clientX, y: event.clientY };

    this.container.addEventListener('mousemove', this._moveOnMousemoveBound);
    this.container.addEventListener('mouseup', this._moveOnMouseupBound);
  }

  _moveOnMousemove(event) {
    this.emit('move:ongoing');

    const move = {
      x: event.clientX - this.currentMousePosition.x,
      y: event.clientY - this.currentMousePosition.y
    }

    if(move.x != 0 || move.y != 0) {
      this.move(move.x, move.y);
      //this.transform(move, {x:0,y:0}, 0);
      this.currentMousePosition = { x: event.clientX, y: event.clientY };
    }
  }
  
  _moveOnMouseup(event) {
    this.emit('move:stop');

    this.container.removeEventListener('mousemove', this._moveOnMousemoveBound);
    this.container.removeEventListener('mouseup', this._moveOnMouseupBound);
  }
  
  ////////////
  // resize callbacks
  ////////////
  
  _resizeOnMousedown(event) {
    this.emit('resize:start');

    this.container.addEventListener('mousemove', this._resizeOnMousemoveBound);
    this.container.addEventListener('mouseup', this._resizeOnMouseupBound);
  }

  _resizeOnMousemove(event) {
    this.emit('resize:ongoing');
  }
  
  _resizeOnMouseup(event) {
    this.emit('resize:stop');

    this.container.removeEventListener('mousemove', this._resizeOnMousemoveBound);
    this.container.removeEventListener('mouseup', this._resizeOnMouseupBound);
  }
  
  ////////////
  // Rotation callbacks
  ////////////
  _rotationOnMousedown(event) {
    this.emit('rotation:start');

    this.rotationOrigin = this.center();
    this.rotationOriginToMouse = {
      x: event.clientX - this.rotationOrigin.x,
      y: this.rotationOrigin.y - event.clientY
    }

    this.container.addEventListener('mousemove', this._rotationOnMousemoveBound);
    this.container.addEventListener('mouseup', this._rotationOnMouseupBound);
  }

  _rotationOnMousemove(event) {
    this.emit('rotation:ongoing');

    const originToMouse = {
      x: event.clientX - this.rotationOrigin.x,
      y: this.rotationOrigin.y - event.clientY
    }
    const angle = Utils.Angle(this.rotationOriginToMouse, originToMouse);

    if (angle != 0) {
      this.rotate(angle);
      this.rotationOriginToMouse = originToMouse;
    }
  }

  _rotationOnMouseup(event) {
    this.emit('rotation:stop');

    this.container.removeEventListener('mousemove', this._rotationOnMousemoveBound);
    this.container.removeEventListener('mouseup', this._rotationOnMouseupBound);
  }
}

export default Transformable;
