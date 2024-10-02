import { vec3 } from 'gl-matrix';

import { Curve, DEFAULT_POINT } from './curve';

export class LinearBezierCurve extends Curve {
	p0 = vec3.create();
	p1 = vec3.create();
	constructor(p0 = DEFAULT_POINT, p1 = DEFAULT_POINT) {
		super();
		vec3.copy(this.p0, p0);
		vec3.copy(this.p1, p1);
		this.arcLength = this.getArcLength();
	}

	getPosition(t, out = vec3.create()) {
		if (t === 0) {
			vec3.copy(out, this.p0);
		} else if (t === 1) {
			vec3.copy(out, this.p1);
		} else {
			vec3.sub(out, this.p1, this.p0);
			vec3.scaleAndAdd(out, this.p0, out, t);
		}
		return out;
	}

	getArcLength() {
		return vec3.distance(this.p0, this.p1);
	}

	getAppropriateDivision() {
		return 1;
	}
}
