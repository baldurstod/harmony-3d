import { Entity } from '../entities/entity';
import { SkeletonHelper } from '../objects/export';
import { Manipulator } from '../objects/helpers/manipulator';
import { registerEntity } from './entities';

export class KeepOnlyLastChild extends Entity {
	addChild(child: Entity) {
		if (!(child instanceof Manipulator) && !(child instanceof SkeletonHelper)) {
			this.removeChildren();
		}
		return super.addChild(child);
	}

	static override getEntityName(): string {
		return 'Keep only last child';
	}
}
registerEntity(KeepOnlyLastChild);
