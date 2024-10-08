import { Choreography } from './choreography';

export class Actor {
	name: string;
	channels = [];
	choreography: Choreography;
	active = false;

	constructor(name: string) {
		this.name = name;
	}

	addChannel(channel) {
		this.channels.push(channel);
		channel.setActor(this);
	}

	setChoreography(choreography) {
		this.choreography = choreography;
	}

	getCharacter() {
		return this.choreography.actors2[0];//fixme: variable
	}

	setActive(active) {
		this.active = active;
	}

	toString(indent) {
		indent = indent || '';
		const subindent = indent + '\t';
		let arr = [indent + 'Actor ' + this.name];
		for (let i = 0; i < this.channels.length; ++i) {
			arr.push(this.channels[i].toString(subindent));
		}
		return arr.join('\n');
	}

	step(previousTime, currentTime) {
		//TODOv2
		for (let i = 0; i < this.channels.length; ++i) {
			this.channels[i].step(previousTime, currentTime);
		}
	}
}
