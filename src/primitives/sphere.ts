import { vec3 } from 'gl-matrix';
import { registerEntity } from '../entities/entities';
import { Entity } from '../entities/entity';
import { JSONLoader } from '../importers/jsonloader';
import { Material } from '../materials/material';
import { MeshBasicMaterial } from '../materials/meshbasicmaterial';
import { PI, TAU } from '../math/constants';
import { Mesh, MeshParameters } from '../objects/mesh';
import { Intersection } from '../raycasting/intersection';
import { Raycaster } from '../raycasting/raycaster';
import { JSONObject } from 'harmony-types';
import { SphereBufferGeometry } from './geometries/spherebuffergeometry';

const intersectionPoint1 = vec3.create();
const intersectionPoint2 = vec3.create();
const intersectionNormal = vec3.create();
const tempVec3 = vec3.create();
const v = vec3.create();

export type SphereParameters = MeshParameters & {
	radius?: number,
	segments?: number,
	rings?: number,
	phiStart?: number,
	phiLength?: number,
	thetaStart?: number,
	thetaLength?: number,
	material?: Material,
};

export class Sphere extends Mesh {
	radius: number;
	segments: number;
	rings: number;
	phiStart: number;
	phiLength: number;
	thetaStart: number;
	thetaLength: number;
	isSphere = true;

	constructor(params: SphereParameters = {}) {
		params.geometry = new SphereBufferGeometry();
		params.material = params.material ?? new MeshBasicMaterial();
		super(params);
		this.radius = params.radius ?? 1;
		this.segments = params.segments ?? 8;
		this.rings = params.rings ?? 8;
		this.phiStart = params.phiStart ?? 0;
		this.phiLength = params.phiLength ?? TAU;
		this.thetaStart = params.thetaStart = 0;
		this.thetaLength = params.thetaLength ?? PI;

		this.updateGeometry();
		super.setParameters(arguments[0]);
	}

	setRadius(radius: number) {
		this.radius = radius;
		this.updateGeometry();
	}

	updateGeometry() {
		(this.geometry as SphereBufferGeometry).updateGeometry(this.radius, this.segments, this.rings, this.phiStart, this.phiLength, this.thetaStart, this.thetaLength);
	}

	buildContextMenu() {
		return Object.assign(super.buildContextMenu(), {
			Sphere_1: null,
			radius: { i18n: '#radius', f: () => { const radius = prompt('Radius', String(this.radius)); if (radius) { this.radius = Number(radius); this.updateGeometry(); } } },
			segments: { i18n: '#segments', f: () => { const segments = prompt('Segments', String(this.segments)); if (segments) { this.segments = Number(segments); this.updateGeometry(); } } },
			rings: { i18n: '#rings', f: () => { const rings = prompt('Rings', String(this.rings)); if (rings) { this.rings = Number(rings); this.updateGeometry(); } } }
		});
	}

	raycast(raycaster: Raycaster, intersections: Intersection[]) {
		const ray = raycaster.ray;
		const worldPosition = this.getWorldPosition(v);
		const inverseRadius = 1 / this.radius;
		if (ray.intersectSphere(worldPosition, this.radius, this.getWorldScale(tempVec3), intersectionPoint1, intersectionPoint2)) {
			//return super.raycast(raycaster, intersections);//TODO: improve
			//TODO: case when the ray spawn from inside the sphere
			vec3.sub(intersectionNormal, intersectionPoint1, worldPosition);
			vec3.scale(intersectionNormal, intersectionNormal, inverseRadius);
			intersections.push(ray.createIntersection(intersectionPoint1, intersectionNormal, null, this, 0));
			vec3.sub(intersectionNormal, intersectionPoint2, worldPosition);
			vec3.scale(intersectionNormal, intersectionNormal, inverseRadius);
			intersections.push(ray.createIntersection(intersectionPoint2, intersectionNormal, null, this, 0));
		}
	}

	toJSON() {
		const json = super.toJSON();
		json.radius = this.radius;
		json.segments = this.segments;
		json.rings = this.rings;
		json.phistart = this.phiStart;
		json.philength = this.phiLength;
		json.thetastart = this.thetaStart;
		json.thetalength = this.thetaLength;
		json.material = this.material.toJSON();
		return json;
	}

	static async constructFromJSON(json: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>): Promise<Sphere> {
		const material = await JSONLoader.loadEntity(json.material as JSONObject, entities, loadedPromise) as Material;
		return new Sphere({ radius: json.radius as number, material: material, segments: json.segments as number, rings: json.rings as number, phiStart: json.phistart as number, phiLength: json.philength as number, thetaStart: json.thetastart as number, thetaLength: json.thetalength as number });
	}

	static getEntityName() {
		return 'Sphere';
	}
}
registerEntity(Sphere);
