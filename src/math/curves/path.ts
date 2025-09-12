import { vec3 } from 'gl-matrix';

import { CubicBezierCurve } from './cubicbeziercurve';
import { Curve } from './curve';
import { LinearBezierCurve } from './linearbeziercurve';
import { QuadraticBezierCurve } from './quadraticbeziercurve';

const p0 = vec3.create();
const p1 = vec3.create();
const p2 = vec3.create();
const p3 = vec3.create();

export class Path extends Curve {
	looping: boolean;
	_curves: Curve[] = [];
	cursor = vec3.create();

	constructor(looping = false) {
		super();
		this.looping = looping;
	}

	set curves(curves) {
		this._curves.splice(0, Infinity, ...curves);
		this.arcLength = this.getArcLength();
	}

	get curves() {
		return this._curves;
	}

	addCurve(curve: Curve) {
		this._curves.push(curve);
		this.arcLength = this.getArcLength();
	}

	getArcLength(divisions?: number) {
		let length = 0;
		for (const curve of this._curves) {
			length += curve.getArcLength(divisions);
		}
		return length;
	}

	getPosition(t: number, out = vec3.create()) {
		const l = this.arcLength * t;
		let accumulate = 0;
		let accumulateTmp = 0;
		for (const curve of this._curves) {
			accumulateTmp += curve.arcLength;
			if (accumulateTmp > l) {
				const t2 = (l - accumulate) / curve.arcLength;
				return curve.getPosition(t2, out);
			}
			accumulate = accumulateTmp;
		}
		return out;
	}

	moveTo(p0: vec3) {
		vec3.copy(this.cursor, p0);
	}

	lineTo(p1: vec3) {
		this.addCurve(new LinearBezierCurve(this.cursor, p1));
		vec3.copy(this.cursor, p1);
	}

	quadraticCurveTo(p1: vec3, p2: vec3) {
		this.addCurve(new QuadraticBezierCurve(this.cursor, p1, p2));
		vec3.copy(this.cursor, p2);
	}

	bezierCurveTo(p1: vec3, p2: vec3, p3: vec3): Path {

		const curve = new CubicBezierCurve(
			this.cursor,
			p1,
			p2,
			p3,
		);

		this.curves.push(curve);

		vec3.copy(this.cursor, p3);

		return this;

	}

	cubicCurveTo(p1: vec3, p2: vec3, p3: vec3) {
		this.addCurve(new CubicBezierCurve(this.cursor, p1, p2, p3));
		vec3.copy(this.cursor, p3);
	}

	getPoints(divisions = 12): vec3[] {
		const points: vec3[] = [];
		let last;

		for (let i = 0, curves = this.curves; i < curves.length; i++) {
			const curve = curves[i]!;
			const resolution = curve.getAppropriateDivision(divisions);
			const pts = curve.getPoints(resolution);

			for (let j = 0; j < pts.length; j++) {
				const point = pts[j]!;
				if (last && vec3.equals(last, point)) {
					continue;
				}
				points.push(point);
				last = point;
			}
		}

		if (this.looping && points.length > 1 && !vec3.equals(points[0]!, points[points.length - 1]!)) {
			points.push(points[0]!);
		}
		return points;
	}

	fromSvgPath(path: string) {
		const pathArray = path.split(' ');
		let cmd;
		for (let i = 0, l = pathArray.length; i < l;) {
			switch (pathArray[i++]) {
				case 'm':
					vec3.set(p0, Number(pathArray[i++]), Number(pathArray[i++]), 0);
					this.moveTo(p0);
					break;
				case 'l':
					vec3.set(p1, Number(pathArray[i++]), Number(pathArray[i++]), 0);
					this.lineTo(p1);
					break;
				case 'q':
					vec3.set(p2, Number(pathArray[i++]), Number(pathArray[i++]), 0);
					vec3.set(p1, Number(pathArray[i++]), Number(pathArray[i++]), 0);
					this.quadraticCurveTo(p1, p2);
					break;
				case 'c':
					vec3.set(p3, Number(pathArray[i++]), Number(pathArray[i++]), 0);
					vec3.set(p1, Number(pathArray[i++]), Number(pathArray[i++]), 0);
					vec3.set(p2, Number(pathArray[i++]), Number(pathArray[i++]), 0);
					this.cubicCurveTo(p1, p2, p3);
					break;
				default:
			}
		}
	}
}
