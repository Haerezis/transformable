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

    this.moveInfos = {};
    this.resizeInfos = {};
    this.rotationInfos = {};

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

  center() {
    const boundingRect = this.element.getBoundingClientRect();

    return {
      x: boundingRect.left + (boundingRect.width / 2),
      y: boundingRect.top + (boundingRect.height / 2)
    }
  }

  angle() {
    const t = unmatrix(this.element);

    return t.rotate;
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
    const handles = ['tl', 'tm', 'tr', 'ml', 'mr', 'bl', 'bm', 'br'];

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


  _move(initial, delta) {
    this.element.style.top = `${initial.y + delta.y}px`;
    this.element.style.left = `${initial.x + delta.x}px`;
  }

  _resize(initial, delta) {
    let width = initial.width + delta.x;
    let height = initial.height + delta.y;

    if(width <= 0) width = 1;
    if(height <= 0) height = 1;

    if (this.resizeInfos.resize.x) this.element.style.width = `${width}px`;
    if (this.resizeInfos.resize.y) this.element.style.height = `${height}px`;
  }

  _rotate(angle) {
    const t = unmatrix(this.element);
    
    const transform = `translate(${t.translateX}px, ${t.translateY}px) scale(${t.scaleX}, ${t.scaleY}) skew(${t.skew}deg) rotate(${this.rotationInfos.angle + angle}deg)`;
    this.element.style.transform = transform;
  }

  //////////////////////////////////////////////
  // CALLBACK
  /////////////////////////////////////////////
  
  ////////////
  // move callback
  ////////////
  
  _moveOnMousedown(event) {
    //If left mouse
    if (event.button == 0) {
      this.emit('move:start');

      this.moveInfos.initial = {
        x: this.element.offsetLeft,
        y: this.element.offsetTop
      };
      this.moveInfos.mouse = {
        x: event.clientX,
        y: event.clientY
      };

      this.container.addEventListener('mousemove', this._moveOnMousemoveBound);
      this.container.addEventListener('mouseup', this._moveOnMouseupBound);
    }
  }

  _moveOnMousemove(event) {
    this.emit('move:ongoing');

    const move = {
      x: event.clientX - this.moveInfos.mouse.x,
      y: event.clientY - this.moveInfos.mouse.y
    }

    this._move(this.moveInfos.initial, move);
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
    //If left mouse
    if (event.button == 0) {
      this.emit('resize:start');

      const handleClass = Object.keys(this.resize_handles).filter(x => event.target.classList.contains(x))[0];
      
      //handles on the top or left side also change the position of the element to counterbalance the size change.
      this.resizeInfos.resize = {
        x: handleClass.match('[lr]') !== null,
        y: handleClass.match('[tb]') !== null
      }
      this.resizeInfos.move = {
        x: handleClass.includes('l'),
        y: handleClass.includes('t'),
        initial: {
          x: this.element.offsetLeft,
          y: this.element.offsetTop
        }
      }
      this.resizeInfos.size = {
        width: this.element.offsetWidth,
        height: this.element.offsetHeight
      };
      this.resizeInfos.mouse = {
        x: event.clientX,
        y: event.clientY
      };


      this.container.addEventListener('mousemove', this._resizeOnMousemoveBound);
      this.container.addEventListener('mouseup', this._resizeOnMouseupBound);
    }
  }

  _resizeOnMousemove(event) {
    this.emit('resize:ongoing');

    let move = { x: 0, y: 0 };
    let delta = {
      x: event.clientX - this.resizeInfos.mouse.x,
      y: event.clientY - this.resizeInfos.mouse.y
    }

    if (this.resizeInfos.move.x) {
      move.x = delta.x;
      delta.x = -delta.x;
    }
    if (this.resizeInfos.move.y) {
      move.y = delta.y;
      delta.y = -delta.y;
    }

    this._resize(this.resizeInfos.size, delta);
    this._move(this.resizeInfos.move.initial, move);
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
    //If left mouse
    if (event.button == 0) {
      this.emit('rotation:start');

      this.rotationInfos.angle = this.angle();
      this.rotationInfos.center = this.center();
      this.rotationInfos.centerToMouse = {
        x: event.clientX - this.rotationInfos.center.x,
        y: this.rotationInfos.center.y - event.clientY
      }

      this.container.addEventListener('mousemove', this._rotationOnMousemoveBound);
      this.container.addEventListener('mouseup', this._rotationOnMouseupBound);
    }
  }

  _rotationOnMousemove(event) {
    this.emit('rotation:ongoing');

    const centerToMouse = {
      x: event.clientX - this.rotationInfos.center.x,
      y: this.rotationInfos.center.y - event.clientY
    }

    let angle = Utils.Angle(this.rotationInfos.centerToMouse, centerToMouse);
    //angle = Math.round(angle / 15) * 15;
    
    this._rotate(angle);
  }

  _rotationOnMouseup(event) {
    this.emit('rotation:stop');

    this.container.removeEventListener('mousemove', this._rotationOnMousemoveBound);
    this.container.removeEventListener('mouseup', this._rotationOnMouseupBound);
  }
}

export default Transformable;
