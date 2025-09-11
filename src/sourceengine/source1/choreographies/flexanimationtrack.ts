import { ChoreographyEvent } from './event';
import { ExpressionSample } from './expressionsample';

export class FlexAnimationTrack {
	event: ChoreographyEvent;
	flags = 0;
	samples: [ExpressionSample[], ExpressionSample[]] = [[], []];
	controllerName: string = '';
	min = 0;
	max = 0;

	constructor(event: ChoreographyEvent) {
		this.event = event;
	}

	setFlexControllerName(controllerName: string) {
		this.controllerName = controllerName;
	}

	setFlags(flags: number) {
		this.flags = flags;
	}

	setMin(min: number) {
		this.min = min;
	}

	setMax(max: number) {
		this.max = max;
	}

	isTrackActive() {
		return (this.flags & (1 << 0)) ? true : false
	}

	isComboType() {
		return (this.flags & (1 << 1)) ? true : false
	}

	addSample(time: number, value: number, type: number) {
		const sample = new ExpressionSample();
		sample.t = time;
		sample.v = value;
		sample.selected = false;

		this.samples[type]?.push(sample);

		return sample;
	}

	toString(indent?: string) {
		indent = indent ?? '';
		const subindent = indent + '\t';
		const arr = [indent + this.controllerName];
		for (let sampleType: 0 | 1 = 0; sampleType < 2; ++sampleType) {
			const samples = this.samples[sampleType]!;
			for (const sample of samples) {
				arr.push(subindent + sample.toString());
			}
		}
		return arr.join('\n');
	}
}
