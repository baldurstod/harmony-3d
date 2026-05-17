import { registerEntity } from '../entities/entities';
import { Bone } from './bone';

export class Attachment extends Bone {
	isAttachment = true as const;

	static getEntityName(): string {
		return 'Attachment';
	}
}
registerEntity(Attachment);
