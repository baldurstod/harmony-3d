import { vec4 } from 'gl-matrix';
import { Kv3Type, Kv3Value, Kv3ValueType } from './kv3value';

/**
 * Kv3Element
 */
export class Kv3Element {
	isKv3Element: true = true;
	#properties = new Map<string, Kv3Element | Kv3Value | null>();

	setProperty(property: string, value: Kv3Element | Kv3Value | null) {
		this.#properties.set(property, value);
	}

	getProperty(name: string): Kv3Element | Kv3Value | null | undefined {
		return this.#properties.get(name);
	}

	getProperties(): Map<string, Kv3Element | Kv3Value | null> {
		return this.#properties;
	}

	getValue(name: string): Kv3ValueType {
		const prop = this.#properties.get(name);
		if ((prop as Kv3Element)?.isKv3Element) {
			return (prop as Kv3Element);
		}
		if ((prop as Kv3Value)?.isKv3Value) {
			return (prop as Kv3Value).getValue();
		}
		return null;
	}

	getValueAsString(name: string): string | null {
		const prop = this.#properties.get(name);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).getType() == Kv3Type.String) {
			return (prop as Kv3Value).getValue() as string;
		}
		return null;
	}

	getValueAsStringArray(name: string): string[] | null {
		const prop = this.#properties.get(name);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).getSubType() == Kv3Type.String) {
			return (prop as Kv3Value).getValue() as string[];
		}
		return null;
	}

	getValueAsResource(name: string): string | null {
		const prop = this.#properties.get(name);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).getType() == Kv3Type.String) {// TODO: also check flag
			return (prop as Kv3Value).getValue() as string;
		}
		return null;
	}

	getValueAsResourceArray(name: string): string[] | null {
		const prop = this.#properties.get(name);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).getSubType() == Kv3Type.String) {// TODO: also check flag
			return (prop as Kv3Value).getValue() as string[];
		}
		return null;
	}

	getValueAsBool(name: string): boolean | null {
		const prop = this.#properties.get(name);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).isBoolean()) {
			return (prop as Kv3Value).getValue() as boolean;
		}
		return null;
	}

	getValueAsNumber(name: string): number | null {
		const prop = this.#properties.get(name);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).isNumber()) {
			return (prop as Kv3Value).getValue() as number;
		}
		return null;
	}

	getValueAsNumberArray(name: string): number[] | null {
		const prop = this.#properties.get(name);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).isNumberArray()) {
			return (prop as Kv3Value).getValue() as number[];
		}
		return null;
	}

	getValueAsVec4(name: string, out: vec4): vec4 | null {
		const prop = this.#properties.get(name);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).isNumberArray()) {
			const v = (prop as Kv3Value).getValue() as number[];
			if (v.length == 4) {
				vec4.copy(out, v as vec4);
				return out;
			}
		}
		return null;
	}

	getValueAsBigint(name: string): bigint | null {
		const prop = this.#properties.get(name);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).isBigint()) {
			return (prop as Kv3Value).getValue() as bigint;
		}
		return null;
	}

	getValueAsBigintArray(name: string): bigint[] | null {
		const prop = this.#properties.get(name);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).isBigintArray()) {
			return (prop as Kv3Value).getValue() as bigint[];
		}
		return null;
	}

	getValueAsBlob(name: string): Uint8Array | null {
		const prop = this.#properties.get(name);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).getType() == Kv3Type.Blob) {
			return (prop as Kv3Value).getValue() as Uint8Array;
		}
		return null;
	}

	getValueAsElement(name: string): Kv3Element | null {
		const prop = this.#properties.get(name);
		if ((prop as Kv3Element)?.isKv3Element) {
			return (prop as Kv3Element);
		}
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).getType() == Kv3Type.Element) {
			return (prop as Kv3Value).getValue() as Kv3Element;
		}
		return null;
	}

	getValueAsElementArray(name: string): Kv3Element[] | null {
		const prop = this.#properties.get(name);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).getSubType() == Kv3Type.Element) {
			return (prop as Kv3Value).getValue() as Kv3Element[];
		}
		return null;
	}

	getValueAsVectorArray(name: string): number[][] | null {
		const prop = this.#properties.get(name);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).isVector()) {
			return (prop as Kv3Value).getValue() as number[][];
		}
		return null;
	}

	getSubValue(path: string): Kv3Element | Kv3Value | null {
		const arr = path.split('.');
		let data: Kv3Element | Kv3Value | null | undefined = this;

		for (const subPath of arr) {

			if ((data as Kv3Value).isKv3Value) {
				if (!(data as Kv3Value).isArray) {
					return null;
				}

				const value: Kv3ValueType | undefined = ((data as Kv3Value).getValue() as Kv3ValueType[])?.[Number(subPath)];
				if (!value || (!(value as Kv3Element).isKv3Element && !(value as Kv3Value).isKv3Value)) {
					return null;
				}

				data = value as Kv3Element | Kv3Value;
			} else {
				if ((data as Kv3Element).isKv3Element) {
					data = (data as Kv3Element).getProperty(subPath);
					if (!data) {
						return null;
					}
				}
			}
		}
		return data;
	}

	getSubValueAsString(path: string): string | null {
		const prop = this.getSubValue(path);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).getType() == Kv3Type.String) {
			return (prop as Kv3Value).getValue() as string;
		}
		return null;
	}

	getSubValueAsUint8Array(path: string): Uint8Array | null {
		const prop = this.getSubValue(path);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).getType() == Kv3Type.Blob) {
			return (prop as Kv3Value).getValue() as Uint8Array;
		}
		return null;
	}

	getSubValueAsNumber(path: string): number | null {
		const prop = this.getSubValue(path);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).isNumber()) {
			return (prop as Kv3Value).getValue() as number;
		}
		return null;
	}

	getSubValueAsElement(path: string): Kv3Element | null {
		const prop = this.getSubValue(path);
		if ((prop as Kv3Element)?.isKv3Element) {
			return (prop as Kv3Element);
		}
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).getType() == Kv3Type.Element) {
			return (prop as Kv3Value).getValue() as Kv3Element;
		}
		return null;
	}

	getSubValueAsStringArray(path: string): string[] | null {
		const prop = this.getSubValue(path);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).isArray() && (prop as Kv3Value).getSubType() == Kv3Type.String) {
			return (prop as Kv3Value).getValue() as string[];
		}
		return null;
	}

	getSubValueAsNumberArray(path: string): number[] | null {
		const prop = this.getSubValue(path);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).isNumberArray()) {
			return (prop as Kv3Value).getValue() as number[];
		}
		return null;
	}

	getSubValueAsVec4(path: string, out: vec4): vec4 | null {
		const prop = this.getSubValue(path);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).isNumberArray()) {
			const v = (prop as Kv3Value).getValue() as number[];
			if (v.length == 4) {
				vec4.copy(out, v as vec4);
				return out;
			}
		}
		return null;
	}

	getSubValueAsElementArray(path: string): Kv3Element[] | null {
		const prop = this.getSubValue(path);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).isArray() && (prop as Kv3Value).getSubType() == Kv3Type.Element) {
			return (prop as Kv3Value).getValue() as Kv3Element[];
		}
		return null;
	}

	getSubValueAsResource(path: string): string | null {
		const prop = this.getSubValue(path);
		if ((prop as Kv3Value)?.isKv3Value && (prop as Kv3Value).getType() == Kv3Type.String) {// TODO: also check flag
			return (prop as Kv3Value).getValue() as string;
		}
		return null;
	}

	exportAsText(linePrefix: string): string {
		const out = [];
		//const keys = Object.keys(this);
		const linePrefix2 = linePrefix + '\t';

		//out.push(linePrefix);
		out.push(`${linePrefix}{\n`);
		for (const [key, val] of this.#properties) {
			out.push(linePrefix2);
			out.push(sanitizeKey(key));
			out.push(' = ');

			if (val) {
				out.push(val.exportAsText(linePrefix2));
			}

			out.push('\n');
		}
		out.push(linePrefix);
		out.push('}');
		return out.join('');
	}
}

const sanitizeKeyRegex = /[^a-zA-Z0-9_]/;
function sanitizeKey(key: string): string {
	if (sanitizeKeyRegex.test(key)) {
		return '"' + key + '"';
	}
	return key;
}

export class SourceKv3String {
	id: number;

	constructor(id: number) {
		this.id = id;
	}
}

export class Source2Kv3Value {
	type: number/*TODO: create an enum*/;
	value?: boolean | number | bigint;

	constructor(type: number/*TODO: create an enum*/) {
		this.type = type;
	}
}
