import { TimelineElement } from '../../../timeline/element';
import { TimelineGroup } from '../../../timeline/group';
import { Actor } from './actor';
import { Event } from './event';

export class Channel {
	active = false;
	events: Array<Event> = [];
	name: string;
	actor: Actor;
	constructor(name: string) {
		this.name = name;
	}

	/**
	 * Add an event
	 * @param {Object ChoreographyEvent} event The event to add
	 */
	addEvent(event: Event) {
		this.events.push(event);
		event.setChannel(this);
	}

	/**
	 * TODO
	 */
	setActor(actor: Actor) {
		this.actor = actor;
	}

	/**
	 * TODO
	 */
	getActor() {
		return this.actor;
	}

	/**
	 * Set active
	 * @param {Bool} active active
	 */
	setActive(active: boolean) {
		this.active = active;
	}

	/**
	 * toString
	 */
	toString(indent) {
		indent = indent || '';
		const subindent = indent + '\t';
		let arr = [indent + 'Channel ' + this.name];
		for (let i = 0; i < this.events.length; ++i) {
			arr.push(this.events[i].toString(subindent));
		}
		if (!this.active) {
			arr.push(indent + 'active 0')
		}
		return arr.join('\n');
	}

	/**
	 * Step
	 */
	step(previousTime, currentTime) {
		//TODOv2
		for (let i = 0; i < this.events.length; ++i) {
			this.events[i].step(previousTime, currentTime);
		}
	}

	toTimelineElement(): TimelineElement {
		const group = new TimelineGroup(this.name);

		for (const event of this.events) {
			group.addchild(event.toTimelineElement());
		}

		return group;
	}
}
