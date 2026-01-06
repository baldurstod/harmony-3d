import { TimelineElement, TimelineElementType } from './element';

export class TimelineGroup extends TimelineElement {
	type: TimelineElementType.Group = TimelineElementType.Group;
	#childs: TimelineElement[] = [];

	addChild(child: TimelineElement): TimelineElement {
		this.#childs.push(child);
		return child;
	}

	getChilds(): TimelineElement[] {
		return [...this.#childs];
	}
}
