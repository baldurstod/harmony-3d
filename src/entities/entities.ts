import { ConcreteMaterial } from '../materials/material';
import { Entity } from './entity';

const entities = new Map<string, typeof Entity | ConcreteMaterial>();

export function registerEntity(ent: typeof Entity | ConcreteMaterial) {
	if (entities.has(ent.getEntityName().toLowerCase())) {
		console.error(`${ent.getEntityName().toLowerCase()} is already registered`);
	}
	entities.set(ent.getEntityName().toLowerCase(), ent);
}

export function getEntity(name: string) {
	return entities.get(name.toLowerCase());
}
