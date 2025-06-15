import { vec3 } from 'gl-matrix';

import { Entity, EntityParameters } from '../entities/entity';
import { stringToVec3 } from '../utils/utils';
import { LightShadow } from './lightshadow';
import { registerEntity } from '../entities/entities';

const DEFAULT_LIGHT_COLOR = vec3.fromValues(1, 1, 1);
let defaultTextureSize = 1024;

export type LightParameters = EntityParameters & {
	color?: vec3,
	intensity?: number,
};

export class Light extends Entity {
	#intensity: number;
	#color: vec3;
	#range;
	shadow: LightShadow;
	#shadowTextureSize: number;
	isLight = true;

	constructor(parameters: LightParameters = {}) {
		super(parameters);
		this.#color = vec3.clone(parameters.color ?? DEFAULT_LIGHT_COLOR);
		this.#intensity = parameters.intensity ?? 1.0;
		this.castShadow = false;
		this.isRenderable = true;
		this.shadowTextureSize = defaultTextureSize;
	}

	set color(color) {
		vec3.copy(this.#color, color);
	}

	get color() {
		return this.#color;
	}

	set intensity(intensity) {
		this.#intensity = intensity;
	}

	get intensity() {
		return this.#intensity;
	}

	set range(range) {
		this.#range = range;
		if (this.shadow) {
			this.shadow.range = range;
		}
	}

	get range() {
		return this.#range;
	}

	set shadowTextureSize(shadowTextureSize) {
		this.#shadowTextureSize = shadowTextureSize;
		if (this.shadow) {
			this.shadow.textureSize = shadowTextureSize;
		}
	}

	get shadowTextureSize() {
		return this.#shadowTextureSize;
	}

	buildContextMenu() {
		return Object.assign(super.buildContextMenu(), {
			Light_1: null,
			color: { i18n: '#color', f: () => { const color = prompt('Color', this.color.join(' ')); if (color !== null) { this.color = stringToVec3(color); } } },
			intensity: { i18n: '#intensity', f: () => { const intensity = prompt('Intensity', String(this.intensity)); if (intensity !== null) { this.intensity = Number(intensity); } } },
		}, this.shadow ? {
			texture_size: { i18n: '#texture_size', f: () => { const textureSize = prompt('Texture size', String(this.shadow.textureSize[0])); if (textureSize !== null) { this.shadowTextureSize = Number.parseFloat(textureSize); } } }
		} : null);
	}

	toJSON() {
		const json = super.toJSON();
		json.color = this.color;
		json.intensity = this.intensity;
		json.shadowtexturesize = this.shadowTextureSize;
		return json;
	}

	static async constructFromJSON(json) {
		return new Light(json);
	}

	fromJSON(json) {
		super.fromJSON(json);
		this.color = json.color ?? DEFAULT_LIGHT_COLOR;
		this.intensity = json.intensity ?? 1;
		this.shadowTextureSize = json.shadowtexturesize ?? defaultTextureSize;
	}

	static set defaultTextureSize(textureSize) {
		defaultTextureSize = textureSize;
	}

	static getEntityName() {
		return 'Light';
	}

	is(s: string): boolean {
		return s == 'Light';
	}
}
registerEntity(Light);
