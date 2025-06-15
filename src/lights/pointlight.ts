import { Light, LightParameters } from './light';
import { PointLightShadow } from './pointlightshadow';
import { registerEntity } from '../entities/entities';

export type PointLightParameters = LightParameters & {
	range?: number,
};

export class PointLight extends Light {
	isPointLight = true;

	constructor(params: PointLightParameters = {}) {
		super(params);
		this.range = params.range ?? 100.0;
	}

	set castShadow(castShadow: boolean | undefined) {
		super.castShadow = castShadow;
		if (this.castShadow) {
			this.shadow = new PointLightShadow(this);
			this.shadow.range = this.range;
		} else {
			//TODO : dispose of the shadow
		}
	}

	get castShadow() {
		return super.castShadow;
	}

	toJSON() {
		const json = super.toJSON();
		json.range = this.range;
		return json;
	}

	static async constructFromJSON(json) {
		return new PointLight(json);
	}

	fromJSON(json) {
		super.fromJSON(json);
		this.range = json.range ?? this.range;
	}

	buildContextMenu() {
		return Object.assign(super.buildContextMenu(), {
			range: { i18n: '#range', f: () => { const range = prompt('Range', this.range); if (range !== null) { this.range = range; } } },
		});
	}

	static getEntityName() {
		return 'PointLight';
	}

	is(s: string): boolean {
		if (s == 'PointLight') {
			return true;
		} else {
			return super.is(s);
		}
	}
}
registerEntity(PointLight);
