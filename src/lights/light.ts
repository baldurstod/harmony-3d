import { vec3 } from 'gl-matrix';

import { Entity } from '../entities/entity';
import { stringToVec3 } from '../utils/utils';
import { LightShadow } from './lightshadow';
import { registerEntity } from '../entities/entities';

const DEFAULT_LIGHT_COLOR = vec3.fromValues(1, 1, 1);
let defaultTextureSize = 1024;

export class Light extends Entity {
	#intensity;
	#color;
	#range;
	shadow: LightShadow;
	#shadowTextureSize: number;
	isLight = true;
	constructor(parameters: any = {}) {
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
			color: { i18n: '#color', f: () => { let color = prompt('Color', this.color.join(' ')); if (color !== null) { this.color = stringToVec3(color); } } },
			intensity: { i18n: '#intensity', f: () => { let intensity = prompt('Intensity', this.intensity); if (intensity !== null) { this.intensity = intensity; } } },
		}, this.shadow ? {
			texture_size: { i18n: '#texture_size', f: () => { let textureSize = prompt('Texture size', this.shadow.textureSize[0]); if (textureSize !== null) { this.shadowTextureSize = Number.parseFloat(textureSize); } } }
		} : null);
	}

	toJSON() {
		let json = super.toJSON();
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

	get entityName() {
		return 'Light';
	}

	static get entityName() {
		return 'Light';
	}

	static getEntityName() {
		// TODO: remove next line, remove get entityName(), static get entityName() from this class and every decendant
		return this.entityName;
		return 'Light';
	}

	is(s: string): boolean {
		return s == 'Light';
	}
}
registerEntity(Light);
