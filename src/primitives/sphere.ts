import { vec3 } from 'gl-matrix';

import { SphereBufferGeometry } from './geometries/spherebuffergeometry';
import { JSONLoader } from '../importers/jsonloader';
import { MeshBasicMaterial } from '../materials/meshbasicmaterial';
import { Mesh } from '../objects/mesh';
import { PI, TAU } from '../math/constants';
import { registerEntity } from '../entities/entities';

let intersectionPoint1 = vec3.create();
let intersectionPoint2 = vec3.create();
let intersectionNormal = vec3.create();
const tempVec3 = vec3.create();
let v = vec3.create();

export class Sphere extends Mesh {
	radius: number;
	segments: number;
	rings: number;
	phiStart: number;
	phiLength: number;
	thetaStart: number;
	thetaLength: number;
	isSphere = true;

	constructor(params: any = {}) {
		super(new SphereBufferGeometry(), params.material ?? new MeshBasicMaterial());
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

	setRadius(radius:number) {
		this.radius = radius;
		this.updateGeometry();
	}

	updateGeometry() {
		(this.geometry as SphereBufferGeometry).updateGeometry(this.radius, this.segments, this.rings, this.phiStart, this.phiLength, this.thetaStart, this.thetaLength);
	}

	buildContextMenu() {
		return Object.assign(super.buildContextMenu(), {
			Sphere_1: null,
			radius: { i18n: '#radius', f: () => { let radius = prompt('Radius', String(this.radius)); if (radius) { this.radius = Number(radius); this.updateGeometry(); } } },
			segments: { i18n: '#segments', f: () => { let segments = prompt('Segments', String(this.segments)); if (segments) { this.segments = Number(segments); this.updateGeometry(); } } },
			rings: { i18n: '#rings', f: () => { let rings = prompt('Rings', String(this.rings)); if (rings) { this.rings = Number(rings); this.updateGeometry(); } } }
		});
	}

	raycast(raycaster, intersections) {
		let ray = raycaster.ray;
		let worldPosition = this.getWorldPosition(v);
		let inverseRadius = 1 / this.radius;
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
		let json = super.toJSON();
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

	static async constructFromJSON(json, entities, loadedPromise) {
		let material = await JSONLoader.loadEntity(json.material, entities, loadedPromise);
		return new Sphere({ radius: json.radius, material: material, segments: json.segments, rings: json.rings, phiStart: json.phistart, phiLength: json.philength, thetaStart: json.thetastart, thetaLength: json.thetalength });
	}

	static getEntityName() {
		return 'Sphere';
	}
}
registerEntity(Sphere);
