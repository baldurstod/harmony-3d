import { vec3 } from 'gl-matrix';

import { Curve, DEFAULT_POINT } from './curve';

export class CubicBezierCurve extends Curve {
	p0 = vec3.create();
	p1 = vec3.create();
	p2 = vec3.create();
	p3 = vec3.create();
	constructor(p0 = DEFAULT_POINT, p1 = DEFAULT_POINT, p2 = DEFAULT_POINT, p3 = DEFAULT_POINT) {
		super();
		vec3.copy(this.p0, p0);
		vec3.copy(this.p1, p1);
		vec3.copy(this.p2, p2);
		vec3.copy(this.p3, p3);
		this.arcLength = this.getArcLength();
	}

	getPosition(t, out = vec3.create()) {
		//P = (1 - t)³ * P0 + 3 * (1 - t)² * t * P1 + 3 * (1 - t) * t² * P2 + t³ * P3
		let oneMinusT = 1 - t;
		let oneMinusTSqr = oneMinusT * oneMinusT;
		let tSqr = t * t;
		vec3.scale(out, this.p0, oneMinusTSqr * oneMinusT);
		vec3.scaleAndAdd(out, out, this.p1, 3 * oneMinusTSqr * t);
		vec3.scaleAndAdd(out, out, this.p2, 3 * oneMinusT * tSqr);
		vec3.scaleAndAdd(out, out, this.p3, tSqr * t);
		return out;
	}
}
