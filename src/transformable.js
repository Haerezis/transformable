import Events from 'minivents'
import Utils from './utils'
import unmatrix from './unmatrix'

class Transformable {

  ////////////////////////////////////////////
  //// PUBLIC
  ////////////////////////////////////////////
  
  /**
   * Create a Transformable instance
   * @constructor
   * @param element - The DOM element to attach to.
   * @param container - The DOM element that where the mousemove event will be detected.
   */
  constructor(element, container) {
    // Mixing minivent to this instance for on/off/this.emit methods
    Events(this);

    this.element = element;
    this.container = container;

    this.lastState = {
      x: this.element.offsetLeft + this.element.offsetWidth / 2,
      y: this.element.offsetTop + this.element.offsetHeight / 2,
      width: this.element.offsetWidth,
      height: this.element.offsetHeight,
      compensation: {
        x: 0,
        y: 0
      },
      angle: 0
    };
    this.currentState = Utils.Dup(this.lastState);

    this.element.style.top = "0px";
    this.element.style.bottom = "0px";
    this.element.style.left = "0px";
    this.element.style.right = "0px";

    this.moveInfos = {};
    this.resizeInfos = {};
    this.rotationInfos = {};

    this.rotationStep = 5;
    this.minimumSize = 10;

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

    this.update();
  }

  /**
   * Disable the handles (and thus interaction with the Transformable instance).
   */
  disable() {
    this.handles.classList.add('hidden');
  }

  /**
   * Enable the handles.
   */
  enable() {
    this.handles.classList.remove('hidden');
  }

  /**
   * Move the Transformable by an increment.
   * @param {Object} inc - the position increment => {x: 42, y: 42}.
   */
  moveBy(inc) {
    this.currentState.x += inc.x;
    this.currentState.y += inc.y;
  }

  /**
   * Move the Transformable to a specific position.
   * Warning : the Transformable's origin is not the top left but the center.
   *
   * @param {Object} position - the position where the element should be moved => {x: 42, y: 42}.
   */
  moveTo(position) {
    this.currentState.x = position.x;
    this.currentState.y = position.y;
  }

  /**
   * Resize the Transformable by an increment.
   * @param {Object} resize - The resize values for the 4 sides of the element => {left:a, top:b, right:c, bottom:d}.
   */
  resizeBy(resize) {
    resize.left = resize.left || 0;
    resize.right = resize.right || 0;
    resize.top = resize.top || 0;
    resize.bottom = resize.bottom || 0;

    let delta = {
      x: resize.right + resize.left,
      y: resize.top + resize.bottom
    }

    if (this.currentState.width + delta.x < this.minimumSize) {
      delta.x = this.minimumSize - this.currentState.width;
    }
    if (this.currentState.height + delta.y < this.minimumSize) {
      delta.y = this.minimumSize - this.currentState.height;
    }

    this.currentState.width += delta.x;
    if(resize.left != 0) {
      this.currentState.compensation.x -= delta.x / 2; 
    }
    if(resize.right != 0) {
      this.currentState.compensation.x += delta.x / 2;
    }

    this.currentState.height += delta.y;
    if(resize.top != 0) {
      this.currentState.compensation.y -= delta.y / 2; 
    }
    if(resize.bottom != 0) {
      this.currentState.compensation.y += delta.y / 2;
    }
  }

  /**
   * Rotate the Transformable by an angle.
   * @param {Integer} angle - the angle to rotate to (in degree).
   */
  rotateBy(angle) {
    this.currentState.angle += angle;
  }

  /**
   * Set the rotation angle of the Transformable.
   * @param {Integer} angle - the angle of the element after rotation (in degree).
   */
  rotateTo(angle) {
    this.currentState.angle = angle;
  }

  /**
   * Update the display of the Transformable based on its internal state.
   */
  update() {
    this._transform(true);
    this._normalize();
  }

  /**
   * Get the center position of the Transformable.
   */
  center() {
    const containerBoundingBox = this.container.getBoundingClientRect();
    const boundingRect = this.element.getBoundingClientRect();

    return {
      x: boundingRect.left - containerBoundingBox.left + (boundingRect.width / 2),
      y: boundingRect.top - containerBoundingBox.top + (boundingRect.height / 2)
    }
  }

  /**
   * Get the current width of the Transformable.
   */
  width() {
    return this.currentState.width;
  }

  /**
   * Get the current height of the Transformable.
   */
  height() {
    return this.currentState.height;
  }

  /**
   * Get the current position of the Transformable.
   */
  position() {
    return { x: this.currentState.x, y: this.currentState.y };
  }

