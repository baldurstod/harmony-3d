export enum TimelinePropertyType {
	Unknown = 0,
	Int,
	Float,
	String,
	Bool,
	Color,
}

export class TimelineProperty {
	#name: string;
	#type: TimelinePropertyType;
	#value: any;
	constructor(name: string, type: TimelinePropertyType, value: any) {
		this.#name = name;
		this.#type = type;
		this.#value = value;
	}

	setValue(value: any) {
		this.#value = value;
	}

	getValue(): any {
		return this.#value;
	}
}
