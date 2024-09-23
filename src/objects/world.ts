import { registerEntity } from '../entities/entities';
import { Entity } from '../entities/entity';
import { Scene } from '../scenes/scene';

export class World extends Entity {
	parentChanged(parent?: Entity) {
		const iterator = this.getParentIterator();

		for (let p of iterator) {
			if (p.is('Scene')) {
				(p as Scene).setWorld(this);
				iterator.return(null);
			}
		}
	}

	static getEntityName() {
		return 'World';
	}

	is(s: string): boolean {
		if (s == 'World') {
			return true;
		} else {
			return super.is(s);
		}
	}
}
registerEntity(Scene);
