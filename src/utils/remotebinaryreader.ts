import { BinaryReader, TWO_POW_10, TWO_POW_MINUS_14, getCharCodes } from 'harmony-binary-reader';

import { BinaryAsyncRangeRequest } from './ajax.js';

export class RemoteBinaryReader {
	byteOffset = 0;
	byteLength = 0;
	url: URL;
	littleEndian: boolean;
	chunkSize: number;
	loadedChunks = [];
	#lockPromise;
	#dataView: DataView;
	#lockPromiseResolve
	constructor(url: URL, littleEndian = true, chunkSize = 0) {
		this.url = url;
		this.littleEndian = littleEndian;
		this.chunkSize = chunkSize;
		//this._initDataview(buffer, byteOffset, byteLength);
	}
/*
	_initDataview(buffer, byteOffset, byteLength) {
		if (buffer instanceof BinaryReader) {
			this.#dataView = new DataView(buffer.buffer, byteOffset, byteLength);
		} else if (buffer instanceof Uint8Array) {
			this.#dataView = new DataView(buffer.buffer, byteOffset, byteLength);
		} else if (buffer instanceof ArrayBuffer) {
			this.#dataView = new DataView(buffer, byteOffset, byteLength);
		} else if (typeof buffer === 'string') {
			this.#dataView = new DataView(getCharCodes(buffer).buffer, byteOffset, byteLength);
		} else if (typeof buffer === 'number') {
			this.#dataView = new DataView(new Uint8Array(buffer).buffer, byteOffset, byteLength);
		} else {
			console.error(`Unknow buffer type : ${buffer}`);
		}
	}
*/

