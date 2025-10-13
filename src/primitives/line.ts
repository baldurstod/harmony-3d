import { vec3 } from 'gl-matrix';
import { JSONObject } from 'harmony-types';
import { registerEntity } from '../entities/entities';
import { Entity } from '../entities/entity';
import { JSONLoader } from '../importers/jsonloader';
import { LineMaterial } from '../materials/linematerial';
import { Material } from '../materials/material';
import { Mesh, MeshParameters } from '../objects/mesh';
import { Intersection } from '../raycasting/intersection';
import { Raycaster } from '../raycasting/raycaster';
import { vec3ToJSON } from '../utils/json';
import { LineSegmentsGeometry } from './geometries/linesegmentsgeometry';

const DEFAULT_VEC3 = vec3.create();

export type LineParameters = MeshParameters & {
	start?: vec3,
	end?: vec3,
};

export class Line extends Mesh {
	isLine = true;
	#start = vec3.create();
	#end = vec3.create();

	constructor(params: LineParameters = {}) {
		params.geometry = new LineSegmentsGeometry();
		params.material = params.material ?? new LineMaterial();
		super(params);
		if (params.start) {
			vec3.copy(this.#start, params.start);
		}
		if (params.end) {
			vec3.copy(this.#end, params.end);
		}
		this.#updateGeometry();
	}

	set start(start: vec3) {
		vec3.copy(this.#start, start);
		this.#updateGeometry();
	}

	getStart(start = vec3.create()) {
		return vec3.copy(start, this.#start);
	}

	set end(end: vec3) {
		vec3.copy(this.#end, end);
		this.#updateGeometry();
	}

	getEnd(end = vec3.create()) {
		return vec3.copy(end, this.#end);
	}

	#updateGeometry() {
		(this.geometry as LineSegmentsGeometry).setSegments([...this.#start, ...this.#end], [], false);
	}

	raycast(raycaster: Raycaster, intersections: Intersection[]) {
		const interSegment = vec3.create();
		const interRay = vec3.create();
		const ray = raycaster.ray;
		const sqrDist = ray.distanceSqToSegment(this.#start, this.#end, interRay, interSegment);
		if (sqrDist < 10) {//TODO: variable
			intersections.push(ray.createIntersection(interRay, null, null, this, sqrDist));
		}
	}

	toJSON() {
		const json = super.toJSON();
		json.start = vec3ToJSON(this.start);
		json.end = vec3ToJSON(this.end);
		json.material = this.getMaterial().toJSON();
		return json;
	}

	static async constructFromJSON(json: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>): Promise<Line> {
		const material = await JSONLoader.loadEntity(json.material as JSONObject, entities, loadedPromise) as Material;
		return new Line({ start: json.start as vec3, end: json.end as vec3, material: material });
	}

	static getEntityName() {
		return 'Line';
	}
}
registerEntity(Line);
