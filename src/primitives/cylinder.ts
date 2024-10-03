import { CylinderBufferGeometry } from './geometries/cylinderbuffergeometry';
import { JSONLoader } from '../importers/jsonloader';
import { MeshBasicMaterial } from '../materials/meshbasicmaterial';
import { Mesh } from '../objects/mesh';
import { registerEntity } from '../entities/entities';

export class Cylinder extends Mesh {
	#radius: number;
	#height: number;
	#segments: number;
	#hasCap: boolean;
	constructor(params: any = {}) {
		super(new CylinderBufferGeometry(), params.material ?? new MeshBasicMaterial());
		super.setParameters(params);
		this.#radius = params.radius ?? 1;
		this.#height = params.height ?? 1;
		this.#segments = params.segments ?? 24;
		this.#hasCap = params.hasCap ?? true;
		this.#updateGeometry();
	}

	#updateGeometry() {
		(this.geometry as CylinderBufferGeometry).updateGeometry(this.#radius, this.#height, this.#segments, this.#hasCap);
	}

	buildContextMenu() {
		return Object.assign(super.buildContextMenu(), {
			Cylinder_1: null,
			radius: { i18n: '#radius', f: () => { let radius = prompt('Radius', String(this.#radius)); if (radius) { this.#radius = Number(radius); this.#updateGeometry(); } } },
			height: { i18n: '#height', f: () => { let height = prompt('Height', String(this.#height)); if (height) { this.#height = Number(height); this.#updateGeometry(); } } },
			segments: { i18n: '#segments', f: () => { let segments = prompt('Segments', String(this.#segments)); if (segments) { this.#segments = Number(segments); this.#updateGeometry(); } } },
			hasCap: { i18n: '#has_caps', f: () => { let hasCap = prompt('Has Caps', String(this.#hasCap)); if (hasCap) { this.#hasCap = (Number(hasCap) == 1); this.#updateGeometry(); } } },
		});
	}

	toJSON() {
		let json = super.toJSON();
		json.radius = this.#radius;
		json.height = this.#height;
		json.segments = this.#segments;
		json.hasCap = this.#hasCap;
		json.material = this.material.toJSON();
		return json;
	}

	static async constructFromJSON(json, entities, loadedPromise) {
		let material = await JSONLoader.loadEntity(json.material, entities, loadedPromise);
		return new Cylinder({ radius: json.radius, height: json.height, material: material, segments: json.segments, hasCap: json.hasCap });
	}

	static getEntityName() {
		return 'Cylinder';
	}
}
registerEntity(Cylinder);
