import { Entity } from './entity';

export const PARENT_CHANGED = 'parentchanged';
export const CHILD_ADDED = 'childadded';
export const CHILD_REMOVED = 'childremoved';
export const ENTITY_DELETED = 'entitydeleted';
export const PROPERTY_CHANGED = 'propertychanged';

class EntityObserverClass extends EventTarget {
	parentChanged(child: Entity, oldParent: Entity, newParent: Entity) {
		this.dispatchEvent(new CustomEvent(PARENT_CHANGED, { detail: { child: child, oldParent: oldParent, newParent: newParent } }));
	}

	childAdded(parent: Entity, child: Entity) {
		this.dispatchEvent(new CustomEvent(CHILD_ADDED, { detail: { child: child, parent: parent } }));
	}

	childRemoved(parent: Entity, child: Entity) {
		this.dispatchEvent(new CustomEvent(CHILD_REMOVED, { detail: { child: child, parent: parent } }));
	}

	entityDeleted(entity: Entity) {
		this.dispatchEvent(new CustomEvent(ENTITY_DELETED, { detail: { entity: entity } }));
	}

	propertyChanged(entity: Entity, propertyName: string, propertyValue: any) {
		this.dispatchEvent(new CustomEvent(PROPERTY_CHANGED, { detail: { entity: entity, name: propertyName, value: propertyValue } }));
	}
}

export const EntityObserver = new EntityObserverClass();
