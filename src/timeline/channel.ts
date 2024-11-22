import { TimelineElement, TimelineElementType } from './element';

export class TimelineChannel extends TimelineElement {
	type: TimelineElementType.Channel = TimelineElementType.Channel;

	constructor(name: string = 'Channel') {
		super(name);

	}
}
