import { EPSILON } from '../../../math/constants';
import { TimelineElement } from '../../../timeline/element';
import { TimelineGroup } from '../../../timeline/group';
import { Timeline } from '../../../timeline/timeline';
import { Actor } from './actor';
import { Event } from './event';

export class Choreography {
	#repository;
	actors2 = [];
	#events: Event[] = [];
	#actors: Actor[] = [];
	previousTime = -1;
	currentTime = 0;
	animsSpeed = 1;
	shouldLoop = false;
	sceneLength: number;
	onStop: () => void;
	constructor(repository: string, name?: string) {
		this.#repository = repository;
	}

	getRepository() {
		return this.#repository;
	}

	/**
	 * Add an event
	 * @param {Object ChoreographyEvent} event The event to add
	 */
	addEvent(event) {
		this.#events.push(event);
		event.setChoreography(this);
	}

	/**
	 * Add an actor
	 * @param {Object ChoreographyActor} actor The actor to add
	 */
	addActor(actor) {
		this.#actors.push(actor);
		actor.setChoreography(this);
	}

	/**
	 * toString
	 */
	toString(indent = '') {
		const arr = [];
		for (let i = 0; i < this.#events.length; ++i) {
			arr.push(this.#events[i].toString(indent));
		}
		for (let i = 0; i < this.#actors.length; ++i) {
			arr.push(this.#actors[i].toString(indent));
		}
		return arr.join('\n');
	}

	/**
	 * Step
	 */
	step(delta) {
		if (this.animsSpeed > 0) {
			const currentTime = this.previousTime == -1 ? 0 : this.previousTime + delta * this.animsSpeed;
			if (this.previousTime != -0.5) {
				this.currentTime = currentTime;
			}

			for (let i = 0; i < this.#events.length; ++i) {
				this.#events[i].step(this.previousTime, this.currentTime);
			}
			for (let i = 0; i < this.#actors.length; ++i) {
				this.#actors[i].step(this.previousTime, this.currentTime);
			}
			if (this.shouldLoop) {
				this.shouldLoop = false;
				return true;
			}
			this.previousTime = this.currentTime;
			if (currentTime > this.sceneLength) {
				this.stop();
				return false;
			}
		}
		return true;
	}

	/**
	 * Reset
	 */
	reset() {
		this.previousTime = -1;
		this.currentTime = 0;
	}

	/**
	 * Stop
	 */
	stop() {
		if (this.onStop) {
			this.onStop();
		}
	}

	/**
	 * Step
	 */
	loop(startTime) {
		this.previousTime = startTime - EPSILON;
		this.currentTime = startTime;
		this.shouldLoop = true;
	}

	/**
	 * Step
	 */
	setActors(actors) {
		this.actors2 = actors;
	}

	toTimelineElement(): TimelineElement {
		const timeline = new Timeline();
		const events = timeline.addChild(new TimelineGroup('Events')) as TimelineGroup;
		const actors = timeline.addChild(new TimelineGroup('Actors')) as TimelineGroup;

		for (const event of this.#events) {
			events.addChild(event.toTimelineElement());
		}
		for (const actor of this.#actors) {
			events.addChild(actor.toTimelineElement());
		}
		/*
		for (let i = 0; i < this.#actors.length; ++i) {
			arr.push(this.#actors[i].toString(indent));
		}
			*/



		return timeline;
	}
}
