import { JSONObject } from 'harmony-types';
import { registerEntity } from '../entities/entities';
import { Entity } from '../entities/entity';

// It is just a basic entity
export class Group extends Entity {

	// eslint-disable-next-line @typescript-eslint/require-await
	static override async constructFromJSON(json: JSONObject): Promise<Group> {
		return new Group({ name: json.name as string });
	}

	static override getEntityName(): string {
		return 'Group';
	}
}
registerEntity(Group);
