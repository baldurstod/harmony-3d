import { Material } from './material'
import { registerEntity } from '../entities/entities';
import { JSONObject } from 'harmony-types';

export class LineMaterial extends Material {
	#lineWidth = 1;
	constructor(params: any = {}) {
		super(params);
		this.lineWidth = params?.lineWidth ?? 10;
		this.setValues(params);
	}

	getShaderSource(): string {
		return 'line';
	}

	set lineWidth(lineWidth: number) {
		this.#lineWidth = lineWidth;
		this.uniforms['linewidth'] = lineWidth;
	}

	toJSON() {
		const json = super.toJSON();
		json.linewidth = this.#lineWidth;
		return json;
	}

	static async constructFromJSON(json: JSONObject) {
		return new LineMaterial();
	}

	fromJSON(json: JSONObject) {
		super.fromJSON(json);
		this.lineWidth = json.linewidth as number;
	}

	static getEntityName(): string {
		return 'LineMaterial';
	}
}
Material.materialList['Line'] = LineMaterial;
registerEntity(LineMaterial);
