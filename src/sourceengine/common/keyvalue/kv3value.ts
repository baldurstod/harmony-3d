/**
 * Kv3Value
 */
export class Kv3Value {
	t;
	v;
	constructor(type, value) {
		this.t = type;
		this.v = value;
	}

	exportAsText = function (linePrefix?: string) {
		linePrefix = linePrefix ?? '';
		switch (this.t) {
			case 6:
				return linePrefix + '"' + this.v + '"';
			case 134:
				return linePrefix + 'resource:"' + this.v + '"';

		}
		return linePrefix + this.v;
	}
}
