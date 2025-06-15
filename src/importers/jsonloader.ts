import { getEntity, registerEntity } from '../entities/entities';
import { Entity } from '../entities/entity';
import { Material } from '../materials/material';

export class JSONLoader {
	static async fromJSON(rootEntity: object) {
		let loadedResolve: Function = () => { };// Note: typescript falsely complains about loadedResolve not being assigned without this.
		const loadedPromise = new Promise<void>(resolve => {
			loadedResolve = resolve;
		});
		const entities = new Map<string, Entity | Material>();
		const root = await this.loadEntity(rootEntity, entities, loadedPromise);
		loadedResolve(true);
		return root;
	}

	static async loadEntity(jsonEntity, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>) {
		if (jsonEntity) {
			const constructor = getEntity(jsonEntity.constructor);
			if (constructor) {
				const entity = await constructor.constructFromJSON(jsonEntity, entities, loadedPromise);
				entity.fromJSON(jsonEntity);
				entities.set(entity.id, entity);

				if (jsonEntity.children) {
					for (const child of jsonEntity.children) {
						const childEntity = await this.loadEntity(child, entities, loadedPromise);
						if (childEntity && entity['addChild']) {
							entity['addChild'](childEntity);
						}
					}
				}
				return entity;
			} else {
				console.error('Unknown constructor', jsonEntity.constructor);
			}
		}
	}

	static registerEntity(ent: typeof Entity | typeof Material) {
		registerEntity(ent);
	}
}
