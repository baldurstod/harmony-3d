import { JSONObject, JSONValue } from 'harmony-types';
import { getEntity, registerEntity } from '../entities/entities';
import { Entity } from '../entities/entity';
import { ConcreteMaterial, Material } from '../materials/material';

export class JSONLoader {
	static async fromJSON(rootEntity: JSONObject): Promise<Entity | Material | null> {
		let loadedResolve: (value: void) => void;
		const loadedPromise = new Promise<void>(resolve => {
			loadedResolve = resolve;
		});
		const entities = new Map<string, Entity | Material>();
		const root = await this.loadEntity(rootEntity, entities, loadedPromise);
		loadedResolve!();
		return root;
	}

	static async loadEntity(jsonEntity: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>): Promise<Entity | Material | null> {
		if (jsonEntity) {
			const c = jsonEntity['constructor'];
			if (typeof c !== 'string') {
				return null;
			}
			const constructor = getEntity(c);
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

	static registerEntity(ent: typeof Entity | ConcreteMaterial): void {
		registerEntity(ent);
	}
}
