import { RemapValClamped } from '../../../math/functions';

export class CurveData {
	ramp = [];

	/**
	 * Add a sample TODO
	 * @param {Object ChoreographyEvent} event The event to add
	 * @return {Object Choreography} The requested choreography or null
	 */
	add(time, value, selected) {
			this.ramp.push({time:time, value:value, selected:selected});
	}

	getValue(time) {
		let previous = null;
		let current;
		for (let current of this.ramp) {
			if (time <= current.time) {
				if (previous) {
					return RemapValClamped(time, previous.time, current.time, previous.value, current.value);
				} else {
					return current.value;
				}
			}
			previous = current;
		}
	}

	/**
	 * toString
	 */
	toString(indent) {
		if (!this.ramp.length) {
			return '';
		}
		indent = indent || '';
		const subindent = indent + '\t';
		let arr = [indent + 'event_ramp'];
		for (let i = 0; i < this.ramp.length; ++i) {
			let rampData = this.ramp[i];
			arr.push(subindent + rampData.time + ' ' + rampData.value);
		}
		return arr.join('\n');
	}

}
