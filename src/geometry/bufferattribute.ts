import { TypedArrayNumber } from 'harmony-types';
import { VERBOSE } from '../buildoptions';
import { WebGLAnyRenderingContext } from '../types';
import { GL_ARRAY_BUFFER, GL_BYTE, GL_DYNAMIC_COPY, GL_DYNAMIC_DRAW, GL_DYNAMIC_READ, GL_FLOAT, GL_INT, GL_SHORT, GL_STATIC_COPY, GL_STATIC_DRAW, GL_STATIC_READ, GL_STREAM_COPY, GL_STREAM_DRAW, GL_STREAM_READ, GL_UNSIGNED_BYTE, GL_UNSIGNED_INT, GL_UNSIGNED_SHORT } from '../webgl/constants';

const TypedArrayProto = Object.getPrototypeOf(Int8Array);// we can't use TypedArray directly

export enum BufferUsage {
	StaticDraw = GL_STATIC_DRAW,
	DynamicDraw = GL_DYNAMIC_DRAW,
	StreamDraw = GL_STREAM_DRAW,
	StaticRead = GL_STATIC_READ,
	DynamicRead = GL_DYNAMIC_READ,
	StreamRead = GL_STREAM_READ,
	StaticCopy = GL_STATIC_COPY,
	DynamicCopy = GL_DYNAMIC_COPY,
	StreamCopy = GL_STREAM_COPY,
}

export class BufferAttribute {
	#type;
	#usage: BufferUsage = BufferUsage.StaticDraw;
	#target: GLenum;
	#wireframeDirty = true;
	#solidWireframeDirty = true;
	itemSize: number;
	dirty: boolean;
	_array?: TypedArrayNumber;
	count = 0;
	_buffer: WebGLBuffer | null = null;
	#source: any;
	divisor = 0;
	readonly elementSize: number;
	// TODO: change WebGL attribute names and remove this
	readonly wgslName: string;
	readonly wgslFormat: GPUVertexFormat;
	gpuBuffer?: GPUBuffer;

	constructor(array: TypedArrayNumber | null, elementSize: number, itemSize: number, wgslName: string, wgslFormat: GPUVertexFormat) {
		this.itemSize = itemSize;
		this.elementSize = elementSize;
		this.wgslName = wgslName;
		this.wgslFormat = wgslFormat;
		if (isNaN(this.itemSize)) {
			throw new TypeError('Argument itemSize must be an Integer');
		}
		this.#target = GL_ARRAY_BUFFER;
		this.#type = 0;
		//TODO: normalized ?

		this.dirty = true;

		if (array) {
			this.setArray(array);
		}

		return this;
	}

	get type() {
		return this.#type;
	}

	set usage(usage: BufferUsage) {
		this.#usage = usage;
		this.dirty = true;
		this.#wireframeDirty = true;
		this.#solidWireframeDirty = true;
	}

	set target(target: GLenum) {
		this.#target = target;
		this.dirty = true;
		this.#wireframeDirty = true;
		this.#solidWireframeDirty = true;
	}

	setArray(array: typeof TypedArrayProto) {
		if (!(array instanceof TypedArrayProto)) {
			throw new TypeError('Argument array must be a TypedArray');
		}
		this._array = array;
		this.count = array.length / this.itemSize;
		if (VERBOSE) {
			console.log(`BufferAttribute array length ${array.length} item size ${this.itemSize} count ${this.count}`);
		}
		this.dirty = true;
		this.#wireframeDirty = true;
		this.#solidWireframeDirty = true;

		switch (true) {
			case array instanceof Float32Array:
				this.#type = GL_FLOAT;
				break;
			case array instanceof Int8Array:
				this.#type = GL_BYTE;
				break;
			case array instanceof Int16Array:
				this.#type = GL_SHORT;
				break;
			case array instanceof Int32Array:
				this.#type = GL_INT;
				break;
			case array instanceof Uint8Array:
				this.#type = GL_UNSIGNED_BYTE;
				break;
			case array instanceof Uint16Array:
				this.#type = GL_UNSIGNED_SHORT;
				break;
			case array instanceof Uint32Array:
				this.#type = GL_UNSIGNED_INT;
				break;
			default:
				throw 'Unsupported array type';
		}
	}

