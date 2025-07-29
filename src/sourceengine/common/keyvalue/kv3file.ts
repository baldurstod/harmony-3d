import { Kv3Element } from './kv3element';
import { Kv3Type, Kv3Value, Kv3ValueType } from './kv3value';

/**
 * Kv3File
 */
export class Kv3File {
	isKv3File: true = true;
	root: null | Kv3Element = null;

	setRoot(root: Kv3Element) {
		this.root = root;
	}

	exportAsText() {
		if (this.root) {
			return this.root.exportAsText('');
		}
		return null;
	}

	getValue(path: string): Kv3Element | Kv3Value | null {
		const arr = path.split('.');
		let data: Kv3Element | Kv3Value | null | undefined = this.root;
		if (!data) {
			return null;
		}

		//let sub;
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
			/*
			if (sub instanceof Kv3Array) {
				data = sub;
			} else {
				data = sub;
			}*/
		}

		/*
		if (data instanceof Kv3Value) {
			return data.getValue();
		} else {
			return data;
		}*/
		return data;
	}

	getValueAsNumber(path: string): number | null {
		const value = this.getValue(path);
		if ((value as Kv3Value | null)?.isKv3Value && (value as Kv3Value).isNumber()) {
			return (value as Kv3Value).getValue() as number;
		}
		return null;
	}

	getValueAsStringArray(path: string): string[] | null {
		const value = this.getValue(path);
		if ((value as Kv3Value | null)?.isKv3Value && (value as Kv3Value).getSubType() == Kv3Type.String) {
			return (value as Kv3Value).getValue() as string[];
		}
		return null;
	}

	getValueAsElementArray(path: string): Kv3Element[] | null {
		const value = this.getValue(path);
		if ((value as Kv3Value | null)?.isKv3Value && (value as Kv3Value).getSubType() == Kv3Type.Element) {
			return (value as Kv3Value).getValue() as Kv3Element[];
		}
		return null;
	}
}

//export type Kv3ValueType = null | number | Kv3Element;
