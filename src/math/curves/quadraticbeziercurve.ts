import { vec3 } from 'gl-matrix';

import { Curve, DEFAULT_POINT } from './curve';

export class QuadraticBezierCurve extends Curve {
	p0 = vec3.create();
	p1 = vec3.create();
	p2 = vec3.create();
	constructor(p0 = DEFAULT_POINT, p1 = DEFAULT_POINT, p2 = DEFAULT_POINT) {
		super();
		vec3.copy(this.p0, p0);
		vec3.copy(this.p1, p1);
		vec3.copy(this.p2, p2);
		this.arcLength = this.getArcLength();
	}

	getPosition(t, out = vec3.create()) {
		//P = (1 - t)² * P0 + 2 * (1 - t) * t * P1 + t² * P2
		let oneMinusT = 1 - t;
		vec3.scale(out, this.p0, oneMinusT * oneMinusT);
		vec3.scaleAndAdd(out, out, this.p1, 2 * oneMinusT * t);
		vec3.scaleAndAdd(out, out, this.p2, t * t);
		return out;
	}
}
