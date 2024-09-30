import { Light } from './light';
import { registerEntity } from '../entities/entities';

export class AmbientLight extends Light {
	isAmbientLight = true;
	constructor(params: any = {}) {
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
