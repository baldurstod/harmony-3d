export enum PropertyType {
	Null = 0,
	Undefined = 1,
	String = 2,
	Number = 3,
	Bigint = 4,
	Boolean = 5,
	Array = 100,
}

export type PropertyValues = string | number | bigint | any[];

export class Property {
	type: PropertyType;
	value: PropertyValues;

	constructor(type: PropertyType, value: PropertyValues) {
		this.type = type;
		this.value = value;
	}
}

export class Properties {
	#properties = new Map<string, Property>();

	set(name: string, property: Property): void {
		this.#properties.set(name, property);
	}

	setString(name: string, value: string): void {
		this.#properties.set(name, new Property(PropertyType.String, value));
	}

	getString(name: string): string | undefined {
		const prop = this.#properties.get(name);
		if (prop?.type == PropertyType.String) {
			return prop.value as string;
		}
	}

	setNumber(name: string, value: number): void {
		this.#properties.set(name, new Property(PropertyType.Number, value));
	}

	getNumber(name: string): number | undefined {
		const prop = this.#properties.get(name);
		if (prop?.type == PropertyType.Number) {
			return prop.value as number;
		}
	}

	setBigint(name: string, value: bigint): void {
		this.#properties.set(name, new Property(PropertyType.Bigint, value));
	}

	getBigint(name: string): bigint | undefined {
		const prop = this.#properties.get(name);
		if (prop?.type == PropertyType.Bigint) {
			return prop.value as bigint;
		}
	}

}