	getArray(): TypedArrayNumber | null {
		return this._array ?? null;
	}

	update(glContext: WebGLAnyRenderingContext) {
		if (this.dirty && this._array) {
			if (!this._buffer) {
				this._buffer = glContext.createBuffer();//TODOv3: createBuffer in graphics
			}

			glContext.bindBuffer(this.#target, this._buffer);
			glContext.bufferData(this.#target, this._array, this.#usage);

			this.dirty = false;
			this.#wireframeDirty = true;
			this.#solidWireframeDirty = true;
		}
	}

	updateWireframe(glContext: WebGLAnyRenderingContext) {
		if (this.#wireframeDirty && this._array) {
			if (this._buffer === undefined) {
				this._buffer = glContext.createBuffer();//TODOv3: createBuffer in graphics
			}

			const lineArray = new Uint32Array(2 * this._array.length);

			let a, b, c;
			const arr = this._array;
			let j = 0;
			for (let i = 0; i < arr.length; i += 3) {
				a = arr[i + 0]!;
				b = arr[i + 1]!;
				c = arr[i + 2]!;
				//lineArray.push(a, b, b, c, c, a);
				lineArray[j++] = a;
				lineArray[j++] = b;
				lineArray[j++] = b;
				lineArray[j++] = c;
				lineArray[j++] = c;
				lineArray[j++] = a;
			}

			glContext.bindBuffer(this.#target, this._buffer);
			glContext.bufferData(this.#target, lineArray, this.#usage);

			this.dirty = true;
			this.#wireframeDirty = false;
		}
	}

	clone() {
		return new (this.constructor as typeof Uint8BufferAttribute)(this.#source, this.itemSize, this.wgslName/*, this._array.byteOffset, this._array.byteLength*/);
	}

	setSource(source: any) {
		this.#source = source;
	}

	getBuffer() {
		return this._buffer;
	}
}

export class Uint8BufferAttribute extends BufferAttribute {//fixme
	constructor(array: typeof TypedArrayProto, itemSize: number, wgslName: string, offset?: number, length?: number) {
		super(null, 1, itemSize, wgslName, getUint8Format(itemSize));
		this.setSource(array);
		this.setArray(new Uint8Array(array));
	}
}

export class Uint16BufferAttribute extends BufferAttribute {//fixme
	constructor(array: typeof TypedArrayProto, itemSize: number, wgslName: string, offset?: number, length?: number) {
		super(null, 2, itemSize, wgslName, getUint16Format(itemSize));
		this.setSource(array);
		this.setArray(new Uint16Array(array, offset, length));
	}
}

export class Uint32BufferAttribute extends BufferAttribute {//fixme
	constructor(array: typeof TypedArrayProto, itemSize: number, wgslName: string, offset?: number, length?: number) {
		super(null, 4, itemSize, wgslName, getUint32Format(itemSize));
		this.setSource(array);
		this.setArray(new Uint32Array(array, offset, length));
	}
}

export class Float32BufferAttribute extends BufferAttribute {//fixme
	constructor(array: typeof TypedArrayProto, itemSize: number, wgslName: string, offset?: number, length?: number) {
		super(null, 4, itemSize, wgslName, getFloat32Format(itemSize));
		this.setSource(array);
		this.setArray(new Float32Array(array, offset, length));
	}
}

function getUint8Format(size: number): GPUVertexFormat {
	return getFormat('uint8', size);
}

function getUint16Format(size: number): GPUVertexFormat {
	return getFormat('uint16', size);
}

function getUint32Format(size: number): GPUVertexFormat {
	return getFormat('uint32', size);
}

function getFloat32Format(size: number): GPUVertexFormat {
	return getFormat('float32', size);
}

function getFormat(prefix: string, size: number): GPUVertexFormat {
	switch (size) {
		case 2:
			return prefix + 'x2' as GPUVertexFormat;
		case 3:
			// Warning; uint8x3 don't exist. Don't use
			return prefix + 'x3' as GPUVertexFormat;
		case 4:
			return prefix + 'x4' as GPUVertexFormat;
	}
	return prefix as GPUVertexFormat;
}
