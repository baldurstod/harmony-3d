import { Material } from './material'
import { registerEntity } from '../entities/entities';

export class LineMaterial extends Material {
	#lineWidth:number = 1;
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
		let json = super.toJSON();
		json.linewidth = this.#lineWidth;
		return json;
	}

	static async constructFromJSON(json) {
		return new LineMaterial();
	}

	fromJSON(json) {
		super.fromJSON(json);
		this.lineWidth = json.linewidth;
	}

	static getEntityName(): string {
		return 'LineMaterial';
	}
}
Material.materialList['Line'] = LineMaterial;
registerEntity(LineMaterial);
