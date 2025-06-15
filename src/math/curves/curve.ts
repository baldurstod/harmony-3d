import { vec3 } from 'gl-matrix';

export const DEFAULT_POINT = vec3.create();

export class Curve {
	controlPoints = [];
	arcLength = 0;

	getPosition(t, out = vec3.create()) {
		return out;
	}

	getArcLength(divisions = 100) {
		const pos = vec3.create();

		let last = vec3.create();
		let current = vec3.create();
		let temp;

		this.getPosition(0, last);
		let length = 0;

		for (let i = 1; i <= divisions; i++) {
			this.getPosition(i / divisions, current);
			length += vec3.distance(last, current);
			temp = last;
			last = current;
			current = temp;
		}
		return length;
	}

	getPoints(divisions = 5) {
		const points = [];

		for (let i = 0; i <= divisions; i++) {
			points.push(this.getPosition(i / divisions));
		}
		return points;
	}

	getAppropriateDivision(division) {
		return division;
	}
}
