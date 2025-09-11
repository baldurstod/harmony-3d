import { RemapValClamped } from '../../../math/functions';

type CurveDataValue = any;/*TODO: improve type*/
type CurveDataSample = { time: number, value: number, selected: boolean }

export class CurveData {
	#ramp: CurveDataSample[] = [];

	/**
	 * Add a sample TODO
	 * @param {Object ChoreographyEvent} event The event to add
	 * @return {Object Choreography} The requested choreography or null
	 */
	add(time: number, value: CurveDataValue, selected: boolean): void {
		this.#ramp.push({ time: time, value: value, selected: selected });
	}

	getValue(time: number): number | null {
		let previous = null;
		for (const current of this.#ramp) {
			if (time <= current.time) {
				if (previous) {
					return RemapValClamped(time, previous.time, current.time, previous.value, current.value);
				} else {
					return current.value;
				}
			}
			previous = current;
		}
		return null;
	}

	/**
	 * toString
	 */
	toString(indent?: string) {
		if (!this.#ramp.length) {
			return '';
		}
		indent = indent ?? '';
		const subindent = indent + '\t';
		const arr = [indent + 'event_ramp'];
		for (let i = 0; i < this.#ramp.length; ++i) {
			const rampData = this.#ramp[i]!;
			arr.push(subindent + rampData.time + ' ' + rampData.value);
		}
		return arr.join('\n');
	}

}
