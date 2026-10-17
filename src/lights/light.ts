import { vec3 } from 'gl-matrix';

import { JSONObject } from 'harmony-types';
import { HarmonyMenuItemsDict } from 'harmony-ui';
import { Entity, EntityParameters } from '../entities/entity';
import { vec3ToJSON } from '../utils/json';
import { stringToVec3 } from '../utils/utils';
import { LightShadow } from './lightshadow';

const DEFAULT_LIGHT_COLOR = vec3.fromValues(1, 1, 1);
let defaultTextureSize = 1024;

export type LightParameters = EntityParameters & {
	color?: vec3,
	intensity?: number,
	radius?: number,
};

export enum LightType {
	// The values should be consistent with the values in the raytracing shader
	Ambient = 1,
	Point = 2,
	Spot = 3,
	Directional = 4,
}

export abstract class Light extends Entity {
	#intensity: number;
	#color: vec3;// TODO: use Color instead
	#range = 1000;
	shadow?: LightShadow;
	#shadowTextureSize: number = defaultTextureSize;
	readonly isLight = true;
	radius: number;// Radius for ray tracing

	constructor(parameters: LightParameters = {}) {
		super(parameters);
		this.#color = vec3.clone(parameters.color ?? DEFAULT_LIGHT_COLOR);
		this.#intensity = parameters.intensity ?? 1.0;
		this.radius = parameters.radius ?? 1.0;
		this.castShadow = false;
		this.isRenderable = true;
	}

	set color(color) {
		vec3.copy(this.#color, color);
	}

	get color(): vec3 {
		return this.#color;
	}

	set intensity(intensity) {
		this.#intensity = intensity;
	}

	get intensity(): number {
		return this.#intensity;
	}

	set range(range) {
		this.#range = range;
		if (this.shadow) {
			this.shadow.range = range;
		}
	}

	get range(): number {
		return this.#range;
	}

	set shadowTextureSize(shadowTextureSize) {
		this.#shadowTextureSize = shadowTextureSize;
		if (this.shadow) {
			this.shadow.textureSize = shadowTextureSize;
		}
	}

	get shadowTextureSize(): number {
		return this.#shadowTextureSize;
	}

	override buildContextMenu(): HarmonyMenuItemsDict {
		return Object.assign(super.buildContextMenu(), {
			Light_1: null,
			color: { i18n: '#color', f: (): void => { const color = prompt('Color', this.color.join(' ')); if (color !== null) { this.color = stringToVec3(color); } } },
			intensity: { i18n: '#intensity', f: (): void => { const intensity = prompt('Intensity', String(this.intensity)); if (intensity !== null) { this.intensity = Number(intensity); } } },
		}, this.shadow ? {
			texture_size: { i18n: '#texture_size', f: (): void => { const textureSize = prompt('Texture size', String(this.shadow?.textureSize[0] ?? defaultTextureSize)); if (textureSize !== null) { this.shadowTextureSize = Number.parseFloat(textureSize); } } }
		} : null);
	}

	toJSON(): JSONObject {
		const json = super.toJSON();
		json.color = vec3ToJSON(this.color);
		json.intensity = this.intensity;
		json.shadowtexturesize = this.shadowTextureSize;
		return json;
	}

	fromJSON(json: JSONObject): void {
		super.fromJSON(json);
		this.color = json.color as vec3 ?? DEFAULT_LIGHT_COLOR;
		this.intensity = json.intensity as number ?? 1;
		this.shadowTextureSize = json.shadowtexturesize as number ?? defaultTextureSize;
	}

	static set defaultTextureSize(textureSize: number) {
		defaultTextureSize = textureSize;
	}

	static override getEntityName(): string {
		return 'Light';
	}

	override is(s: string): boolean {
		return s == 'Light';
	}

	abstract getRaytracingLight(): LightType;
}
