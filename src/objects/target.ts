import { registerEntity } from '../entities/entities';
import { Entity } from '../entities/entity';

// It is just a basic entity
export class Target extends Entity {
	constructor(params: any) {
		super(params);
	}

	static async constructFromJSON(json: any) {
		return new Target({ name: json.name });
	}

	get entityName() {
		return 'Target';
	}

	static get entityName() {
		return 'Target';
	}
}
registerEntity(Target);
