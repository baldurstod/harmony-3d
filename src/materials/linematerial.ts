import { JSONObject } from 'harmony-types';
import { registerEntity } from '../entities/entities';
import { Material } from './material';

export class LineMaterial extends Material {
	#lineWidth = 1;
	constructor(params: any = {}) {
		super(params);
		this.lineWidth = params?.lineWidth ?? 10;
		this.setValues(params);
	}

	override getShaderSource(): string {
		return 'line';
	}

	set lineWidth(lineWidth: number) {
		this.#lineWidth = lineWidth;
		this.setUniformValue('linewidth', lineWidth);
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

	override getRaytracingMaterial(index: number): null {
		return null;
	}
}
Material.materialList['Line'] = LineMaterial;
registerEntity(LineMaterial);
