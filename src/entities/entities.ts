import { Material } from '../materials/material';
import { Entity } from './entity';

const entities = new Map<string, typeof Entity | typeof Material>();

export function registerEntity(ent: typeof Entity | typeof Material) {
	if (entities.has(ent.getEntityName().toLowerCase())) {
		console.error(`${ent} is already registered`);
	}
	entities.set(ent.getEntityName().toLowerCase(), ent);
}

export function getEntity(name: string) {
	return entities.get(name.toLowerCase());
}
