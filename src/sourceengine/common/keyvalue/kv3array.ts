/**
 * Kv3Array
 */
export class Kv3Array {
	properties = [];
	push(value) {
		this.properties.push(value);
	}
	exportAsText(linePrefix) {
		const out = [];
		const keys = this.properties;
		const linePrefix2 = linePrefix + '\t';

		out.push('\r\n');
		out.push(linePrefix);
		out.push('[\r\n');
		for (let i = 0; i < keys.length; i++) {
			const val = keys[i];
			out.push(val.exportAsText(linePrefix2));
			out.push(',\r\n');
		}
		out.push(linePrefix);
		out.push(']');
		return out.join('');
	}
}
