import { vec2, vec3, vec4 } from 'gl-matrix';
import { BinaryReader } from 'harmony-binary-reader';
import { registerLoader } from '../../../loaders/loaderfactory';
import { SourceBinaryLoader } from '../../common/loaders/sourcebinaryloader';
import { Color } from '../particles/color';
import { DmeParticleSystemDefinition, SourcePCF } from './sourcepcf';

const _PCF_LOADER_DEBUG_ = false;//TODOv3 remove


const data_size = [
	0, 4, 4, 4, 1, 0, 0, 4, 4, 8, 12, 16, 12, 16, 64,
	4, 4, 4, 1, 0, 0, 4, 4, 8, 12, 16, 12, 16, 64,
];

const BINARY_FORMAT_POS = 25;

export class SourceEnginePCFLoader extends SourceBinaryLoader {
	parse(repository: string, path: string, content: ArrayBuffer): SourcePCF | null {
		const pcf = new SourcePCF(repository, path);
		const reader = new BinaryReader(content);

		const str = reader.getString(Math.min(1000, content.byteLength));

		let startOffset = str.indexOf('-->');
		if (startOffset === 0) {
			return null;
		}
		startOffset += 5;
		pcf.binaryVersion = Number(str.substring(BINARY_FORMAT_POS, BINARY_FORMAT_POS + 1));
		if (pcf.binaryVersion !== 2 && pcf.binaryVersion !== 5) {
			console.log('Binary version unknown. Loading of file may be unaccurate.');
		}

		this.#parseHeader(reader, pcf, startOffset);

		return pcf;
	}

	#parseHeader(reader: BinaryReader, pcf: SourcePCF, startOffset: number): void {
		reader.seek(startOffset);

		let nStrings = 0;
		let nElements = 0
		if (pcf.binaryVersion < 5) {
			nStrings = reader.getUint16();
		} else {
			nStrings = reader.getUint32();
		}

		for (let i = 0; i < nStrings; ++i) {
			pcf.stringDict.push(reader.getNullString());
		}

		if (pcf.binaryVersion < 5) {
			nElements = reader.getUint32();
		} else {
			nElements = reader.getUint32();
		}

		for (let i = 0; i < nElements; i++) {
			pcf.elementsDict.push(this.#parseElement(reader, pcf));
		}

		for (let i = 0; i < nElements; i++) {
			pcf.elementsDict[i]!.attributes = this.#parseAttributes(reader, pcf);
		}
	}

	#parseElement(reader: BinaryReader, pcf: SourcePCF): CDmxElement {
		const element: Partial<CDmxElement> = {};

		if (pcf.binaryVersion < 5) {
			element.type = this.getString(pcf, reader.getUint16());
		} else {
			element.type = this.getString(pcf, reader.getUint32());
		}

		if (pcf.binaryVersion < 5) {
			element.name = reader.getNullString();
		} else {
			element.name = this.getString(pcf, reader.getUint32())
		}
		element.guid = reader.getBytes(16);
		element.guid2 = '';
		for (let i = 0; i < 16; ++i) {
			element.guid2 += String.fromCharCode(element.guid[i]!);
		}

		if (element.type == DmeParticleSystemDefinition) {
			pcf.addSystem(element as CDmxElement);
		}
		return element as CDmxElement;
	}

	#parseAttributes(reader: BinaryReader, pcf: SourcePCF): CDmxAttribute[] {
		const attributes: CDmxAttribute[] = [];

		const nAttributes = reader.getUint32();
		for (let i = 0; i < nAttributes; ++i) {
			attributes.push(this.#parseAttribute(reader, pcf));
		}

		return attributes;
	}

	#parseAttribute(reader: BinaryReader, pcf: SourcePCF): CDmxAttribute {
		const attribute: Partial<CDmxAttribute> = {};

		if (pcf.binaryVersion < 5) {
			attribute.typeName = this.getString(pcf, reader.getUint16());
		} else {
			attribute.typeName = this.getString(pcf, reader.getUint32());
		}

		attribute.type = reader.getUint8()

		if (attribute.type > 14) {
			attribute.value = this.#parseArray(reader, pcf, attribute.type);
		} else {
			attribute.value = this.#parseValue(reader, pcf, attribute.type);
		}
		return attribute as CDmxAttribute;
	}

	#parseArray(reader: BinaryReader, pcf: SourcePCF, type: number): CDmxAttributeValue[] {
		const valuesCount = reader.getUint32();
		const value: CDmxAttributeValue[] = [];

		for (let i = 0; i < valuesCount; ++i) {
			value.push(this.#parseValue(reader, pcf, type));
		}

		return value;
	}

	#parseValue(reader: BinaryReader, pcf: SourcePCF, type: number): CDmxAttributeValue {
		let size = data_size[type];
		let value: CDmxAttributeValue = undefined;

		switch (type % 14) {
			case 1: // Element
				value = this.getElement(pcf, reader.getInt32());
				break;
			case 2: // Integer
				value = reader.getInt32();
				break;
			case 3: // Float
				value = reader.getFloat32();
				break;
			case 4: // Bool
				value = reader.getInt8();
				break;
			case 7: // Time
				value = reader.getInt32() / 10000.0;
				break;
			case 8: // Color
				//value = {r:reader.getUint8(), g:reader.getUint8(), b:reader.getUint8(), a:reader.getUint8()};
				value = new Color(reader.getUint8(), reader.getUint8(), reader.getUint8(), reader.getUint8());
				//value = [reader.getUint8(), reader.getUint8(), reader.getUint8(), reader.getUint8()];
				break;
			case 9: // vec2
				value = vec2.fromValues(reader.getFloat32(), reader.getFloat32());
				break;
			case 10: // vec3
				value = vec3.fromValues(reader.getFloat32(), reader.getFloat32(), reader.getFloat32());
				break;
			case 11: // vec4
				value = vec4.fromValues(reader.getFloat32(), reader.getFloat32(), reader.getFloat32(), reader.getFloat32());
				break;
			case 5:
				if (pcf.binaryVersion < 5) {
					value = reader.getNullString();
				} else {
					value = this.getString(pcf, reader.getInt32())
				}
				break;
			case 6:
				size = reader.getInt32();
				reader.seek(reader.tell() + size);
				break;
			default:
				console.error('unknown type', type, 'in #parseValue', pcf);
				throw 'fix me';
				break;
		}

		return value;
	}

	getString(pcf: SourcePCF, index: number): string {
		if (pcf) {
			const s = pcf.stringDict[index];
			if (s) {
				return s;
			} else {
				return '';
			}
		}
		return '';
	}

	getElement(pcf: SourcePCF, index: number): CDmxElement | null {
		if (pcf) {
			const e = pcf.elementsDict[index];
			if (e) {
				return e;
			} else {
				return null;
			}
		}
		return null;
	}

}
registerLoader('SourceEnginePCFLoader', SourceEnginePCFLoader);

export type CDmxElement = {
	type: string;
	name: string;
	guid: Uint8Array;
	guid2: string;
	attributes: CDmxAttribute[];
}
export type CDmxAttribute = {
	typeName: string;
	type: number;//TODO: create enum
	value: CDmxAttributeValue | CDmxAttributeValue[];
}

export type CDmxAttributeValue = null | undefined | number | CDmxElement | Color | vec2 | vec3 | vec4 | string;
