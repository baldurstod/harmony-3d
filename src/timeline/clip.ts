import { TimelineElement, TimelineElementType } from './element';
import { TimelinePropertyType } from './property';

export class TimelineClip extends TimelineElement {
	type: TimelineElementType.Clip = TimelineElementType.Clip;

	constructor(name = 'Clip', startTime = 0, endTime = Infinity) {
		super(name);

		this.addProperty('start', TimelinePropertyType.Time, startTime);
		this.addProperty('end', TimelinePropertyType.Time, endTime);
	}

	setStartTime(start: number) {
		this.setPropertyValue('start', start);
	}

	getStartTime(): number {
		return this.getPropertyValue('start');
	}

	setEndTime(end: number) {
		this.setPropertyValue('end', end);
	}

	getEndTime(): number {
		return this.getPropertyValue('end');
	}

	getLength(): number {
		return this.getPropertyValue('end') - this.getPropertyValue('start');
	}
}
