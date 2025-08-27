import { BackGround } from '../backgrounds/background';
import { Camera } from '../cameras/camera';
import { registerEntity } from '../entities/entities';
import { Entity, EntityParameters } from '../entities/entity';
import { World } from '../objects/world';
import { JSONObject } from '../types';
import { Environment } from './environments/environment';

export type SceneParameters = EntityParameters & {
	camera?: Camera;
	background?: BackGround;
	environment?: Environment;
};

export class Scene extends Entity {
	#layers = new Map<any/*TODO: create a layer type*/, number>();
	#world?: World;
	background?: BackGround;
	layers = new Set<any/*TODO: create a layer type*/>();
	environment?: Environment;
	activeCamera?: Camera;

	constructor(parameters: SceneParameters = {}) {
		super(parameters);

		this.activeCamera = parameters.camera;
		this.background = parameters.background;
		this.environment = parameters.environment;

		this.#layers[Symbol.iterator] = function* (): MapIterator<[any, any]> {
			yield* [...this.entries()].sort(
				(a, b) => {
					return a[1] < b[1] ? -1 : 1;
				}
			);
		}
	}

	addLayer(layer: any/*TODO: create a layer type*/, index: number) {
		this.#layers.set(layer, index);
		this.#updateLayers();
		return layer;
	}

	removeLayer(layer: any/*TODO: create a layer type*/) {
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

	static async constructFromJSON(json: JSONObject) {
		return new Scene({ name: json.name as string });
	}

	static getEntityName() {
		return 'Scene';
	}

	is(s: string): boolean {
		if (s == 'Scene') {
			return true;
		} else {
			return super.is(s);
		}
	}
}
registerEntity(Scene);
