import { registerEntity } from '../entities/entities';
import { Entity } from '../entities/entity';
import { JSONLoader } from '../importers/jsonloader';
import { Material } from '../materials/material';
import { MeshBasicMaterial } from '../materials/meshbasicmaterial';
import { Mesh, MeshParameters } from '../objects/mesh';
import { JSONObject } from '../types';
import { CylinderBufferGeometry } from './geometries/cylinderbuffergeometry';

export type CylinderParameters = MeshParameters & {
	radius?: number,
	height?: number,
	segments?: number,
	hasCap?: boolean,
	material?: Material,
};

export class Cylinder extends Mesh {
	#radius: number;
	#height: number;
	#segments: number;
	#hasCap: boolean;

	constructor(params: CylinderParameters = {}) {
		params.geometry = new CylinderBufferGeometry();
		params.material = params.material ?? new MeshBasicMaterial();
		super(params);
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
			radius: { i18n: '#radius', f: () => { const radius = prompt('Radius', String(this.#radius)); if (radius) { this.#radius = Number(radius); this.#updateGeometry(); } } },
			height: { i18n: '#height', f: () => { const height = prompt('Height', String(this.#height)); if (height) { this.#height = Number(height); this.#updateGeometry(); } } },
			segments: { i18n: '#segments', f: () => { const segments = prompt('Segments', String(this.#segments)); if (segments) { this.#segments = Number(segments); this.#updateGeometry(); } } },
			hasCap: { i18n: '#has_caps', f: () => { const hasCap = prompt('Has Caps', String(this.#hasCap)); if (hasCap) { this.#hasCap = (Number(hasCap) == 1); this.#updateGeometry(); } } },
		});
	}

	toJSON() {
		const json = super.toJSON();
		json.radius = this.#radius;
		json.height = this.#height;
		json.segments = this.#segments;
		json.hasCap = this.#hasCap;
		json.material = this.material.toJSON();
		return json;
	}

	static async constructFromJSON(json: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>): Promise<Cylinder | null> {
		const material = await JSONLoader.loadEntity(json.material as JSONObject, entities, loadedPromise) as Material;
		return new Cylinder({ radius: json.radius as number, height: json.height as number, material: material, segments: json.segments as number, hasCap: json.hasCap as boolean });
	}

	static getEntityName() {
		return 'Cylinder';
	}
}
registerEntity(Cylinder);
