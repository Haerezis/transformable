class Utils {
  static Angle(target, source) {
    //return (Math.atan2(target.y, target.x) - Math.atan2(target.y, target.x)) * 180 / Math.PI;
    return Math.atan2(Utils.Cross(source, target), Utils.Dot(source, target)) * 180 / Math.PI;
  }

  static Dot(v1, v2) {
    return v1.x * v2.x + v1.y * v2.y;
  }

  static Cross(v1, v2) {
    return v1.x * v2.y - v1.y * v2.x;
  }

  static Wrap(el, wrapper) {
	    el.parentNode.insertBefore(wrapper, el);
	    wrapper.appendChild(el);
	}
}

export default Utils;
