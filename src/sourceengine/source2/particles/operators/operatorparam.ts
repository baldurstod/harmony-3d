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
	#value: OperatorParamValueType;
	#type: OperatorParamType;
	#name: string;

	constructor(name: string, type: OperatorParamType, value: OperatorParamValueType) {
		this.#name = name;
		this.#type = type;
		this.#value = value;
	}

	getName(): string {
		return this.#name;
	}

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

	static fromKv3(name: string, kv3: Kv3Element | Kv3Value | null): OperatorParam {
		if ((kv3 as Kv3Element).isKv3Element) {
			return this.#fromKv3Element(name, kv3 as Kv3Element);
		}
		if ((kv3 as Kv3Value).isKv3Value) {
			return this.#fromKv3Value(name, kv3 as Kv3Value);
		}

		if (kv3 === null) {
			const operatorParam = new OperatorParam(name, OperatorParamType.Null, null);
		}
		throw 'fix me';
	}

	static #fromKv3Element(name: string, element: Kv3Element): OperatorParam {
		const operatorParam = new OperatorParam(name, OperatorParamType.Element, new Map<string, OperatorParam>);

		for (const [name, property] of element.getProperties()) {
			(operatorParam.#value as Map<string, OperatorParam>).set(name, this.fromKv3(name, property));
		}


		return operatorParam;
	}

	static #fromKv3Value(name: string, kv3: Kv3Value): OperatorParam {
		//const operatorParam = new OperatorParam();

		let type:OperatorParamType;
		let value:OperatorParamValueType;

		if (kv3.isArray()) {
			type = OperatorParamType.Array;

			value = [];

			if (kv3.getSubType() == Kv3Type.Element) {
				for (const sub of kv3.getValue() as Kv3ValueType[]) {
					value.push(this.fromKv3('', sub as Kv3Element));
				}
			} else {
				// TODO: control subtype
				for (const sub of kv3.getValue() as Kv3ValueType[]) {
					value.push(sub as null | boolean | bigint | number | string | Uint8Array | Float32Array);
				}
			}


			//export type Kv3ValueType = null | boolean | bigint | number | string | Uint8Array | Float32Array | Kv3ValueType[] | Kv3Element | Kv3Value;
		} else {
			switch (kv3.getType()) {
				//case Kv3Type.Resource:
				case Kv3Type.String:
					type = OperatorParamType.String;
					value = kv3.getValue() as string;
					break;
				case Kv3Type.Double:
				case Kv3Type.Float:
				case Kv3Type.Int32:
				case Kv3Type.IntZero:
				case Kv3Type.IntOne:
				case Kv3Type.DoubleZero:
				case Kv3Type.DoubleOne:
					type = OperatorParamType.Number;
					value = kv3.getValue() as number;
					break;
				case Kv3Type.True:
				case Kv3Type.False:
				case Kv3Type.Bool:
					type = OperatorParamType.Bool;
					value = kv3.getValue() as boolean;
					break;
				default:
					throw 'fix me, missing type';
			}
		}

		return new OperatorParam(name, type, value);
	}
}