	async getLock() {
		do {
			await this.#lockPromise;

		} while (this.#lockPromise !== undefined)

		this.#lockPromise = new Promise((resolve) => {
			this.#lockPromiseResolve = resolve;
		});
	}

	releaseLock() {
		this.#lockPromise = undefined;
		this.#lockPromiseResolve(true);
	}

	async _hasChunk(firstByte, size) {
		let lastByte;
		if (this.#dataView !== undefined) {
			lastByte = Math.min(this.byteLength - 1, firstByte + size);
		} else {
			lastByte = firstByte + size;
		}

		let firstChunk;// = Math.floor(firstByte / this.chunkSize);
		let lastChunk;// = Math.floor(lastByte / this.chunkSize);
		if (this.chunkSize !== 0) {
			firstChunk = Math.floor(firstByte / this.chunkSize);
			lastChunk = Math.floor(lastByte / this.chunkSize);
		} else {
			firstChunk = lastChunk = 0;
		}

		let hasChunk = true;
		for (let i = firstChunk; i <= lastChunk; ++i) {
			if (this.loadedChunks[i] !== 2) {
				hasChunk = false;
				break;
			}
		}

		if (!hasChunk) {
			await this._loadChunk(firstChunk, lastChunk);
			hasChunk = true;
		}
		return hasChunk;
	}

	async _loadChunk(firstChunk, lastChunk) {
		/*const callback = (value) => {
				this.chunkLoaded(value[0], value[1], value[2], value[3]);
			};
		const ajaxReject = (value) => {/*TODO: ????* /};*/

		if (this.chunkSize !== 0) {
			let firstRequestedChunk = undefined;
			let countRequestedChunk = 0;
			for (let i = firstChunk; i <= lastChunk; ++i) {
				if (!this.loadedChunks[i]) {
					this.loadedChunks[i] = 1;
					++countRequestedChunk;
					if (firstRequestedChunk === undefined) {
						firstRequestedChunk = i;
					}
				} else {
					if (countRequestedChunk) {
						let value = await BinaryAsyncRangeRequest(this.url, firstRequestedChunk * this.chunkSize, countRequestedChunk * this.chunkSize);//.then(callback, ajaxReject);
						this._chunkLoaded(value[0], value[1], value[2], value[3]);
					}
					firstRequestedChunk = undefined;
					countRequestedChunk = 0;
				}
			}

			if (countRequestedChunk) {
				let value = await BinaryAsyncRangeRequest(this.url, firstRequestedChunk * this.chunkSize, countRequestedChunk * this.chunkSize);//.then(callback, ajaxReject);
				this._chunkLoaded(value[0], value[1], value[2], value[3]);
			}
		} else {
			if (!this.loadedChunks[0]) {
				this.loadedChunks[0] = 1;
				let value = await BinaryAsyncRangeRequest(this.url);//.then(callback, ajaxReject);
				this._chunkLoaded(value[0], value[1], value[2], value[3]);
			}
		}
	}

	_chunkLoaded(chunkContent, chunkFirstByte, chunkSize, totalSize) {
		if (!chunkContent) {
			return;
		}
		if (this.#dataView === undefined) {
			this.#dataView = new DataView(new Uint8Array(totalSize).buffer);
			this.byteLength = totalSize;

			if (this.chunkSize !== 0) {
				let chunkCount = Math.ceil(totalSize / this.chunkSize);
				if (chunkCount > 0) {
					while (chunkCount--) {
						this.loadedChunks.push(0);
					}
				}
			} else {
				this.loadedChunks.push(0);
			}
		}
		this.setString(chunkFirstByte, chunkContent);

		let firstChunk;// = Math.floor(firstByte / this.chunkSize);
		let lastChunk;// = Math.floor(lastByte / this.chunkSize);
		if (this.chunkSize !== 0) {
			firstChunk = Math.floor(chunkFirstByte / this.chunkSize);
			lastChunk = Math.floor((chunkFirstByte + chunkSize - 1) / this.chunkSize);
		} else {
			firstChunk = lastChunk = 0;
		}
		//let firstChunk = Math.floor(chunkFirstByte / this.chunkSize);// Math.floor should not be needed here
		//let lastChunk = Math.floor((chunkFirstByte + chunkSize - 1) / this.chunkSize);// Math.floor should not be needed here

		for (let i = firstChunk; i <= lastChunk; ++i) {
			this.loadedChunks[i] = 2;
		}
	}

	/*get buffer() {
		return this.#dataView.buffer;
	}

	get byteLength() {
		return this.#dataView.byteLength;
	}*/

	tell() {
		return this.byteOffset;
	}

	seek(byteOffset = this.byteOffset) {
		// /_checkBounds
		this.byteOffset = byteOffset;
	}

	skip(byteLength = 0) {
		// /_checkBounds
		this.byteOffset += byteLength;
	}

	async getString(byteLength, byteOffset = this.byteOffset) {
		await this._hasChunk(byteOffset, byteLength);
		let string = '';
		let readBuffer = new Uint8Array(this.#dataView.buffer, byteOffset, byteLength);
		// /_checkBounds
		this.byteOffset = byteOffset + byteLength;
		for (var i = 0; i < byteLength; i++) {
			string += String.fromCharCode(readBuffer[i]);
		}
		return string;
	}

	async getNullString(byteOffset = this.byteOffset) {
		let string = '';
		let readBuffer = new Uint8Array(this.#dataView.buffer);

		this.byteOffset = byteOffset;
		let c;
		do {
			await this._hasChunk(this.byteOffset, this.chunkSize);
			c = String.fromCharCode(readBuffer[this.byteOffset++]);
			if (c == '\0') {
			} else {
				string += c;
			}
		} while (c != '\0');
		return string;
	}

	setString(byteOffset = this.byteOffset, string) {
		let writeBuffer = new Uint8Array(this.#dataView.buffer, byteOffset, string.length);
		//TODO: check len

		for (var i = 0, length = string.length; i < length; i++) {
			writeBuffer[i] = string.charCodeAt(i) & 0xff;
		}
	}

	async getBytes(byteLength, byteOffset = this.byteOffset) {
		await this._hasChunk(byteOffset, byteLength);
		let readBuffer = new Uint8Array(this.#dataView.buffer, byteOffset, byteLength);
		this.byteOffset = byteOffset + byteLength;
		return readBuffer;
	}

	async getInt8(byteOffset = this.byteOffset) {
		this.byteOffset = byteOffset + 1;
		await this._hasChunk(byteOffset, 1);
		return this.#dataView.getInt8(byteOffset);
	}

	async getUint8(byteOffset = this.byteOffset) {
		this.byteOffset = byteOffset + 1;
		await this._hasChunk(byteOffset, 1);
		return this.#dataView.getUint8(byteOffset);
	}

	async getInt16(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		this.byteOffset = byteOffset + 2;
		await this._hasChunk(byteOffset, 2);
		return this.#dataView.getInt16(byteOffset, littleEndian);
	}

	async getUint16(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		this.byteOffset = byteOffset + 2;
		await this._hasChunk(byteOffset, 2);
		return this.#dataView.getUint16(byteOffset, littleEndian);
	}

	async getFloat16(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {//TODOv3: optimize this function
		//TODO: fix endianness
		this.byteOffset = byteOffset + 2;
		await this._hasChunk(byteOffset, 2);

		let readBuffer = new Uint8Array(this.#dataView.buffer, byteOffset, 2);//TODOv3: optimize
		let b = readBuffer;//this._getBytes(2, byteOffset, littleEndian);

		let sign = b[1] >> 7;
		let exponent = ((b[1] & 0x7C) >> 2);
		let mantissa = ((b[1] & 0x03) << 8) | b[0];

		if (exponent == 0) {
			return (sign ? -1 : 1) * TWO_POW_MINUS_14 * (mantissa / TWO_POW_10);
		} else if (exponent == 0x1F) {
			return mantissa ? NaN : ((sign ? -1 : 1) * Infinity);
		}

		return (sign ? -1 : 1) * Math.pow(2, exponent - 15) * (1 + (mantissa / TWO_POW_10));
	}

	async getInt32(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		this.byteOffset = byteOffset + 4;
		await this._hasChunk(byteOffset, 4);
		return this.#dataView.getInt32(byteOffset, littleEndian);
	}

	async getUint32(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		this.byteOffset = byteOffset + 4;
		await this._hasChunk(byteOffset, 4);
		return this.#dataView.getUint32(byteOffset, littleEndian);
	}

	async getFloat32(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		this.byteOffset = byteOffset + 4;
		await this._hasChunk(byteOffset, 4);
		return this.#dataView.getFloat32(byteOffset, littleEndian);
	}

	async getBigInt64(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		this.byteOffset = byteOffset + 8;
		await this._hasChunk(byteOffset, 8);
		return this.#dataView.getBigInt64(byteOffset, littleEndian);
	}

	async getBigUint64(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		this.byteOffset = byteOffset + 8;
		await this._hasChunk(byteOffset, 8);
		return this.#dataView.getBigUint64(byteOffset, littleEndian);
	}

	async getFloat64(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		this.byteOffset = byteOffset + 8;
		await this._hasChunk(byteOffset, 8);
		return this.#dataView.getFloat64(byteOffset, littleEndian);
	}

	async getVector2(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		let vec = new Float32Array(2);
		vec[0] = await this.getFloat32(byteOffset, littleEndian);
		vec[1] = await this.getFloat32(undefined, littleEndian);
		return vec;
	}

	async getVector3(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		let vec = new Float32Array(3);
		vec[0] = await this.getFloat32(byteOffset, littleEndian);
		vec[1] = await this.getFloat32(undefined, littleEndian);
		vec[2] = await this.getFloat32(undefined, littleEndian);
		return vec;
	}

	async getVector4(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		let vec = new Float32Array(4);
		vec[0] = await this.getFloat32(byteOffset, littleEndian);
		vec[1] = await this.getFloat32(undefined, littleEndian);
		vec[2] = await this.getFloat32(undefined, littleEndian);
		vec[3] = await this.getFloat32(undefined, littleEndian);
		return vec;
	}

	async getVector48(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		let vec = new Float32Array(3);
		vec[0] = await this.getFloat16(byteOffset, littleEndian);
		vec[1] = await this.getFloat16(undefined, littleEndian);
		vec[2] = await this.getFloat16(undefined, littleEndian);
		return vec;
	}

	async getQuaternion(byteOffset = this.byteOffset, littleEndian = this.littleEndian) {
		let vec = new Float32Array(4);
		vec[0] = await this.getFloat32(byteOffset, littleEndian);
		vec[1] = await this.getFloat32(undefined, littleEndian);
		vec[2] = await this.getFloat32(undefined, littleEndian);
		vec[3] = await this.getFloat32(undefined, littleEndian);
		return vec;
	}
}
