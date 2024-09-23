import { Entity } from './entity';

const entities = new Map<string, typeof Entity>();

export function registerEntity(ent: typeof Entity) {
	entities.set(ent.getEntityName().toLowerCase(), ent);
}

export function getEntity(name: string) {
	return entities.get(name.toLowerCase());
}
