import { LZMA } from './lzma';

export function stringStrip(s: string) {
	return s.replace(/^[\s\0]+/, '').replace(/[\s\0]+$/, '')
}

export function DecompressLZMA(properties: Uint8Array, compressedDatas: Uint8Array, uncompressedSize: number) {
	const inStream = {
		data: compressedDatas,
		offset: 0,
		readByte: function () {
			return this.data[this.offset++];
		}
	};
	const propStream = {
		data: properties,
		offset: 0,
		readByte: function () {
			return this.data[this.offset++];
		}
	};
	const outStream: {
		data: number[],
		offset: 0,
		writeByte: (value: number) => void,
	} = {
		data: [],
		offset: 0,
		writeByte: function (value) {
			this.data[this.offset++] = value;
		}
	};
	if (LZMA.decompress(propStream, inStream, outStream, uncompressedSize)) {
		return new Uint8Array(outStream.data);//Uint8ToString(outStream.data);
	}
	return null;
}
