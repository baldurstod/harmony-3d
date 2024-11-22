import { TimelineElement, TimelineElementType } from './element';

export class TimelineClip extends TimelineElement {
	type: TimelineElementType.Clip = TimelineElementType.Clip;

	constructor(name: string = 'Clip') {
		super(name);

	}
}
