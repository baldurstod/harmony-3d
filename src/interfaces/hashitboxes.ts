import { Hitbox } from '../misc/hitbox';

export interface HasHitBoxes {
	hasHitBoxes: true;

	getHitboxes(): Hitbox[];
}
