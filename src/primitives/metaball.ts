import { vec3 } from 'gl-matrix';
import { HarmonyMenuItemsDict } from 'harmony-ui';
import { Entity } from '../entities/entity';

export class Metaball extends Entity {
	readonly currentWorldPosition = vec3.create();
	radius = 0;
	radius2 = 0;

	constructor(radius = 1) {
		super();
		this.setRadius(radius);
	}

	setRadius(radius: number): void {
		this.radius = radius;
		this.radius2 = radius * radius;
	}

	override buildContextMenu(): HarmonyMenuItemsDict {
		return Object.assign(super.buildContextMenu(), {
			Metaball_1: null,
			radius: { i18n: '#radius', f: () => { const radius = prompt('Radius', String(this.radius)); if (radius) { this.setRadius(Number(radius)); } } }
		});
	}
}
