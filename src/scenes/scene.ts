import { quat, vec3 } from 'gl-matrix';

import { Entity } from '../entities/entity';
import { JSONLoader } from '../loaders/jsonloader'
import { World } from '../objects/world';
import { BackGround } from '../backgrounds/background';
import { Environment } from './environments/environment';

export class Scene extends Entity {
	#layers = new Map();
	#world?: World;
	background?: BackGround;
	layers = new Set();
	environment?: Environment;
	constructor(parameters?: any) {
		super(parameters);
		this.#layers[Symbol.iterator] = function* () {
			yield* [...this.entries()].sort(
				(a, b) => {
					return a[1] < b[1] ? -1 : 1;
				}
			);
		}
	}

	addLayer(layer, index) {
		this.#layers.set(layer, index);
		this.#updateLayers();
		return layer;
	}

	removeLayer(layer) {
		this.#layers.delete(layer);
		this.#updateLayers();
	}

	#updateLayers() {
		this.layers.clear();
		for (const [layer, index] of this.#layers) {
			this.layers.add(layer);
		}
	}

	setWorld(world: World) {
		this.#world = world;
	}

	getWorld() {
		return this.#world;
	}

	toString() {
		return 'Scene ' + super.toString();
	}

	static async constructFromJSON(json) {
		return new Scene({ name: json.name });
	}

	get entityName() {
		return 'Scene';
	}

	static get entityName() {
		return 'Scene';
	}

	is(s: string) {
		if (s == 'Scene') {
			return true;
		} else {
			return super.is(s);
		}
	}
}
JSONLoader.registerEntity(Scene);
