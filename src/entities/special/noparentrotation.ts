import { quat } from 'gl-matrix';
import { Entity } from '../../entities/entity';
import { registerEntity } from '../entities';

/**
 * This entity does not inherit parent rotation
 * It's world orientation is always it's local orientation
 */
export class NoParentRotation extends Entity {

	getWorldOrientation(q = quat.create()): quat {
		return quat.copy(q, this._quaternion);
	}

	static override getEntityName(): string {
		return 'No parent rotation';
	}
}
registerEntity(NoParentRotation);
