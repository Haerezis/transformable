import Events from 'minivents'
import Utils from './utils'
import unmatrix from './unmatrix'

class Transformable {

  ////////////////////////////////////////////
  //// PUBLIC
  ////////////////////////////////////////////
  
  constructor(element, container) {
    // Mixing minivent to this instance for on/off/emit methods
    Events(this);

    this.element = element;
    this.container = container;

    this.lockTransformation = false;
    // Callback needs to have "this" bound or else "this" won't be the instance of the class.
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
    console.log('_translationOnMousedown');
  }

  _translationOnMousemove(event) {
    console.log('_translationOnMousedown');
  }
  
  _translationOnMouseup(event) {
    console.log('_translationOnMousedown');
  }
  
  ////////////
  // scale callbacks
  ////////////
  
  _scalingOnMousedown(event) {
    console.log('_scalingOnMousedown');
  }

  _scalingOnMousemove(event) {
    console.log('_scalingOnMousedown');
  }
  
  _scalingOnMouseup(event) {
    console.log('_scalingOnMousedown');
  }
  
  ////////////
  // Rotation callbacks
  ////////////
  _rotationOnMousedown(event) {
    console.log('_rotationOnMousedown');
    if(!this.lockTransformation) {
      this.lockTransformation = true;
      
      this.origin = this.center();
      this.originToMouse = {
        x: event.clientX - this.origin.x,
        y: this.origin.y - event.clientY
      }

      document.body.addEventListener('mousemove', this._rotationOnMousemoveBound);
      document.body.addEventListener('mouseup', this._rotationOnMouseupBound);
    }
  }

  _rotationOnMousemove(event) {
    console.log('_rotationOnMousemove');
    const originToMouse = {
      x: event.clientX - this.origin.x,
      y: this.origin.y - event.clientY
    }

    const angle = Utils.Angle(this.originToMouse, originToMouse);

    if (angle != 0) {
      this.transform({x:0,y:0}, {x:0,y:0}, angle);
      this.originToMouse = originToMouse;
    }
  }

  _rotationOnMouseup(event) {
    console.log('_rotationOnMouseup');
    this.lockTransformation = false;
    document.body.removeEventListener('mousemove', this._rotationOnMousemoveBound);
    document.body.removeEventListener('mouseup', this._rotationOnMouseupBound);
  }
}

export default Transformable;
