import { TimelineElement } from '../../../timeline/element';
import { TimelineGroup } from '../../../timeline/group';
import { Channel } from './channel';
import { Choreography } from './choreography';

export class Actor {
	name: string;
	channels: Array<Channel> = [];
	choreography: Choreography;
	active = false;

	constructor(name: string) {
		this.name = name;
	}

	addChannel(channel: Channel) {
		this.channels.push(channel);
		channel.setActor(this);
	}

	setChoreography(choreography: Choreography) {
		this.choreography = choreography;
	}

	getCharacter() {
		return this.choreography.actors2[0];//fixme: variable
	}

	setActive(active: boolean) {
		this.active = active;
	}

	toString(indent: string) {
		indent = indent || '';
		const subindent = indent + '\t';
		let arr = [indent + 'Actor ' + this.name];
		for (let i = 0; i < this.channels.length; ++i) {
			arr.push(this.channels[i].toString(subindent));
		}
		return arr.join('\n');
	}

	step(previousTime: number, currentTime: number) {
		//TODOv2
		for (let i = 0; i < this.channels.length; ++i) {
			this.channels[i].step(previousTime, currentTime);
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
