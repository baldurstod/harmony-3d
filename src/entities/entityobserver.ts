import { Entity } from './entity';

export const PARENT_CHANGED = 'parentchanged';
export const CHILD_ADDED = 'childadded';
export const CHILD_REMOVED = 'childremoved';
export const ENTITY_DELETED = 'entitydeleted';
export const PROPERTY_CHANGED = 'propertychanged';
export const ATTRIBUTE_CHANGED = 'attributechanged';

export type ParentChangedEventData = { child: Entity, oldParent: Entity | null, newParent: Entity | null };
export type ChildAddedEventData = { child: Entity, parent: Entity | null };
export type ChildRemovedEventData = ChildAddedEventData;
export type EntityDeletedEventData = { entity: Entity };
export type PropertyChangedEventData = { entity: Entity, name: string, value: any, oldValue: any };
export type AttributeChangedEventData = PropertyChangedEventData;

export type EntityObserverEventsData = ParentChangedEventData | ChildAddedEventData | ChildRemovedEventData |
	EntityDeletedEventData | PropertyChangedEventData | AttributeChangedEventData;


class EntityObserverClass {
	#eventTarget = new EventTarget();

	parentChanged(child: Entity, oldParent: Entity | null, newParent: Entity | null) {
		this.#eventTarget.dispatchEvent(new CustomEvent(PARENT_CHANGED, { detail: { child: child, oldParent: oldParent, newParent: newParent } }));
	}

	childAdded(parent: Entity, child: Entity) {
		this.#eventTarget.dispatchEvent(new CustomEvent(CHILD_ADDED, { detail: { child: child, parent: parent } }));
	}

	childRemoved(parent: Entity, child: Entity) {
		this.#eventTarget.dispatchEvent(new CustomEvent(CHILD_REMOVED, { detail: { child: child, parent: parent } }));
	}

	entityDeleted(entity: Entity) {
		this.#eventTarget.dispatchEvent(new CustomEvent(ENTITY_DELETED, { detail: { entity: entity } }));
	}

	propertyChanged(entity: Entity, propertyName: string, oldValue: any, newValue: any) {
		this.#eventTarget.dispatchEvent(new CustomEvent(PROPERTY_CHANGED, { detail: { entity: entity, name: propertyName, value: newValue, oldValue: oldValue } }));
	}

	attributeChanged(entity: Entity, attributeName: string, oldValue: any, newValue: any) {
		this.#eventTarget.dispatchEvent(new CustomEvent(ATTRIBUTE_CHANGED, { detail: { entity: entity, name: attributeName, value: newValue, oldValue: oldValue } }));
	}

	addEventListener(type: string, callback: (evt: CustomEvent<EntityObserverEventsData>) => void, options?: AddEventListenerOptions | boolean): void {
		this.#eventTarget.addEventListener(type, callback as EventListener, options);
	}
}

export const EntityObserver = new EntityObserverClass();
