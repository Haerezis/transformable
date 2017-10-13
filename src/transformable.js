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
    this._scalingOnMousedownBound = this._scalingOnMousedown.bind(this);
    this._scalingOnMousemoveBound = this._scalingOnMousemove.bind(this);
    this._scalingOnMouseupBound = this._scalingOnMouseup.bind(this);
    this._translationOnMousedownBound = this._translationOnMousedown.bind(this);
    this._translationOnMousemoveBound = this._translationOnMousemove.bind(this);
    this._translationOnMouseupBound = this._translationOnMouseup.bind(this);
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

  transform(translation, scale, rotation) {
    const t = unmatrix(this.element);

    translation.x += t.translateX;
    translation.y += t.translateY;
    scale.x += t.scaleX;
    scale.y += t.scaleY;
    rotation += t.rotate;

    //order : translation, scale, skew, rotation
    const transform = `translate(${translation.x}px, ${translation.y}px) scale(${scale.x}, ${scale.y}) skew(${t.skew}) rotate(${rotation}deg)`;
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

    this._addTranslationHandle();
    this._addScalingHandles();
    this._addRotationHandle();
  }

  _addScalingHandles() {
    const handles = ['ul', 'ur', 'dl', 'dr'];

    this.scaling_handles = {}
    for(let handle of handles) {
      this.handles.insertAdjacentHTML('beforeend', `<span class='scaling_handles ${handle}'></span>`);
      this.scaling_handles[handle] = this.element.querySelector(`.scaling_handles.${handle}`)
      this.scaling_handles[handle].addEventListener('mousedown', this._scalingOnMousedownBound);
    }
  }

  _addTranslationHandle() {
    this.handles.insertAdjacentHTML('beforeend', `
        <span class='translation_handle'></span>
    `);

    this.translation_handle = this.element.querySelector('.translation_handle');
    this.translation_handle.addEventListener('mousedown', this._translationOnMousedownBound);
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
  // translation callback
  ////////////
  
  _translationOnMousedown(event) {
    this.emit('translation:start');

    this.currentMousePosition = { x: event.clientX, y: event.clientY };

    this.container.addEventListener('mousemove', this._translationOnMousemoveBound);
    this.container.addEventListener('mouseup', this._translationOnMouseupBound);
  }

  _translationOnMousemove(event) {
    this.emit('translation:ongoing');

    const translation = {
      x: event.clientX - this.currentMousePosition.x,
      y: event.clientY - this.currentMousePosition.y
    }

    if(translation.x != 0 || translation.y != 0) {
      this.transform(translation, {x:0,y:0}, 0);
      this.currentMousePosition = { x: event.clientX, y: event.clientY };
    }
  }
  
  _translationOnMouseup(event) {
    this.emit('translation:stop');

    this.container.removeEventListener('mousemove', this._translationOnMousemoveBound);
    this.container.removeEventListener('mouseup', this._translationOnMouseupBound);
  }
  
  ////////////
  // scale callbacks
  ////////////
  
  _scalingOnMousedown(event) {
    this.emit('scaling:start');

    this.container.addEventListener('mousemove', this._scalingOnMousemoveBound);
    this.container.addEventListener('mouseup', this._scalingOnMouseupBound);
  }

  _scalingOnMousemove(event) {
    this.emit('scaling:ongoing');
  }
  
  _scalingOnMouseup(event) {
    this.emit('scaling:stop');

    this.container.removeEventListener('mousemove', this._scalingOnMousemoveBound);
    this.container.removeEventListener('mouseup', this._scalingOnMouseupBound);
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
      this.transform({x:0,y:0}, {x:0,y:0}, angle);
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
