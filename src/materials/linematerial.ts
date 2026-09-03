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

	toJSON(): JSONObject {
		const json = super.toJSON();
		json.linewidth = this.#lineWidth;// TODO: change json property name to camel case
		return json;
	}

	// eslint-disable-next-line @typescript-eslint/require-await
	static override async constructFromJSON(json: JSONObject): Promise<LineMaterial> {
		return new LineMaterial({ lineWidth: json.linewidth as number });//TODO: check value
	}

	fromJSON(json: JSONObject): void {
		super.fromJSON(json);
		this.lineWidth = json.linewidth as number;
	}

	static override getEntityName(): string {
		return 'LineMaterial';
	}

	override getRaytracingMaterial(): null {
		return null;
	}
}
Material.materialList['Line'] = LineMaterial;
registerEntity(LineMaterial);
