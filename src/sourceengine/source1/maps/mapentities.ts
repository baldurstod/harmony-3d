import { SourceBSP } from '../export';
import { MapEntity } from './mapentity';

/**
 * Map entities
 */
export class MapEntities {
	static #entities = new Map<string, typeof MapEntity>();

	static registerEntity(className: string, entityClass: typeof MapEntity): void {
		this.#entities.set(className, entityClass);
	}

	static createEntity(map: SourceBSP, className: string): MapEntity | null {
		const entityClass = this.#entities.get(className);
		if (!entityClass) {
			return null;
		}
		const entity = new entityClass({ className: className, map: map });
		return entity;
	}
}
