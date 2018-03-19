(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["transformable"] = factory();
	else
		root["transformable"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _minivents = __webpack_require__(1);
	
	var _minivents2 = _interopRequireDefault(_minivents);
	
	var _utils = __webpack_require__(2);
	
	var _utils2 = _interopRequireDefault(_utils);
	
	var _unmatrix = __webpack_require__(3);
	
	var _unmatrix2 = _interopRequireDefault(_unmatrix);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Transformable = function () {
	
	  ////////////////////////////////////////////
	  //// PUBLIC
	  ////////////////////////////////////////////
	
	  /**
	   * Create a Transformable instance
	   * @constructor
	   * @param element - The DOM element to attach to.
	   * @param container - The DOM element that where the mousemove event will be detected.
	   */
	  function Transformable(element, container) {
	    _classCallCheck(this, Transformable);
	
	    // Mixing minivent to this instance for on/off/this.emit methods
	    (0, _minivents2.default)(this);
	
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
	    this.currentState = _utils2.default.Dup(this.lastState);
	
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
	
	
	  _createClass(Transformable, [{
	    key: 'disable',
	    value: function disable() {
	      this.handles.classList.add('hidden');
	    }
	
	    /**
	     * Enable the handles.
	     */
	
	  }, {
	    key: 'enable',
	    value: function enable() {
	      this.handles.classList.remove('hidden');
	    }
	
	    /**
	     * Move the Transformable by an increment.
	     * @param {Object} inc - the position increment => {x: 42, y: 42}.
	     */
	
	  }, {
	    key: 'moveBy',
	    value: function moveBy(inc) {
	      this.currentState.x += inc.x;
	      this.currentState.y += inc.y;
	    }
	
	    /**
	     * Move the Transformable to a specific position.
	     * Warning : the Transformable's origin is not the top left but the center.
	     *
	     * @param {Object} position - the position where the element should be moved => {x: 42, y: 42}.
	     */
	
	  }, {
	    key: 'moveTo',
	    value: function moveTo(position) {
	      this.currentState.x = position.x;
	      this.currentState.y = position.y;
	    }
	
	    /**
	     * Resize the Transformable by an increment.
	     * @param {Object} resize - The resize values for the 4 sides of the element => {left:a, top:b, right:c, bottom:d}.
	     */
	
	  }, {
	    key: 'resizeBy',
	    value: function resizeBy(resize) {
	      resize.left = resize.left || 0;
	      resize.right = resize.right || 0;
	      resize.top = resize.top || 0;
	      resize.bottom = resize.bottom || 0;
	
	      var delta = {
	        x: resize.right + resize.left,
	        y: resize.top + resize.bottom
	      };
	
	      if (this.currentState.width + delta.x < this.minimumSize) {
	        delta.x = this.minimumSize - this.currentState.width;
	      }
	      if (this.currentState.height + delta.y < this.minimumSize) {
	        delta.y = this.minimumSize - this.currentState.height;
	      }
	
	      this.currentState.width += delta.x;
	      if (resize.left != 0) {
	        this.currentState.compensation.x -= delta.x / 2;
	      }
	      if (resize.right != 0) {
	        this.currentState.compensation.x += delta.x / 2;
	      }
	
	      this.currentState.height += delta.y;
	      if (resize.top != 0) {
	        this.currentState.compensation.y -= delta.y / 2;
	      }
	      if (resize.bottom != 0) {
	        this.currentState.compensation.y += delta.y / 2;
	      }
	    }
	
	    /**
	     * Rotate the Transformable by an angle.
	     * @param {Integer} angle - the angle to rotate to (in degree).
	     */
	
	  }, {
	    key: 'rotateBy',
	    value: function rotateBy(angle) {
	      this.currentState.angle += angle;
	    }
	
	    /**
	     * Set the rotation angle of the Transformable.
	     * @param {Integer} angle - the angle of the element after rotation (in degree).
	     */
	
	  }, {
	    key: 'rotateTo',
	    value: function rotateTo(angle) {
	      this.currentState.angle = angle;
	    }
	
	    /**
	     * Update the display of the Transformable based on its internal state.
	     */
	
	  }, {
	    key: 'update',
	    value: function update() {
	      this._transform(true);
	      this._normalize();
	    }
	
	    /**
	     * Get the center position (inside the container) of the Transformable.
	     */
	
	  }, {
	    key: 'center',
	    value: function center() {
	      var containerBoundingBox = this.container.getBoundingClientRect();
	      var boundingRect = this.element.getBoundingClientRect();
	
	      return this._positionFromWorldToContainer({
	        x: boundingRect.left + boundingRect.width / 2,
	        y: boundingRect.top + boundingRect.height / 2
	      });
	    }
	
	    /**
	     * Get the current width of the Transformable.
	     */
	
	  }, {
	    key: 'width',
	    value: function width() {
	      return this.currentState.width;
	    }
	
	    /**
	     * Get the current height of the Transformable.
	     */
	
	  }, {
	    key: 'height',
	    value: function height() {
	      return this.currentState.height;
	    }
	
	    /**
	     * Get the current position of the Transformable.
	     */
	
	  }, {
	    key: 'position',
	    value: function position() {
	      return { x: this.currentState.x, y: this.currentState.y };
	    }
	
	    /**
	     * Get the current angle (in degree) of the Transformable.
	     */
	
	  }, {
	    key: 'angle',
	    value: function angle() {
	      return this.currentState.angle;
	    }
	
	    ////////////////////////////////////////////
	    //// PROTECTED
	    ////////////////////////////////////////////
	
	  }, {
	    key: '_addHandles',
	    value: function _addHandles() {
	      this.element.insertAdjacentHTML('beforeend', '<div class="handles noselect"></div>');
	      this.handles = this.element.querySelector('.handles');
	
	      this._addMoveHandle();
	      this._addResizeHandles();
	      this._addRotationHandle();
	    }
	  }, {
	    key: '_addResizeHandles',
	    value: function _addResizeHandles() {
	      var handles = ['tl', 'tm', 'tr', 'ml', 'mr', 'bl', 'bm', 'br'];
	
	      this.resize_handles = {};
	      var _iteratorNormalCompletion = true;
	      var _didIteratorError = false;
	      var _iteratorError = undefined;
	
	      try {
	        for (var _iterator = handles[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	          var handle = _step.value;
	
	          this.handles.insertAdjacentHTML('beforeend', '<span class=\'resize_handles ' + handle + '\'></span>');
	          this.resize_handles[handle] = this.element.querySelector('.resize_handles.' + handle);
	          this.resize_handles[handle].addEventListener('mousedown', this._resizeOnMousedownBound);
	        }
	      } catch (err) {
	        _didIteratorError = true;
	        _iteratorError = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion && _iterator.return) {
	            _iterator.return();
	          }
	        } finally {
	          if (_didIteratorError) {
	            throw _iteratorError;
	          }
	        }
	      }
	    }
	  }, {
	    key: '_addMoveHandle',
	    value: function _addMoveHandle() {
	      this.handles.insertAdjacentHTML('beforeend', '\n        <span class=\'move_handle\'></span>\n    ');
	
	      this.move_handle = this.element.querySelector('.move_handle');
	      this.move_handle.addEventListener('mousedown', this._moveOnMousedownBound);
	    }
	  }, {
	    key: '_addRotationHandle',
	    value: function _addRotationHandle() {
	      this.handles.insertAdjacentHTML('beforeend', '\n        <span class=\'rotation_handle\'></span>\n    ');
	
	      this.rotation_handle = this.element.querySelector('.rotation_handle');
	      this.rotation_handle.addEventListener('mousedown', this._rotationOnMousedownBound);
	    }
	
	    /**
	     * Apply current state transformation to the element
	     * @param {Boolean} updateLastState update this.lastState to this.currentState if true at the end of the method.
	     */
	
	  }, {
	    key: '_transform',
	    value: function _transform() {
	      var updateLastState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
	
	      var s = this.currentState;
	      var transform = '\n      translate(' + s.x + 'px, ' + s.y + 'px)\n      rotate(' + s.angle + 'deg)\n      translate(calc(' + s.compensation.x + 'px - 50%), calc(' + s.compensation.y + 'px - 50%))\n      ';
	
	      this.element.style.width = s.width + 'px';
	      this.element.style.height = s.height + 'px';
	      this.element.style.transform = transform;
	      this.element.style.transformOrigin = 'left top';
	
	      if (updateLastState) {
	        this.lastState = _utils2.default.Dup(s);
	      }
	    }
	
	    /**
	     * Normalize the current position and clear compensation.
	     */
	
	  }, {
	    key: '_normalize',
	    value: function _normalize() {
	      var center = this.center();
	      this.currentState.x = center.x;
	      this.currentState.y = center.y;
	      this.currentState.compensation = { x: 0, y: 0 };
	      this._transform();
	    }
	
	    /**
	     * Transform the given world position into a position relative to the container given.
	     * @param {Object} pos - The world position to transform => {x:a, y:b}.
	     */
	
	  }, {
	    key: '_positionFromWorldToContainer',
	    value: function _positionFromWorldToContainer(pos) {
	      var containerBoundingBox = this.container.getBoundingClientRect();
	
	      return {
	        x: pos.x - containerBoundingBox.left,
	        y: pos.y - containerBoundingBox.top
	      };
	    }
	
	    //////////////////////////////////////////////
	    // CALLBACK
	    /////////////////////////////////////////////
	
	    ////////////
	    // move callback
	    ////////////
	
	  }, {
	    key: '_moveOnMousedown',
	    value: function _moveOnMousedown(event) {
	      //If left mouse
	      if (event.button == 0) {
	        this.emit('move:start');
	
	        this.moveInfos.initial = {
	          x: this.currentState.x,
	          y: this.currentState.y
	        };
	        this.moveInfos.mouse = this._positionFromWorldToContainer({
	          x: event.clientX,
	          y: event.clientY
	        });
	
	        this.container.addEventListener('mousemove', this._moveOnMousemoveBound);
	        document.addEventListener('mouseup', this._moveOnMouseupBound);
	      }
	    }
	  }, {
	    key: '_moveOnMousemove',
	    value: function _moveOnMousemove(event) {
	      this.emit('move:ongoing');
	
	      var relativePosition = this._positionFromWorldToContainer({
	        x: event.clientX,
	        y: event.clientY
	      });
	      var move = {
	        x: relativePosition.x - this.moveInfos.mouse.x + this.moveInfos.initial.x,
	        y: relativePosition.y - this.moveInfos.mouse.y + this.moveInfos.initial.y
	      };
	
	      this.moveTo(move);
	      this._transform();
	    }
	  }, {
	    key: '_moveOnMouseup',
	    value: function _moveOnMouseup(event) {
	      this.emit('move:stop');
	
	      this.update();
	
	      this.container.removeEventListener('mousemove', this._moveOnMousemoveBound);
	      document.removeEventListener('mouseup', this._moveOnMouseupBound);
	    }
	
	    ////////////
	    // resize callbacks
	    ////////////
	
	  }, {
	    key: '_resizeOnMousedown',
	    value: function _resizeOnMousedown(event) {
	      //If left mouse
	      if (event.button == 0) {
	        this.emit('resize:start');
	
	        var handleClass = Object.keys(this.resize_handles).filter(function (x) {
	          return event.target.classList.contains(x);
	        })[0];
	
	        //handles on the top or left side also change the position of the element to counterbalance the size change.
	        this.resizeInfos.resize = {
	          left: handleClass.includes('l'),
	          right: handleClass.includes('r'),
	          top: handleClass.includes('t'),
	          bottom: handleClass.includes('b')
	        };
	        this.resizeInfos.mouse = this._positionFromWorldToContainer({
	          x: event.clientX,
	          y: event.clientY
	        });
	
	        this.container.addEventListener('mousemove', this._resizeOnMousemoveBound);
	        document.addEventListener('mouseup', this._resizeOnMouseupBound);
	      }
	    }
	  }, {
	    key: '_resizeOnMousemove',
	    value: function _resizeOnMousemove(event) {
	      this.emit('resize:ongoing');
	
	      var relativePosition = this._positionFromWorldToContainer({
	        x: event.clientX,
	        y: event.clientY
	      });
	
	      //Rotate start and current mouse position to match this.element rotated referentiel
	      var center = this.center();
	      var start = {
	        x: this.resizeInfos.mouse.x - center.x,
	        y: this.resizeInfos.mouse.y - center.y
	      };
	      var current = {
	        x: relativePosition.x - center.x,
	        y: relativePosition.y - center.y
	      };
	      start = _utils2.default.Rotate(start, -this.currentState.angle);
	      current = _utils2.default.Rotate(current, -this.currentState.angle);
	
	      var delta = {
	        x: current.x - start.x,
	        y: current.y - start.y
	      };
	
	      var resize = {
	        left: 0,
	        right: 0,
	        top: 0,
	        bottom: 0
	      };
	      if (this.resizeInfos.resize.left) {
	        resize.left = -delta.x;
	      }
	      if (this.resizeInfos.resize.right) {
	        resize.right = delta.x;
	      }
	      if (this.resizeInfos.resize.top) {
	        resize.top = -delta.y;
	      }
	      if (this.resizeInfos.resize.bottom) {
	        resize.bottom = delta.y;
	      }
	
	      this.currentState = _utils2.default.Dup(this.lastState);
	      this.resizeBy(resize);
	      this._transform(false);
	    }
	  }, {
	    key: '_resizeOnMouseup',
	    value: function _resizeOnMouseup(event) {
	      this.emit('resize:stop');
	
	      this.update();
	
	      this.container.removeEventListener('mousemove', this._resizeOnMousemoveBound);
	      document.removeEventListener('mouseup', this._resizeOnMouseupBound);
	    }
	
	    ////////////
	    // Rotation callbacks
	    ////////////
	
	  }, {
	    key: '_rotationOnMousedown',
	    value: function _rotationOnMousedown(event) {
	      //If left mouse
	      if (event.button == 0) {
	        this.emit('rotation:start');
	
	        var relativePosition = this._positionFromWorldToContainer({
	          x: event.clientX,
	          y: event.clientY
	        });
	
	        this.rotationInfos.angle = this.currentState.angle;
	        this.rotationInfos.center = this.center();
	        this.rotationInfos.centerToMouse = {
	          x: relativePosition.x - this.rotationInfos.center.x,
	          y: this.rotationInfos.center.y - relativePosition.y
	        };
	
	        this.container.addEventListener('mousemove', this._rotationOnMousemoveBound);
	        document.addEventListener('mouseup', this._rotationOnMouseupBound);
	      }
	    }
	  }, {
	    key: '_rotationOnMousemove',
	    value: function _rotationOnMousemove(event) {
	      this.emit('rotation:ongoing');
	
	      var relativePosition = this._positionFromWorldToContainer({
	        x: event.clientX,
	        y: event.clientY
	      });
	
	      var centerToMouse = {
	        x: relativePosition.x - this.rotationInfos.center.x,
	        y: this.rotationInfos.center.y - relativePosition.y
	      };
	
	      var angle = _utils2.default.Angle(this.rotationInfos.centerToMouse, centerToMouse);
	      angle = Math.round(angle / this.rotationStep) * this.rotationStep;
	
	      this.rotateTo(this.rotationInfos.angle + angle);
	      this._transform();
	    }
	  }, {
	    key: '_rotationOnMouseup',
	    value: function _rotationOnMouseup(event) {
	      this.emit('rotation:stop');
	
	      this.update();
	
	      this.container.removeEventListener('mousemove', this._rotationOnMousemoveBound);
	      document.removeEventListener('mouseup', this._rotationOnMouseupBound);
	    }
	  }]);
	
	  return Transformable;
	}();
	
	exports.default = Transformable;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

	module.exports=function(n){var t={},e=[];n=n||this,n.on=function(e,r,l){return(t[e]=t[e]||[]).push([r,l]),n},n.off=function(r,l){r||(t={});for(var o=t[r]||e,u=o.length=l?o.length:0;u--;)l==o[u][0]&&o.splice(u,1);return n},n.emit=function(r){for(var l,o=t[r]||e,u=o.length>0?o.slice(0,o.length):o,i=0;l=u[i++];)l[0].apply(l[1],e.slice.call(arguments,1));return n}};

/***/ }),
/* 2 */
/***/ (function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var Utils = function () {
	  function Utils() {
	    _classCallCheck(this, Utils);
	  }
	
	  _createClass(Utils, null, [{
	    key: "Angle",
	    value: function Angle(target, source) {
	      //return (Math.atan2(target.y, target.x) - Math.atan2(target.y, target.x)) * 180 / Math.PI;
	      return Math.atan2(Utils.Cross(source, target), Utils.Dot(source, target)) * 180 / Math.PI;
	    }
	  }, {
	    key: "Dot",
	    value: function Dot(v1, v2) {
	      return v1.x * v2.x + v1.y * v2.y;
	    }
	  }, {
	    key: "Cross",
	    value: function Cross(v1, v2) {
	      return v1.x * v2.y - v1.y * v2.x;
	    }
	  }, {
	    key: "Rotate",
	    value: function Rotate(point, angle) {
	      var radians = Math.PI / 180 * angle;
	      var cos = Math.cos(radians);
	      var sin = Math.sin(radians);
	
	      return {
	        x: cos * point.x - sin * point.y,
	        y: cos * point.y + sin * point.x
	      };
	    }
	  }, {
	    key: "Dup",
	    value: function Dup(object) {
	      return JSON.parse(JSON.stringify(object));
	    }
	  }, {
	    key: "Wrap",
	    value: function Wrap(el, wrapper) {
	      el.parentNode.insertBefore(wrapper, el);
	      wrapper.appendChild(el);
	    }
	  }]);
	
	  return Utils;
	}();
	
	exports.default = Utils;

/***/ }),
/* 3 */
/***/ (function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/**
	 * Code taken from https://github.com/matthewmueller/unmatrix
	 */
	
	/**
	 * Expose `unmatrix`
	 */
	
	exports.default = unmatrix;
	
	/**
	 * Unmatrix
	 *
	 * @param {Element} el
	 * @return {Object}
	 */
	
	function unmatrix(el) {
	  return 'string' != typeof el ? parse(style(el)) : parse(el);
	}
	
	/**
	 * Unmatrix: parse the values of the matrix
	 *
	 * Algorithm from:
	 *
	 * - http://hg.mozilla.org/mozilla-central/file/7cb3e9795d04/layout/style/nsStyleAnimation.cpp
	 *
	 * @param {String} str
	 * @return {Object}
	 * @api public
	 */
	
	function parse(str) {
	  var m = stom(str);
	  var A = m[0];
	  var B = m[1];
	  var C = m[2];
	  var D = m[3];
	
	  if (A * D == B * C) throw new Error('transform#unmatrix: matrix is singular');
	
	  // step (3)
	  var scaleX = Math.sqrt(A * A + B * B);
	  A /= scaleX;
	  B /= scaleX;
	
	  // step (4)
	  var skew = A * C + B * D;
	  C -= A * skew;
	  D -= B * skew;
	
	  // step (5)
	  var scaleY = Math.sqrt(C * C + D * D);
	  C /= scaleY;
	  D /= scaleY;
	  skew /= scaleY;
	
	  // step (6)
	  if (A * D < B * C) {
	    A = -A;
	    B = -B;
	    skew = -skew;
	    scaleX = -scaleX;
	  }
	
	  return {
	    translateX: m[4],
	    translateY: m[5],
	    rotate: rtod(Math.atan2(B, A)),
	    skew: rtod(Math.atan(skew)),
	    scaleX: round(scaleX),
	    scaleY: round(scaleY)
	  };
	};
	
	/**
	 * Get the computed style
	 *
	 * @param {Element} el
	 * @return {String}
	 * @api private
	 */
	
	function style(el) {
	  var style = window.getComputedStyle(el);
	
	  return style.getPropertyValue('transform') || style.getPropertyValue('-webkit-transform') || style.getPropertyValue('-moz-transform') || style.getPropertyValue('-ms-transform') || style.getPropertyValue('-o-transform');
	};
	
	/**
	 * String to matrix
	 *
	 * @param {String} style
	 * @return {Array}
	 * @api private
	 */
	
	function stom(str) {
	  var m = [];
	
	  if (window.WebKitCSSMatrix) {
	    m = new window.WebKitCSSMatrix(str);
	    return [m.a, m.b, m.c, m.d, m.e, m.f];
	  }
	
	  var rdigit = /[\d\.\-]+/g;
	  var n;
	
	  while (n = rdigit.exec(str)) {
	    m.push(+n);
	  }
	
	  return m;
	};
	
	/**
	 * Radians to degrees
	 *
	 * @param {Number} radians
	 * @return {Number} degrees
	 * @api private
	 */
	
	function rtod(radians) {
	  var deg = radians * 180 / Math.PI;
	  return round(deg);
	}
	
	/**
	 * Round to the nearest hundredth
	 *
	 * @param {Number} n
	 * @return {Number}
	 * @api private
	 */
	
	function round(n) {
	  return Math.round(n * 100) / 100;
	}

/***/ })
/******/ ])
});
;
//# sourceMappingURL=transformable.js.map