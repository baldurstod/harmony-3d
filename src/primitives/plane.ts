import { PlaneBufferGeometry } from './geometries/planebuffergeometry';
import { JSONLoader } from '../importers/jsonloader';
import { MeshBasicMaterial } from '../materials/meshbasicmaterial';
import { Mesh } from '../objects/mesh';
import { Material } from '../materials/material';
import { JSONObject } from '../types';
import { Entity } from '../entities/entity';

export class Plane extends Mesh {
	#widthSegments: number;
	#heightSegments: number;
	#width: number;
	#height: number;

	//constructor({ width = 1, height, material = new MeshBasicMaterial(), widthSegments = 1, heightSegments = 1 } = {}) {
	constructor(params: any = {}) {
		super(new PlaneBufferGeometry(), params.material ?? new MeshBasicMaterial());
		super.setParameters(arguments[0]);
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
			width: { i18n: '#width', f: () => { let width = prompt(); if (width) { this.#width = Number(width); this.#updateGeometry(); } } },
			height: { i18n: '#height', f: () => { let height = prompt(); if (height) { this.#height = Number(height); this.#updateGeometry(); } } },
			square: { i18n: '#square', f: () => { let size = Number(prompt('Square size')); if (size) { this.#width = size; this.#height = size; this.#updateGeometry(); } } },
		});
	}

	toJSON() {
		let json = super.toJSON();
		json.width = this.#width;
		json.height = this.#height;
		json.widthSegments = this.#widthSegments;
		json.heightsegments = this.#heightSegments;
		json.material = this.material!.toJSON();
		return json;
	}

	static async constructFromJSON(json: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>) {
		let material = await JSONLoader.loadEntity(json.material, entities, loadedPromise);
		return new Plane({ width: json.width, height: json.height, material: material, widthSegments: json.widthSegments, heightSegments: json.heightSegments });
	}

	static getEntityName() {
		return 'Plane';
	}
}
JSONLoader.registerEntity(Plane);
