import { JSONObject, JSONValue } from 'harmony-types';
import { getEntity, registerEntity } from '../entities/entities';
import { Entity } from '../entities/entity';
import { Material } from '../materials/material';

export class JSONLoader {
	static async fromJSON(rootEntity: JSONObject) {
		let loadedResolve: Function = () => { };// Note: typescript falsely complains about loadedResolve not being assigned without this.
		const loadedPromise = new Promise<void>(resolve => {
			loadedResolve = resolve;
		});
		const entities = new Map<string, Entity | Material>();
		const root = await this.loadEntity(rootEntity, entities, loadedPromise);
		loadedResolve(true);
		return root;
	}

	static async loadEntity(jsonEntity: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>): Promise<Entity | Material | null> {
		if (jsonEntity) {
			const constructor = getEntity(jsonEntity['constructor'] as string);
			if (constructor) {
				const entity = await constructor.constructFromJSON(jsonEntity, entities, loadedPromise);
				if (!entity) {
					return null;
				}
				entity.fromJSON(jsonEntity);
				entities.set(entity.id, entity);

				if (jsonEntity.children) {
					for (const child of jsonEntity.children as JSONValue[]) {
						const childEntity = await this.loadEntity(child as JSONObject, entities, loadedPromise);
						if (childEntity && (entity as Entity)['addChild']) {
							(entity as Entity)['addChild'](childEntity as Entity);
						}
					}
				}
				return entity;
			} else {
				console.error('Unknown constructor', jsonEntity.constructor);
			}
		}
		return null;
	}

	static registerEntity(ent: typeof Entity | typeof Material) {
		registerEntity(ent);
	}
}
