import { registerEntity } from '../entities/entities';
import { Entity } from '../entities/entity';

// It is just a basic entity
export class Group extends Entity {
	static async constructFromJSON(json) {
		return new Group({ name: json.name });
	}

	static getEntityName() {
		return 'Group';
	}
}
registerEntity(Group);
