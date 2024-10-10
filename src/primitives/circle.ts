import { JSONLoader } from '../importers/jsonloader.js';
import { LineSegments } from './linesegments.js';
import { TWO_PI } from '../math/constants';
import { registerEntity } from '../entities/entities.js';

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
		let startEnd = [];
		let a = (this.#endAngle - this.#startAngle) / this.#segments;
		for (let i = 0; i < this.#segments + 1; i++) {
			let theta = a * i + this.#startAngle;
			let x = this.#radius * Math.cos(theta);
			let y = this.#radius * Math.sin(theta);
			startEnd.push(x);
			startEnd.push(y);
			startEnd.push(0);
		}

		this.setSegments(startEnd);
	}

	toJSON() {
		let json = super.toJSON();
		json.radius = this.#radius;
		json.segments = this.#segments;
		json.startAngle = this.#startAngle;
		json.endAngle = this.#endAngle;
		json.material = this.material.toJSON();
		return json;
	}

	static async constructFromJSON(json, entities, loadedPromise) {
		let material = await JSONLoader.loadEntity(json.material, entities, loadedPromise);
		return new Circle({ radius: json.radius, segments: json.segments, material: material, startAngle: json.startAngle, endAngle: json.endAngle });
	}

	static getEntityName() {
		return 'Circle';
	}
}
registerEntity(Circle);
