

/*
export interface TimelineElement {
	name: string;
	setParent(element: TimelineElement): void;
	getParent(element: TimelineElement): TimelineElement | null;
}
*/

import { TimelineObserver } from './observer';
import { TimelineProperty, TimelinePropertyType } from './property';

export enum TimelineElementType {
	None = 0,
	Timeline,
	Group,
	Channel,
	Clip,
	Marker,
}

export class TimelineElement {
	#parent?: TimelineElement;
	#properties = new Map<string, TimelineProperty>();
	type: TimelineElementType = TimelineElementType.None;
	/*#name: string;
	startTime: number = 0;
	endTime: number = Infinity;*/
	constructor(name: string) {
		this.addProperty('name', TimelinePropertyType.String, name);
	}

	setName(name: string) {
		this.setPropertyValue('name', name);
	}

	getName(): string {
		return this.getPropertyValue('name');
	}

	addProperty(name: string, type: TimelinePropertyType, value: any): TimelineProperty {
		const property = new TimelineProperty(name, type, value);

		this.#properties.set(name, property);

		return property;
	}

	setPropertyValue(name: string, value: any) {
		const property = this.#properties.get(name);
		if (property) {
			const oldValue = property.getValue();
			property.setValue(value);

			TimelineObserver.propertyChanged(this, name, oldValue, value);
		}

	}

	getPropertyValue(name: string): any {
		return this.#properties.get(name)?.getValue();
	}

	/*
		setName(name: string) {
			this.#name = name;
		}

		getName(): string {
			return this.#name;
		}

		setStartTime(name: string) {
			this.#name = name;
		}

		getName(): string {
			return this.#name;
		}

		setParent(parent: TimelineElement): void {
			this.#parent = parent;
		}

		getParent(): TimelineElement | undefined {
			return this.#parent;
		}
	*/
}
