import { Kv3Element } from './kv3element';
import { Kv3Value } from './kv3value';

/**
 * Kv3Array
 */
export class Kv3Array {
	values: (Kv3Element | Kv3Value)[] = [];

	push(value: Kv3Element | Kv3Value): void {
		this.values.push(value);
	}

	getValue(index: string/*yes it's a string*/): Kv3Element | Kv3Value | undefined {
		return this.values[Number(index)];
	}

	exportAsText(linePrefix: string): string {
		const out = [];
		const linePrefix2 = linePrefix + '\t';

		out.push('\r\n');
		out.push(linePrefix);
		out.push('[\r\n');
		for (const val of this.values) {
			out.push(val.exportAsText(linePrefix2));
			out.push(',\r\n');
		}
		out.push(linePrefix);
		out.push(']');
		return out.join('');
	}
}
