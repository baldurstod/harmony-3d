import { registerEntity } from '../entities/entities';
import { Entity } from '../entities/entity';

// It is just a basic entity
export class Target extends Entity {
	static async constructFromJSON(json: any) {
		return new Target({ name: json.name });
	}

	static getEntityName() {
		return 'Target';
	}
}
registerEntity(Target);