  /**
   * Get the current angle (in degree) of the Transformable.
   */
  angle() {
    return this.currentState.angle;
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

  _transform(updateLastState = true) {
    const s = this.currentState;
    const transform = `
      translate(${s.x}px, ${s.y}px)
      rotate(${s.angle}deg)
      translate(calc(${s.compensation.x}px - 50%), calc(${s.compensation.y}px - 50%))
      `;

    this.element.style.width = `${s.width}px`;
    this.element.style.height = `${s.height}px`;
    this.element.style.transform = transform;
    this.element.style.transformOrigin = 'left top';

    if(updateLastState) {
      this.lastState = Utils.Dup(s);
    }
  }

  _normalize() {
    const center = this.center();
    this.currentState.x = center.x;
    this.currentState.y = center.y;
    this.currentState.compensation = {x:0, y: 0};
    this._transform();
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
        x: this.currentState.x,
        y: this.currentState.y
      };
      this.moveInfos.mouse = {
        x: event.clientX,
        y: event.clientY
      };

      this.container.addEventListener('mousemove', this._moveOnMousemoveBound);
      document.addEventListener('mouseup', this._moveOnMouseupBound);
    }
  }

  _moveOnMousemove(event) {
    this.emit('move:ongoing');

    const move = {
      x: event.clientX - this.moveInfos.mouse.x + this.moveInfos.initial.x,
      y: event.clientY - this.moveInfos.mouse.y + this.moveInfos.initial.y
    }

    this.moveTo(move);
    this._transform();
  }
  
  _moveOnMouseup(event) {
    this.emit('move:stop');

    this.update();

    this.container.removeEventListener('mousemove', this._moveOnMousemoveBound);
    document.removeEventListener('mouseup', this._moveOnMouseupBound);
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
        left: handleClass.includes('l'),
        right: handleClass.includes('r'),
        top: handleClass.includes('t'),
        bottom: handleClass.includes('b')
      }
      this.resizeInfos.mouse = {
        x: event.clientX,
        y: event.clientY
      };


      this.container.addEventListener('mousemove', this._resizeOnMousemoveBound);
      document.addEventListener('mouseup', this._resizeOnMouseupBound);
    }
  }

  _resizeOnMousemove(event) {
    this.emit('resize:ongoing');

    //Rotate start and current mouse position to match this.element rotated referentiel
    const center = this.center();
    let start = {
      x: this.resizeInfos.mouse.x - center.x,
      y: this.resizeInfos.mouse.y - center.y,
    }
    let current = {
      x: event.clientX - center.x,
      y: event.clientY - center.y,
    }
    start = Utils.Rotate(start, -this.currentState.angle);
    current = Utils.Rotate(current, -this.currentState.angle);

    
    const delta = {
      x: current.x - start.x,
      y: current.y - start.y
    }

    let resize = {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0
    }
    if (this.resizeInfos.resize.left) {
      resize.left = -delta.x;
    }
    if (this.resizeInfos.resize.right) {
      resize.right = delta.x
    }
    if (this.resizeInfos.resize.top) {
      resize.top = -delta.y;
    }
    if (this.resizeInfos.resize.bottom) {
      resize.bottom = delta.y;
    }


    this.currentState = Utils.Dup(this.lastState);
    this.resizeBy(resize);
    this._transform(false);
  }
  
  _resizeOnMouseup(event) {
    this.emit('resize:stop');

    this.update();

    this.container.removeEventListener('mousemove', this._resizeOnMousemoveBound);
    document.removeEventListener('mouseup', this._resizeOnMouseupBound);
  }
  
  ////////////
  // Rotation callbacks
  ////////////
  _rotationOnMousedown(event) {
    //If left mouse
    if (event.button == 0) {
      this.emit('rotation:start');

      this.rotationInfos.angle = this.currentState.angle;
      this.rotationInfos.center = this.center();
      this.rotationInfos.centerToMouse = {
        x: event.clientX - this.rotationInfos.center.x,
        y: this.rotationInfos.center.y - event.clientY
      }

      this.container.addEventListener('mousemove', this._rotationOnMousemoveBound);
      document.addEventListener('mouseup', this._rotationOnMouseupBound);
    }
  }

  _rotationOnMousemove(event) {
    this.emit('rotation:ongoing');

    const centerToMouse = {
      x: event.clientX - this.rotationInfos.center.x,
      y: this.rotationInfos.center.y - event.clientY
    }

    let angle = Utils.Angle(this.rotationInfos.centerToMouse, centerToMouse);
    angle = Math.round(angle / this.rotationStep) * this.rotationStep;
    
    this.rotateTo(this.rotationInfos.angle + angle);
    this._transform();
  }

  _rotationOnMouseup(event) {
    this.emit('rotation:stop');
    
    this.update();

    this.container.removeEventListener('mousemove', this._rotationOnMousemoveBound);
    document.removeEventListener('mouseup', this._rotationOnMouseupBound);
  }
}

export default Transformable;
