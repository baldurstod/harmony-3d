import { registerEntity } from '../entities/entities';
import { Entity } from '../entities/entity';
import { JSONObject } from '../types';

// It is just a basic entity
export class Group extends Entity {
	static async constructFromJSON(json: JSONObject) {
		return new Group({ name: json.name as string });
	}

	static getEntityName() {
		return 'Group';
	}
}
registerEntity(Group);
