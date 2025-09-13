import { JSONLoader } from '../importers/jsonloader';
import { LineSegments } from './linesegments';
import { TWO_PI } from '../math/constants';
import { registerEntity } from '../entities/entities';
import { JSONObject } from '../types';
import { Entity } from '../entities/entity';
import { Material } from '../materials/material';

export class Circle extends LineSegments {
	#radius: number;
	#segments: number;
	#startAngle: number;
	#endAngle: number;
	constructor(params: any = {}) {
		super(params);
		super.setParameters(params);
		this.#radius = params.radius ?? 1;
		this.#segments = params.segments ?? 64;
		this.#startAngle = params.startAngle ?? 0;
		this.#endAngle = params.endAngle ?? TWO_PI;
		this.#update();
	}

	#update() {
		const startEnd = [];
		const a = (this.#endAngle - this.#startAngle) / this.#segments;
		for (let i = 0; i < this.#segments + 1; i++) {
			const theta = a * i + this.#startAngle;
			const x = this.#radius * Math.cos(theta);
			const y = this.#radius * Math.sin(theta);
			startEnd.push(x);
			startEnd.push(y);
			startEnd.push(0);
		}

		this.setSegments(startEnd);
	}

	toJSON() {
		const json = super.toJSON();
		json.radius = this.#radius;
		json.segments = this.#segments;
		json.startAngle = this.#startAngle;
		json.endAngle = this.#endAngle;
		json.material = this.material.toJSON();
		return json;
	}

	static async constructFromJSON(json: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>): Promise<Circle | null> {
		const material = await JSONLoader.loadEntity(json.material as JSONObject, entities, loadedPromise);
		return new Circle({ radius: json.radius, segments: json.segments, material: material, startAngle: json.startAngle, endAngle: json.endAngle });
	}

	static getEntityName() {
		return 'Circle';
	}
}
registerEntity(Circle);
