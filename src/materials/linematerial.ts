import { JSONObject } from 'harmony-types';
import { registerEntity } from '../entities/entities';
import { Material, MaterialParams } from './material';

export type LineMaterialParams = MaterialParams & {
	// Line width, in pixels. Default to 1
	lineWidth?: number;
};

export class LineMaterial extends Material {
	#lineWidth = 1;

	constructor(params: LineMaterialParams = {}) {
		super(params);
		this.lineWidth = params?.lineWidth ?? 1;
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

	static override async constructFromJSON(json: JSONObject) {
		return new LineMaterial();
	}

	fromJSON(json: JSONObject) {
		super.fromJSON(json);
		this.lineWidth = json.linewidth as number;
	}

	static override getEntityName(): string {
		return 'LineMaterial';
	}

	override getRaytracingMaterial(index: number): null {
		return null;
	}
}
Material.materialList['Line'] = LineMaterial;
registerEntity(LineMaterial);
