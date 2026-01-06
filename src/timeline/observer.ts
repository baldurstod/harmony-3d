import { StaticEventTarget } from 'harmony-utils';
import { TimelineElement } from './element';
import { TimelinePropertyType } from './property';

export const PARENT_CHANGED = 'parentchanged';
export const CHILD_ADDED = 'childadded';
export const CHILD_REMOVED = 'childremoved';
export const ENTITY_DELETED = 'entitydeleted';
export const PROPERTY_ADDED = 'propertyadded';
export const PROPERTY_CHANGED = 'propertychanged';

export class TimelineObserver extends StaticEventTarget {

	/*
		parentChanged(child: Entity, oldParent: Entity | null, newParent: Entity | null) {
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
	*/

	static propertyAdded(element: TimelineElement, propertyName: string, type: TimelinePropertyType, value: any): void {
		this.dispatchEvent(new CustomEvent(PROPERTY_ADDED, { detail: { element: element, name: propertyName, type: type, value: value } }));
	}

	static propertyChanged(element: TimelineElement, propertyName: string, oldValue: any, newValue: any): void {
		this.dispatchEvent(new CustomEvent(PROPERTY_CHANGED, { detail: { element: element, name: propertyName, value: newValue, oldValue: oldValue } }));
	}
}
