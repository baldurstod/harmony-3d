import { vec3 } from 'gl-matrix';
import { registerEntity } from '../entities/entities';
import { JSONLoader } from '../importers/jsonloader';
import { Material } from '../materials/material';
import { MeshBasicMaterial } from '../materials/meshbasicmaterial';
import { Mesh, MeshParameters } from '../objects/mesh';
import { BoxBufferGeometry } from './geometries/boxbuffergeometry';
import { JSONObject } from 'harmony-types';
import { Entity } from '../entities/entity';

export type BoxParameters = MeshParameters & {
	width?: number,
	height?: number,
	depth?: number,
	widthSegments?: number,
	heightSegments?: number,
	depthSegments?: number,
	material?: Material,
};

export class Box extends Mesh {
	#widthSegments: number;
	#heightSegments: number;
	#depthSegments: number;
	#size = vec3.create();// width, height, depth

	constructor(params: BoxParameters = {}) {
		params.geometry = new BoxBufferGeometry();
		params.material = params.material ?? new MeshBasicMaterial();
		super(params);
		this.#size[0] = params.width ?? 1;
		this.#size[1] = params.height ?? this.#size[0];
		this.#size[2] = params.depth ?? this.#size[0];
		this.#widthSegments = params.widthSegments ?? 1;
		this.#heightSegments = params.heightSegments ?? 1;
		this.#depthSegments = params.depthSegments ?? 1;
		this.#updateGeometry();
		super.setParameters(params);
	}

	#updateGeometry() {
		(this.geometry as BoxBufferGeometry).updateGeometry(this.#size[0], this.#size[1], this.#size[2], this.#widthSegments, this.#heightSegments, this.#depthSegments);
	}

	buildContextMenu() {
		return Object.assign(super.buildContextMenu(), {
			Box_1: null,
			width: { i18n: '#width', f: () => { const width = prompt('Width', String(this.#size[0])); if (width) { this.#size[0] = Number(width); this.#updateGeometry(); } } },
			height: { i18n: '#height', f: () => { const height = prompt('Height', String(this.#size[1])); if (height) { this.#size[1] = Number(height); this.#updateGeometry(); } } },
			depth: { i18n: '#depth', f: () => { const depth = prompt('Depth', String(this.#size[2])); if (depth) { this.#size[2] = Number(depth); this.#updateGeometry(); } } },
			cube: { i18n: '#cube', f: () => { let size: string | number = prompt('Cube size', '0') ?? '0'; if (size) { size = Number(size); this.#size[0] = size; this.#size[1] = size; this.#size[2] = size; this.#updateGeometry(); } } },
		});
	}

	toJSON() {
		const json = super.toJSON();
		json.width = this.#size[0];
		json.height = this.#size[1];
		json.depth = this.#size[2];
		json.widthSegments = this.#widthSegments;
		json.heightSegments = this.#heightSegments;
		json.depthSegments = this.#depthSegments;
		json.material = this.material.toJSON();
		return json;
	}

	static async constructFromJSON(json: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>): Promise<Box | null> {
		const material = await JSONLoader.loadEntity(json.material as JSONObject, entities, loadedPromise);
		return new Box({ width: json.width as number, height: json.height as number, depth: json.depth as number, material: (material as Material), widthSegments: json.widthSegments as number, heightSegments: json.heightSegments as number, depthSegments: json.depthSegments as number });
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
		this.#size[0] = width;
		this.#size[1] = height;
		this.#size[2] = depth;
		this.#updateGeometry();
	}

	setSizeVec(size: vec3) {
		vec3.copy(this.#size, size);
		this.#updateGeometry();
	}

	setWidth(width: number) {
		this.#size[0] = width;
		this.#updateGeometry();
	}

	setHeight(height: number) {
		this.#size[1] = height;
		this.#updateGeometry();
	}

	setDepth(depth: number) {
		this.#size[2] = depth;
		this.#updateGeometry();
	}
}
registerEntity(Box);
