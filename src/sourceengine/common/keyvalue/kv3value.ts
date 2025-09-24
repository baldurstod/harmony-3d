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
}

export enum Kv3Flag {
	None = 0,
	ResourceName = 2,
	Panorama = 3,
	SoundEvent = 4,
	Subclass = 5,

	//resource_name:
	//panorama:
}

const Kv3FlagString = new Map([
	[Kv3Flag.ResourceName, 'resource_name'],
	[Kv3Flag.Panorama, 'panorama'],
	[Kv3Flag.SoundEvent, 'soundevent'],
	[Kv3Flag.Subclass, 'subclass'],
]);

export type Kv3ValueTypePrimitives = null | boolean | bigint | number | string | Uint8Array | Float32Array | Kv3Element | Kv3Value;
export type Kv3ValueTypeArrays = number[];
export type Kv3ValueTypeAll = Kv3ValueTypePrimitives | Kv3ValueTypeArrays;
export type Kv3ValueType = Kv3ValueTypeAll | Kv3ValueTypeAll[];

export class Kv3Value {
	isKv3Value: true = true;
	#type: Kv3Type;
	#subType: Kv3Type;
	#value: Kv3ValueType;
	#flag: Kv3Flag;

	constructor(type: Kv3Type, value: Kv3ValueType, flag = Kv3Flag.None, subType?: Kv3Type) {
		this.#type = type;
		this.#value = value;
		this.#subType = subType ?? Kv3Type.Unknown;
		this.#flag = flag;
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
			case Kv3Type.Float:
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
			case Kv3Type.Double:
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

		let flagString = '';

		if (this.#flag != Kv3Flag.None) {
			const flagValue = Kv3FlagString.get(this.#flag);
			if (flagValue) {
				flagString = flagValue + ':';
			} else {
				flagString = '<unknown flag ' + this.#flag + '>';
			}
		}

		const linePrefix2 = linePrefix + '\t';
		switch (this.#type) {
			case Kv3Type.String:
				return flagString + '"' + this.#value + '"';
			case Kv3Type.Element:
				return flagString + '\n' + (this.#value as Kv3Element).exportAsText(linePrefix);
			/*
		case Kv3Type.Array:
			let arrayString = '';
			for (const value of this.#value as Kv3ValueTypeAll[]) {
				arrayString += linePrefix2 + flagString + value + ',\n';
			}
			return `\n${linePrefix}[\n${arrayString}${linePrefix}]`;
			*/
			case Kv3Type.Array:
				return formatArray(this.#value as Kv3ValueTypeAll[], linePrefix);
			case Kv3Type.TypedArray:
			case Kv3Type.TypedArray2:
			case Kv3Type.TypedArray3:
				return formatTypedArray(this.#type, this.#subType, flagString, this.#value as Kv3ValueTypeAll[], linePrefix);

		}
		return flagString + String(this.#value);
	}
}

function formatTypedArray(type: Kv3Type, subType: Kv3Type, flagString: string, arr: Kv3ValueTypeAll[], linePrefix: string): string {
	const linePrefix2 = linePrefix + '\t';
	let typedArrayString = '';
	for (let i = 0, l = (arr as Kv3ValueTypeAll[]).length, m = l - 1; i < l; i++) {
		const value = (arr as Kv3ValueTypeAll[])[i]!;
		switch (subType) {
			case Kv3Type.Double:
			case Kv3Type.DoubleZero:
			case Kv3Type.DoubleOne:
			case Kv3Type.Float:
			case Kv3Type.Int32:
			case Kv3Type.Int64:
			case Kv3Type.IntZero:
			case Kv3Type.IntOne:
			case Kv3Type.UnsignedInt32:
			case Kv3Type.UnsignedInt64:
				//typedArrayString += flagString + value + ', ';
				typedArrayString += flagString + value;
				if (i == m) {
					typedArrayString += ' ';
				} else {
					typedArrayString += ', ';
				}
				break;
			case Kv3Type.Array:
			case Kv3Type.TypedArray:
			case Kv3Type.TypedArray2:
			case Kv3Type.TypedArray3:
				typedArrayString += linePrefix2 + formatArray(value as Kv3ValueTypeAll[], linePrefix2) + ',\n';
				break;
			case Kv3Type.String:
				typedArrayString += linePrefix2 + flagString + '"' + value + '"' + ',\n';
				break;
			case Kv3Type.Element:
				if (flagString) {
					typedArrayString += '\n' + linePrefix2 + flagString;
				}
				typedArrayString += '\n' + (value as Kv3Element).exportAsText(linePrefix2) + ',';
				break;
			/*
			case Kv3Type.Subclass:
				typedArrayString += linePrefix2 + 'subclass:"' + value + '",\n';
				break;
			*/
			default:
				typedArrayString += linePrefix2 + flagString + value + ',\n';
				break;
		}
	}
	switch (subType) {
		case Kv3Type.Double:
		case Kv3Type.DoubleZero:
		case Kv3Type.DoubleOne:
		case Kv3Type.Float:
		case Kv3Type.Int32:
		case Kv3Type.Int64:
		case Kv3Type.IntZero:
		case Kv3Type.IntOne:
		case Kv3Type.UnsignedInt32:
		case Kv3Type.UnsignedInt64:
			return `[ ${typedArrayString}]`;
		case Kv3Type.Element:
			return `\n${linePrefix}[${typedArrayString}\n${linePrefix}]`;
		default:
			return `\n${linePrefix}[\n${typedArrayString}${linePrefix}]`;
	}
}

function formatArray(arr: Kv3ValueTypeAll[], linePrefix: string): string {
	const linePrefix2 = linePrefix + '\t';
	let typedArrayString = '';
	for (let i = 0, l = (arr as Kv3ValueTypeAll[]).length, m = l - 1; i < l; i++) {
		const value = (arr as Kv3ValueTypeAll[])[i]!;
		//typedArrayString += flagString + value + ', ';
		typedArrayString += value;
		if (i != m) {
			typedArrayString += ', ';
		}
	}
	return `[ ${typedArrayString} ]`;
	//return `\n${linePrefix}[\n${typedArrayString}${linePrefix}]`;
}
