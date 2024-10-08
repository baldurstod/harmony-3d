import { Event } from './event';
import { ExpressionSample } from './expressionsample';

export class FlexAnimationTrack {
	event: Event;
	flags = 0;
	samples = [[], []];
	controllerName: string;
	min = 0;
	max = 0;
	constructor(event: Event) {
		this.event = event;
	}

	setFlexControllerName(controllerName: string) {
		this.controllerName = controllerName;
	}

	setFlags(flags) {
		this.flags = flags;
	}

	setMin(min) {
		this.min = min;
	}

	setMax(max) {
		this.max = max;
	}

	isTrackActive() {
		return (this.flags & (1 << 0)) ? true : false
	}

	isComboType() {
		return (this.flags & (1 << 1)) ? true : false
	}

	addSample(time, value, type) {
		const sample = new ExpressionSample();
		sample.t = time;
		sample.v = value;
		sample.selected = false;

		this.samples[type].push(sample);

		return sample;
	}

	toString(indent) {
		indent = indent || '';
		const subindent = indent + '\t';
		let arr = [indent + this.controllerName];
		for (let sampleType = 0; sampleType < 2; ++sampleType) {
			const samples = this.samples[sampleType];
			for (let i = 0; i < samples.length; ++i) {
				let sample = samples[i];
				arr.push(subindent + sample.toString());
			}
		}
		return arr.join('\n');
	}
}
