import { Entity } from '../entities/entity';
import { JSONLoader } from '../importers/jsonloader';
import { Material } from '../materials/material';
import { MeshBasicMaterial } from '../materials/meshbasicmaterial';
import { Mesh, MeshParameters } from '../objects/mesh';
import { JSONObject } from '../types';
import { PlaneBufferGeometry } from './geometries/planebuffergeometry';

export type PlaneParameters = MeshParameters & {
	width?: number,
	height?: number,
	widthSegments?: number,
	heightSegments?: number,
	material?: Material,
};

export class Plane extends Mesh {
	#widthSegments: number;
	#heightSegments: number;
	#width: number;
	#height: number;

	constructor(params: PlaneParameters = {}) {
		params.geometry = new PlaneBufferGeometry();
		params.material = params.material ?? new MeshBasicMaterial();
		super(params);
		this.#width = params.width ?? 1;
		this.#height = params.height ?? this.#width;
		this.#widthSegments = params.widthSegments ?? 1;
		this.#heightSegments = params.heightSegments ?? 1;
		this.#updateGeometry();
	}

	setWidth(width: number) {
		this.#width = width;
		this.#updateGeometry();
	}

	setHeight(height: number) {
		this.#height = height;
		this.#updateGeometry();
	}

	setSize(width: number, height?: number) {
		this.#width = width;
		this.#height = height ?? width;
		this.#updateGeometry();
	}

	#updateGeometry() {
		(this.geometry as PlaneBufferGeometry).updateGeometry(this.#width, this.#height, this.#widthSegments, this.#heightSegments);
	}

	buildContextMenu() {
		return Object.assign(super.buildContextMenu(), {
			Plane_1: null,
			width: { i18n: '#width', f: () => { const width = prompt(); if (width) { this.#width = Number(width); this.#updateGeometry(); } } },
			height: { i18n: '#height', f: () => { const height = prompt(); if (height) { this.#height = Number(height); this.#updateGeometry(); } } },
			square: { i18n: '#square', f: () => { const size = Number(prompt('Square size')); if (size) { this.#width = size; this.#height = size; this.#updateGeometry(); } } },
		});
	}

	toJSON() {
		const json = super.toJSON();
		json.width = this.#width;
		json.height = this.#height;
		json.widthSegments = this.#widthSegments;
		json.heightsegments = this.#heightSegments;
		json.material = this.material!.toJSON();
		return json;
	}

	static async constructFromJSON(json: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>) {
		const material = await JSONLoader.loadEntity(json.material, entities, loadedPromise) as Material;
		return new Plane({ width: json.width as number, height: json.height as number, material: material, widthSegments: json.widthSegments as number, heightSegments: json.heightSegments as number });
	}

	static getEntityName() {
		return 'Plane';
	}
}
JSONLoader.registerEntity(Plane);
