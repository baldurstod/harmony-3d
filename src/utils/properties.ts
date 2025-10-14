export enum PropertyType {
	Null = 'null',
	Undefined = 'undefined',
	String = 'string',
	Number = 'number',
	Bigint = 'bigint',
	Boolean = 'boolean',
	Array = 'array',
	Object = 'object',
}

export type PropertyValues = string | number | bigint | any | any[];

export class Property {
	type: string;
	value: PropertyValues;

	constructor(type: string, value: PropertyValues) {
		this.type = type;
		this.value = value;
	}
}

export class Properties {
	#properties = new Map<string, Property>();

	set(name: string, property: Property): void {
		this.#properties.set(name, property);
	}

	delete(name: string): void {
		this.#properties.delete(name);
	}

	get(name: string): Property | undefined {
		return this.#properties.get(name);
	}

	copy(source: Properties, keys?: string[]): void {
		if (keys) {
			for (const key of keys) {
				const value = source.get(key);
				if (value) {
					this.set(key, value);
				}
			}

		} else {
			for (const [key, value] of source.#properties) {
				this.set(key, value);
			}
		}
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

	setBoolean(name: string, value: boolean): void {
		this.#properties.set(name, new Property(PropertyType.Boolean, value));
	}

	getBoolean(name: string): boolean | undefined {
		const prop = this.#properties.get(name);
		if (prop?.type == PropertyType.Boolean) {
			return prop.value as boolean;
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

	setArray(name: string, value: any[]): void {
		this.#properties.set(name, new Property(PropertyType.Array, value));
	}

	getArray(name: string): any[] | undefined {
		const prop = this.#properties.get(name);
		if (prop?.type == PropertyType.Array) {
			return prop.value;
		}
	}

	setObject(name: string, value: object): void {
		this.#properties.set(name, new Property(PropertyType.Object, value));
	}

	getObject(name: string): object | undefined {
		const prop = this.#properties.get(name);
		if (prop?.type == PropertyType.Object) {
			return prop.value;
		}
	}

}
