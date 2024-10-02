import { registerEntity } from '../entities/entities';
import { Entity } from '../entities/entity';

// It is just a basic entity
export class Group extends Entity {
	constructor(parameters) {
		super(parameters);
	}

	static async constructFromJSON(json) {
		return new Group({name: json.name});
	}

	get entityName() {
		return 'Group';
	}

	static get entityName() {
		return 'Group';
	}
}
registerEntity(Group);
