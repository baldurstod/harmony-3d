import { Entity } from '../entities/entity';
import { Manipulator } from '../objects/helpers/manipulator';
import { registerEntity } from './entities';

export class KeepOnlyLastChild extends Entity {
	addChild(child: Entity) {
		if (!(child instanceof Manipulator)) {
			this.removeChildren();
		}
		return super.addChild(child);
	}

	static getEntityName(): string {
		return 'Keep only last child';
	}
}
registerEntity(KeepOnlyLastChild);
