import { registerEntity } from '../entities/entities';
import { Entity } from '../entities/entity';
import { JSONObject } from 'harmony-types';

// It is just a basic entity
export class Group extends Entity {
	static async constructFromJSON(json: JSONObject) {
		return new Group({ name: json.name as string });
	}

	static override getEntityName(): string {
		return 'Group';
	}
}
registerEntity(Group);
