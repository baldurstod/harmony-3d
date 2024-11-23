import { TimelineElement, TimelineElementType } from './element';
import { TimelineGroup } from './group';

export class Timeline extends TimelineElement {
	type: TimelineElementType.Timeline = TimelineElementType.Timeline;
	name = '';
	#root: TimelineGroup = new TimelineGroup('');

	constructor(name: string = 'Timeline') {
		super(name);

	}

	setParent(element: TimelineElement): void {
		return;
	}

	getRoot(): TimelineGroup {
		return this.#root;
	}

	addChild(child: TimelineElement) {
		return this.#root.addChild(child);
	}

	getChilds() {
		return this.#root.getChilds();
	}
}
