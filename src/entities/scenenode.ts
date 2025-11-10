import { registerEntity } from './entities';
import { Entity, EntityParameters } from './entity';

export type SceneNodeParameters = EntityParameters & {
	entity?: Entity,
};

export class SceneNode extends Entity {
	entity: Entity | null;
	isSceneNode: true = true;

	constructor(params?: SceneNodeParameters) {
		super(params);
		this.entity = params?.entity ?? null;
	}

	static getEntityName() {
		return 'Scene node';
	}
}
registerEntity(SceneNode);
