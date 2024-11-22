import { TimelineElement } from './element';
import { TimelineGroup } from './group';

export class Timeline extends TimelineElement {
	name = '';
	#root: TimelineGroup = new TimelineGroup('root');


	setParent(element: TimelineElement): void {
		return;
	}
}
