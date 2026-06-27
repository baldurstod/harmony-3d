import { JSONObject } from 'harmony-types';
import { registerEntity } from '../entities/entities';
import { Entity } from '../entities/entity';
import { JSONLoader } from '../importers/jsonloader';
import { Material } from '../materials/material';
import { TWO_PI } from '../math/constants';
import { LineSegments } from './linesegments';

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

	#update(): void {
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

	toJSON(): JSONObject {
		const json = super.toJSON();
		json.radius = this.#radius;
		json.segments = this.#segments;
		json.startAngle = this.#startAngle;
		json.endAngle = this.#endAngle;
		json.material = this.getMaterial().toJSON();
		return json;
	}

	static override async constructFromJSON(json: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>): Promise<Circle | null> {
		const material = await JSONLoader.loadEntity(json.material as JSONObject, entities, loadedPromise);
		return new Circle({ radius: json.radius, segments: json.segments, material: material, startAngle: json.startAngle, endAngle: json.endAngle });
	}

	static override getEntityName(): string {
		return 'Circle';
	}
}
registerEntity(Circle);
