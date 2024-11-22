import { TimelineElement } from './element';

export class TimelineGroup extends TimelineElement {
	isGroup: true = true;
	#childs: Array<TimelineElement> = [];

	addchild(child: TimelineElement) {
		this.#childs.push(child);
	}
}
