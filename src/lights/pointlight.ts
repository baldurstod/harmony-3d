import { JSONObject } from 'harmony-types';
import { HarmonyMenuItemsDict } from 'harmony-ui';
import { registerEntity } from '../entities/entities';
import { Light, LightParameters, LightType } from './light';
import { PointLightShadow } from './pointlightshadow';

export type PointLightParameters = LightParameters & {
	range?: number,
};

export class PointLight extends Light {
	readonly isPointLight = true;

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

	static async constructFromJSON(json: JSONObject) {
		return new PointLight(json);
	}

	fromJSON(json: JSONObject) {
		super.fromJSON(json);
		this.range = json.range as number ?? this.range;
	}

	override buildContextMenu(): HarmonyMenuItemsDict {
		return Object.assign(super.buildContextMenu(), {
			range: { i18n: '#range', f: () => { const range = prompt('Range', String(this.range)); if (range !== null) { this.range = Number(range); } } },
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

	override getRaytracingLight(): LightType {
		return LightType.Point;
	}
}
registerEntity(PointLight);
