import { TimelineElement, TimelineElementType } from './element';
import { TimelinePropertyType } from './property';

export class TimelineClip extends TimelineElement {
	type: TimelineElementType.Clip = TimelineElementType.Clip;

	constructor(name: string = 'Clip', startTime: number = 0, endTime: number = Infinity) {
		super(name);

		this.addProperty('start', TimelinePropertyType.Time, startTime);
		this.addProperty('end', TimelinePropertyType.Time, endTime);
	}
}
