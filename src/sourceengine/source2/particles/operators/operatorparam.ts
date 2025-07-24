import { vec2, vec3, vec4 } from 'gl-matrix';
import { Kv3Element } from '../../../common/keyvalue/kv3element';
import { Kv3Type, Kv3Value, Kv3ValueType } from '../../../common/keyvalue/kv3value';

export enum OperatorParamType {
	Null = 0,
	Element,
	Bool,
	Number,
	BigInt,
	String,
	Array,
}

export type OperatorParamValueType = null | boolean | number | bigint | string | OperatorParam | OperatorParamValueType[] | Map<string, OperatorParam> | Uint8Array | Float32Array;

export class OperatorParam {
	isOperatorParam: true = true;
	#value!: OperatorParamValueType;
	#type!: OperatorParamType;

	getType(): OperatorParamType {
		return this.#type;
	}

	getValueAsBool(): boolean | null {
		if (this.#type != OperatorParamType.Bool) {
			return null;
		}
		return this.#value as boolean;
	}

	getValueAsNumber(): number | null {
		if (this.#type == OperatorParamType.Number) {
			return this.#value as number;
		}

		if (this.#type == OperatorParamType.Element) {
			//return this.#value as number;
			const type = (this.#value as Map<string, OperatorParam>).get('m_nType')?.getValueAsString();
			switch (type) {
				case 'PF_TYPE_LITERAL'/*TODO: create a string constant*/:
					return (this.#value as Map<string, OperatorParam>).get('m_flLiteralValue')?.getValueAsNumber() ?? null;
				default:
					console.error('unknown number type, maybe use getParamScalarValue instead', type, this);
			}
		}

		return null;
	}

	getValueAsString(): string | null {
		if (this.#type != OperatorParamType.String) {
			return null;
		}
		return this.#value as string;
	}

	getValueAsArray(): OperatorParamValueType[] | null {
		if (this.#type != OperatorParamType.Array) {
			return null;
		}
		return this.#value as OperatorParamValueType[];
	}

	getValueAsVec2(out: vec2): vec2 | null {
		if (this.#type != OperatorParamType.Array) {
			return null;
		}

		const value = this.#value as number[];//TODO: check the actual type
		for (let i = 0; i < 2; i++) {
			// TODO: check len
			out[i] = (value as number[])[i] ?? 0;
		}
		return out;
	}

	getValueAsVec3(out: vec3): vec3 | null {
		if (this.#type != OperatorParamType.Array) {
			return null;
		}

		const value = this.#value as number[];//TODO: check the actual type
		for (let i = 0; i < 3; i++) {
			// TODO: check len
			out[i] = (value as number[])[i] ?? 0;
		}
		return out;
	}

	getValueAsVec4(out: vec4): vec4 | null {
		if (this.#type != OperatorParamType.Array) {
			return null;
		}

		const value = this.#value as number[];//TODO: check the actual type
		for (let i = 0; i < 4; i++) {
			// TODO: check len
			out[i] = (value as number[])[i] ?? 0;
		}
		return out;
	}

	getSubValue(name: string): OperatorParam | null {
		if (this.#type != OperatorParamType.Element) {
			return null;
		}
		return (this.#value as Map<string, OperatorParam>).get(name) ?? null;
	}

	getSubValueAsBool(name: string): boolean | null {
		return this.getSubValue(name)?.getValueAsBool() ?? null;
	}

	getSubValueAsNumber(name: string): number | null {
		return this.getSubValue(name)?.getValueAsNumber() ?? null;
	}

	getSubValueAsString(name: string): string | null {
		return this.getSubValue(name)?.getValueAsString() ?? null;
	}

	getSubValueAsArray(name: string): OperatorParamValueType[] | null {
		return this.getSubValue(name)?.getValueAsArray() ?? null;
	}

	getSubValueAsVec2(name: string, out: vec2): vec2 | null {
		return this.getSubValue(name)?.getValueAsVec2(out) ?? null;
	}

	getSubValueAsVec3(name: string, out: vec3): vec3 | null {
		return this.getSubValue(name)?.getValueAsVec3(out) ?? null;
	}

	static fromKv3(kv3: Kv3Element | Kv3Value | null): OperatorParam {
		if ((kv3 as Kv3Element).isKv3Element) {
			return this.#fromKv3Element(kv3 as Kv3Element);
		}
		if ((kv3 as Kv3Value).isKv3Value) {
			return this.#fromKv3Value(kv3 as Kv3Value);
		}

		if (kv3 === null) {
			const operatorParam = new OperatorParam();
			operatorParam.#type = OperatorParamType.Null;
		}
		throw 'fix me';
	}

	static #fromKv3Element(element: Kv3Element): OperatorParam {
		const operatorParam = new OperatorParam();

		operatorParam.#type = OperatorParamType.Element;
		operatorParam.#value = new Map<string, OperatorParam>;

		for (const [name, property] of element.getProperties()) {
			operatorParam.#value.set(name, this.fromKv3(property));
		}


		return operatorParam;
	}

	static #fromKv3Value(kv3: Kv3Value): OperatorParam {
		const operatorParam = new OperatorParam();

		if (kv3.isArray()) {
			operatorParam.#type = OperatorParamType.Array;

			const value: OperatorParamValueType[] = [];

			if (kv3.getSubType() == Kv3Type.Element) {
				for (const sub of kv3.getValue() as Kv3ValueType[]) {
					value.push(this.fromKv3(sub as Kv3Element));
				}
			} else {
				// TODO: control subtype
				for (const sub of kv3.getValue() as Kv3ValueType[]) {
					value.push(sub as null | boolean | bigint | number | string | Uint8Array | Float32Array);
				}
			}

			operatorParam.#value = value;

			//export type Kv3ValueType = null | boolean | bigint | number | string | Uint8Array | Float32Array | Kv3ValueType[] | Kv3Element | Kv3Value;
		} else {
			switch (kv3.getType()) {
				case Kv3Type.Resource:
				case Kv3Type.String:
					operatorParam.#type = OperatorParamType.String;
					operatorParam.#value = kv3.getValue() as string;
					break;
				case Kv3Type.Double:
				case Kv3Type.Float:
				case Kv3Type.Int32:
				case Kv3Type.IntZero:
				case Kv3Type.IntOne:
				case Kv3Type.DoubleZero:
				case Kv3Type.DoubleOne:
					operatorParam.#type = OperatorParamType.Number;
					operatorParam.#value = kv3.getValue() as number;
					break;
				case Kv3Type.True:
				case Kv3Type.False:
				case Kv3Type.Bool:
					operatorParam.#type = OperatorParamType.Bool;
					operatorParam.#value = kv3.getValue() as boolean;
					break;
				default:
					throw 'fix me, missing type';
			}
		}

		return operatorParam;
	}
}
