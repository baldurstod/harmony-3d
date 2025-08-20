import { BinaryReader } from 'harmony-binary-reader';

export function readHandle(reader: BinaryReader) {
	let str = '';
	let c;
	let hex;
	for (let i = 0; i < 8; i++) {
		c = reader.getUint8();
		hex = c.toString(16); // convert to hex
		hex = (hex.length == 1 ? '0' + hex : hex);
		str += hex;
	}
	return str;
}
