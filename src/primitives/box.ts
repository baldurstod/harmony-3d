import { BoxBufferGeometry } from './geometries/boxbuffergeometry';
import { JSONLoader } from '../importers/jsonloader';
import { MeshBasicMaterial } from '../materials/meshbasicmaterial';
import { Mesh } from '../objects/mesh';
import { registerEntity } from '../entities/entities';
import { Material } from '../materials/material';

export class Box extends Mesh {
	#widthSegments: number;
	#heightSegments: number;
	#depthSegments: number;
	#width: number;
	#height: number;
	#depth: number;
	constructor(params: any = {}) {
		super(new BoxBufferGeometry(), params.material ?? new MeshBasicMaterial());
		this.#width = params.width ?? 1;
		this.#height = params.height ?? this.#width;
		this.#depth = params.depth ?? this.#width;
		this.#widthSegments = params.widthSegments ?? 1;
		this.#heightSegments = params.heightSegments ?? 1;
		this.#depthSegments = params.depthSegments ?? 1;
		this.#updateGeometry();
		super.setParameters(params);
	}

	#updateGeometry() {
		(this.geometry as BoxBufferGeometry).updateGeometry(this.#width, this.#height, this.#depth, this.#widthSegments, this.#heightSegments, this.#depthSegments);
	}

	buildContextMenu() {
		return Object.assign(super.buildContextMenu(), {
			Box_1: null,
			width: { i18n: '#width', f: () => { let width = prompt('Width', String(this.#width)); if (width) { this.#width = Number(width); this.#updateGeometry(); } } },
			height: { i18n: '#height', f: () => { let height = prompt('Height', String(this.#height)); if (height) { this.#height = Number(height); this.#updateGeometry(); } } },
			depth: { i18n: '#depth', f: () => { let depth = prompt('Depth', String(this.#depth)); if (depth) { this.#depth = Number(depth); this.#updateGeometry(); } } },
			cube: { i18n: '#cube', f: () => { let size: string | number = prompt('Cube size', '0'); if (size) { size = Number(size); this.#width = size; this.#height = size; this.#depth = size; this.#updateGeometry(); } } },
		});
	}

	toJSON() {
		let json = super.toJSON();
		json.width = this.#width;
		json.height = this.#height;
		json.depth = this.#depth;
		json.widthSegments = this.#widthSegments;
		json.heightSegments = this.#heightSegments;
		json.depthSegments = this.#depthSegments;
		json.material = this.material.toJSON();
		return json;
	}

	static async constructFromJSON(json, entities, loadedPromise) {
		let material = await JSONLoader.loadEntity(json.material, entities, loadedPromise);
		return new Box({ width: json.width, height: json.height, depth: json.depth, material: (material as Material), widthSegments: json.widthSegments, heightSegments: json.heightSegments, depthSegments: json.depthSegments });
	}

	/*dispose() {
		super.dispose();
		this.geometry.dispose();
		this.material.dispose();
	}*/

	static getEntityName() {
		return 'Box';
	}

	setSize(width: number, height: number, depth: number) {
		this.#width = width;
		this.#height = height;
		this.#depth = depth;
		this.#updateGeometry();
	}

	setwidth(width: number) {
		this.#width = width;
		this.#updateGeometry();
	}

	setHeight(height: number) {
		this.#height = height;
		this.#updateGeometry();
	}

	setDepth(depth: number) {
		this.#depth = depth;
		this.#updateGeometry();
	}
}
registerEntity(Box);
