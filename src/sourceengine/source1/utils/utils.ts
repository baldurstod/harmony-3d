import { LZMA } from './lzma.js';

export function StringStrip(s) {
	return s.replace(/^[\s\0]+/, '').replace(/[\s\0]+$/, '')
}

export function DecompressLZMA(properties, compressedDatas, uncompressedSize) {
	const inStream = {
		data: compressedDatas,
		offset: 0,
		readByte: function() {
			return this.data[this.offset++];
		}
	};
	const propStream = {
		data: properties,
		offset: 0,
		readByte: function() {
			return this.data[this.offset++];
		}
	};
	const outStream = {
		data: [],
		offset: 0,
		writeByte: function(value) {
			this.data[this.offset++] = value;
		}
	};
	if (LZMA.decompress(propStream, inStream, outStream, uncompressedSize)) {
		function bin2String(array) {
			//return String.fromCharCode.apply(String, array);
			//return new TextDecoder().decode(new Uint8Array(array));
		}
		/*function Uint8ToString(u8a){
			const CHUNK_SZ = 0x8000;
			let c = [];
			for (let i = 0; i < u8a.length; i += CHUNK_SZ) {
				c.push(String.fromCharCode.apply(null, u8a.slice(i, i+CHUNK_SZ)));
			}
			return c.join('');
		}*/
		return new Uint8Array(outStream.data);//Uint8ToString(outStream.data);
	}
	return null;
}
