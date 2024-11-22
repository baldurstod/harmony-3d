import { TimelineElement } from './element';
import { TimelinePropertyType } from './property';

export class TimelineMarker extends TimelineElement {
	constructor(name: string) {
		super(name);
		this.addProperty('time', TimelinePropertyType.Float, name);
	}

	setTime(time: number) {
		this.setPropertyValue('time', time);
	}

	getTime(): number {
		return this.getPropertyValue('time');
	}
}
