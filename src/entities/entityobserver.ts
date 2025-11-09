import { MyEventTarget } from 'harmony-utils';
import { Entity } from './entity';

//export const PARENT_CHANGED = 'parentchanged';
//export const CHILD_ADDED = 'childadded';
//export const CHILD_REMOVED = 'childremoved';
//export const ENTITY_DELETED = 'entitydeleted';
//export const PROPERTY_CHANGED = 'propertychanged';
//export const ATTRIBUTE_CHANGED = 'attributechanged';

export interface ParentChangedEventData { child: Entity, oldParent: Entity | null, newParent: Entity | null }
export interface ChildAddedEventData { child: Entity, parent: Entity | null }
export type ChildRemovedEventData = ChildAddedEventData;
export interface EntityDeletedEventData { entity: Entity }

export enum EntityObserverEventType {
	ParentChanged = 'parentchanged',
	ChildAdded = 'childadded',
	ChildRemoved = 'childremoved',
	EntityDeleted = 'entitydeleted',
	PropertyChanged = 'propertychanged',
	AttributeChanged = 'attributechanged',
}

export type EntityObserverParentChangedEvent = {
	child: Entity;
	oldParent: Entity | null;
	newParent: Entity | null;
}

export type EntityObserverChildAddedEvent = {
	child: Entity;
	parent: Entity;
}

export type EntityObserverChildRemovedEvent = {
	child: Entity;
	parent: Entity;
}

export type EntityObserverEntityDeletedEvent = {
	entity: Entity;
}

export type EntityObserverPropertyChangedEvent = {
	entity: Entity;
	propertyName: string;
	newPropertyValue: EntityPropertyValue;
	oldPropertyValue: EntityPropertyValue;
}

export type EntityObserverAttributeChangedEvent = {
	entity: Entity;
	attributeName: string;
	newAttributeValue: EntityAttributeValue;
	oldAttributeValue: EntityAttributeValue;
}


export type EntityObserverEvent = EntityObserverParentChangedEvent
	| EntityObserverChildAddedEvent
	| EntityObserverChildRemovedEvent
	| EntityObserverEntityDeletedEvent
	| EntityObserverPropertyChangedEvent
	| EntityObserverAttributeChangedEvent;

type EntityPropertyValue = any;
type EntityAttributeValue = any;

class EntityObserverClass extends MyEventTarget<EntityObserverEventType, CustomEvent<EntityObserverEvent>> {

	parentChanged(child: Entity, oldParent: Entity | null, newParent: Entity | null) {
		this.dispatchEvent(new CustomEvent<EntityObserverParentChangedEvent>(EntityObserverEventType.ParentChanged, { detail: { child: child, oldParent: oldParent, newParent: newParent } }));
	}

	childAdded(parent: Entity, child: Entity) {
		this.dispatchEvent(new CustomEvent<EntityObserverChildAddedEvent>(EntityObserverEventType.ChildAdded, { detail: { child: child, parent: parent } }));
	}

	childRemoved(parent: Entity, child: Entity) {
		this.dispatchEvent(new CustomEvent<EntityObserverChildRemovedEvent>(EntityObserverEventType.ChildRemoved, { detail: { child: child, parent: parent } }));
	}

	entityDeleted(entity: Entity) {
		this.dispatchEvent(new CustomEvent<EntityObserverEntityDeletedEvent>(EntityObserverEventType.EntityDeleted, { detail: { entity: entity } }));
	}

	propertyChanged(entity: Entity, propertyName: string, oldValue: any, newValue: any) {
		this.dispatchEvent(new CustomEvent<EntityObserverPropertyChangedEvent>(EntityObserverEventType.PropertyChanged, { detail: { entity: entity, propertyName: propertyName, newPropertyValue: newValue, oldPropertyValue: oldValue } }));
	}

	attributeChanged(entity: Entity, attributeName: string, oldValue: any, newValue: any) {
		this.dispatchEvent(new CustomEvent<EntityObserverAttributeChangedEvent>(EntityObserverEventType.AttributeChanged, { detail: { entity: entity, attributeName: attributeName, newAttributeValue: newValue, oldAttributeValue: oldValue } }));
	}
}

export const EntityObserver = new EntityObserverClass();
