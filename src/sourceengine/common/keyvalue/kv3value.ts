import { Kv3Element } from './kv3element';

export enum Kv3Type {
	Unknown = 0,
	Null = 1,
	Bool = 2,
	Int64 = 3,
	UnsignedInt64 = 4,
	Double = 5,
	String = 6,
	Blob = 7,
	Array = 8,
	Element = 9,
	TypedArray = 10,
	Int32 = 11,
	UnsignedInt32 = 12,
	True = 13,
	False = 14,
	IntZero = 15,
	IntOne = 16,
	DoubleZero = 17,
	DoubleOne = 18,
	Float = 19,
	Byte = 23,
	TypedArray2 = 24,
	TypedArray3 = 25,
	Resource = 134,
}

export type Kv3ValueType = null | boolean | bigint | number | string | Uint8Array | Float32Array | Kv3ValueType[] | Kv3Element | Kv3Value;

export class Kv3Value {
	isKv3Value: true = true;
	#type: Kv3Type;
	#subType: Kv3Type;
	#value: Kv3ValueType;

	constructor(type: Kv3Type, value: Kv3ValueType, subType?: Kv3Type) {
		this.#type = type;
		this.#value = value;
		this.#subType = subType ?? Kv3Type.Unknown;
	}

	getType(): Kv3Type {
		return this.#type;
	}

	getSubType(): Kv3Type {
		return this.#subType;
	}

	isBoolean(): boolean {
		switch (this.#type) {
			case Kv3Type.Bool:
			case Kv3Type.True:
			case Kv3Type.False:
				return true;
		}
		return false;
	}

	isNumber(): boolean {
		switch (this.#type) {
			case Kv3Type.Int32:
			case Kv3Type.UnsignedInt32:
			case Kv3Type.IntZero:
			case Kv3Type.IntOne:
			case Kv3Type.Double:
			case Kv3Type.DoubleZero:
			case Kv3Type.DoubleOne:
				return true;
		}
		return false;
	}

	isBigint(): boolean {
		switch (this.#type) {
			case Kv3Type.Int64:
			case Kv3Type.UnsignedInt64:
				return true;
		}
		return false;
	}

	isNumberArray(): boolean {
		switch (this.#subType) {
			case Kv3Type.Int32:
			case Kv3Type.UnsignedInt32:
			case Kv3Type.IntZero:
			case Kv3Type.IntOne:
			case Kv3Type.DoubleZero:
			case Kv3Type.DoubleOne:
			case Kv3Type.Float:
				return this.isArray();
		}
		return false;
	}

	isBigintArray(): boolean {
		switch (this.#subType) {
			case Kv3Type.Int64:
			case Kv3Type.UnsignedInt64:
				return this.isArray();
		}
		return false;
	}

	isArray(): boolean {
		switch (this.#type) {
			case Kv3Type.Array:
			case Kv3Type.TypedArray:
			case Kv3Type.TypedArray2:
			case Kv3Type.TypedArray3:
				return true;
		}
		return false;
	}

	isVector(): boolean {
		switch (this.#subType) {
			case Kv3Type.TypedArray:
			case Kv3Type.TypedArray2:
			case Kv3Type.TypedArray3:
				return true;
		}
		return false;
	}

	getValue(): Kv3ValueType {
		return this.#value;
	}

	exportAsText(linePrefix?: string): string {
		linePrefix = linePrefix ?? '';
		switch (this.#type) {
			case 6:
				return linePrefix + '"' + this.#value + '"';
			case Kv3Type.Resource:
				return linePrefix + 'resource:"' + this.#value + '"';

		}
		return linePrefix + this.#value;
	}
}
