import { registerEntity } from '../entities/entities';
import { Light, LightParameters } from './light';

export type AmbientLightParameters = LightParameters;

export class AmbientLight extends Light {
	isAmbientLight = true;

	constructor(params: AmbientLightParameters = {}) {
		super(params);
	}

	static async constructFromJSON(json: any) {
		return new AmbientLight(json);
	}

	static getEntityName() {
		return 'AmbientLight';
	}

	is(s: string): boolean {
		if (s == 'AmbientLight') {
			return true;
		} else {
			return super.is(s);
		}
	}
}
registerEntity(AmbientLight);
