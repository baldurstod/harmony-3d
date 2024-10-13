import { vec3 } from 'gl-matrix';
import { Entity } from '../entities/entity';

export class Metaball extends Entity {
	currentWorldPosition = vec3.create();
	radius: number;
	radius2: number;
	constructor(radius = 1) {
		super();
		this.setRadius(radius);
	}

	setRadius(radius: number) {
		this.radius = radius;
		this.radius2 = radius * radius;
	}

	buildContextMenu() {
		return Object.assign(super.buildContextMenu(), {
			Metaball_1: null,
			radius: { i18n: '#radius', f: () => { let radius = prompt('Radius', String(this.radius)); if (radius) { this.setRadius(Number(radius)); } } }
		});
	}
}
