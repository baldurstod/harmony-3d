import { JSONObject } from 'harmony-types';
import { BackGround } from '../backgrounds/background';
import { Camera } from '../cameras/camera';
import { registerEntity } from '../entities/entities';
import { Entity, EntityParameters } from '../entities/entity';
import { World } from '../objects/world';
import { Environment } from './environments/environment';

export type SceneParameters = EntityParameters & {
	camera?: Camera;
	background?: BackGround;
	environment?: Environment;
};

type Layer = any;

export class Scene extends Entity {
	#layers = new Map<Layer, number>();
	#world: World | null = null;
	background: BackGround | null;
	layers = new Set<Layer>();
	environment: Environment | null = null;
	activeCamera: Camera | null = null;

	constructor(parameters: SceneParameters = {}) {
		super(parameters);

		this.activeCamera = parameters.camera ?? null;
		this.background = parameters.background ?? null;
		this.environment = parameters.environment ?? null;

		this.#layers[Symbol.iterator] = function* (): MapIterator<[any, any]> {
			yield* [...this.entries()].sort(
				(a, b) => {
					return a[1] < b[1] ? -1 : 1;
				}
			);
		}
	}

	addLayer(layer: Layer, index: number): Layer {
		this.#layers.set(layer, index);
		this.#updateLayers();
		return layer;
	}

	removeLayer(layer: Layer): void {
		this.#layers.delete(layer);
		this.#updateLayers();
	}

	#updateLayers(): void {
		this.layers.clear();
		for (const [layer] of this.#layers) {
			this.layers.add(layer);
		}
	}

	setWorld(world: World): void {
		this.#world = world;
	}

	getWorld(): World | null {
		return this.#world;
	}

	toString(): string {
		return 'Scene ' + super.toString();
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	static override async constructFromJSON(json: JSONObject): Promise<Scene> {
		return new Scene({ name: json.name as string });
	}

	static override getEntityName(): string {
		return 'Scene';
	}

	override is(s: string): boolean {
		if (s == 'Scene') {
			return true;
		} else {
			return super.is(s);
		}
	}
}
registerEntity(Scene);
