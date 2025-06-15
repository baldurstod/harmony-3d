import { Kv3Value } from './kv3value';
import { TESTING } from '../../../buildoptions';

/**
 * Kv3Element
 */
export class Kv3Element {
	setProperty(property, value) {
		this[property] = value;
		if (false && TESTING && (property == 'm_container')) {
			console.log(value);
		}
	}
	exportAsText(linePrefix) {
		const out = [];
		const keys = Object.keys(this);
		const linePrefix2 = linePrefix + '\t';

		out.push(linePrefix);
		out.push('{\r\n');
		for (let i = 0; i < keys.length; i++) {
			const val = this[keys[i]];
			//console.log(keys[i]);
			// use val
			out.push(linePrefix2);
			out.push(keys[i]);
			out.push(' = ');

			// TODO: do this better
			if (val instanceof Kv3Value) {
				out.push((val as Kv3Value).exportAsText());
			} else {
				out.push((val as Kv3Element).exportAsText(linePrefix2));
			}

			out.push('\r\n');
		}
		out.push(linePrefix);
		out.push('}');
		return out.join('');
	}
}

export class SourceKv3String {
	id;
	constructor(id) {
		this.id = id;
	}
}

export class SourceKv3Value {
	value;
	type;
	constructor(type) {
		this.type = type;
	}
}
