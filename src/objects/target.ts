import { registerEntity } from '../entities/entities';
import { Entity } from '../entities/entity';

// It is just a basic entity
export class Target extends Entity {
	static override async constructFromJSON(json: any) {
		return new Target({ name: json.name });
	}

	static override getEntityName(): string {
		return 'Target';
	}
}
registerEntity(Target);
