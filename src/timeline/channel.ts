import { TimelineClip } from './clip';
import { TimelineElement, TimelineElementType } from './element';

export class TimelineChannel extends TimelineElement {
	type: TimelineElementType.Channel = TimelineElementType.Channel;
	#clips = new Set<TimelineClip>;

	constructor(name = 'Channel') {
		super(name);
	}

	addClip(clip: TimelineClip) {
		this.#clips.add(clip);
		return clip;
	}

	getClips() {
		return [...this.#clips];
	}
}
