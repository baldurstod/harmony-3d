import { TimelineElement } from '../../../timeline/element';
import { TimelineGroup } from '../../../timeline/group';
import { Source1ModelInstance } from '../export';
import { Channel } from './channel';
import { Choreography } from './choreography';

export class Actor {
	name: string;
	channels: Channel[] = [];
	#choreography: Choreography;
	active = false;

	constructor(choreography: Choreography, name: string) {
		this.#choreography = choreography;
		this.name = name;
	}

	addChannel(channel: Channel): void {
		this.channels.push(channel);
		channel.setActor(this);
	}

	getCharacter(): Source1ModelInstance | undefined {
		return this.#choreography.actors2[0];//fixme: variable
	}

	setActive(active: boolean): void {
		this.active = active;
	}

	toString(indent: string): string {
		indent = indent || '';
		const subindent = indent + '\t';
		const arr = [indent + 'Actor ' + this.name];
		for (const channel of this.channels) {
			arr.push(channel.toString(subindent));
		}
		return arr.join('\n');
	}

	step(previousTime: number, currentTime: number): void {
		//TODOv2
		for (const channel of this.channels) {
			channel.step(previousTime, currentTime);
		}
	}

	toTimelineElement(): TimelineElement {
		const actor = new TimelineGroup(this.name);

		for (const channel of this.channels) {
			actor.addChild(channel.toTimelineElement());
		}

		return actor;
	}
}
