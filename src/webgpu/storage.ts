import { vec4 } from 'gl-matrix';

export type StorageValueArray = Int8Array | Uint8Array | Uint8ClampedArray | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | StorageValueStruct[] | vec4;
export type StorageValueStruct = { [key: string]: StorageValue | number };
export type StorageValue = StorageValueArray | StorageValueStruct;

export type StorageBuffer = {
	value?: StorageValue | null;
	buffer?: GPUBuffer | null;
	size?: number;
	/** Buffer usage. Combination of GPUBufferUsage values. Default to UNIFORM | COPY_DST | STORAGE */
	usage?: number;
	/** Is this buffer intended to be written raw, instead of structured. Defaults to false. */
	raw?: boolean;
	/** If raw is true, offset in bytes into `buffer` to begin writing at. Defaults to 0. */
	rawOffset?: number;
	/** If raw is true, Size of content to write from `value` to `buffer`.
	 * Given in elements if `value` is a `TypedArray` and bytes otherwise. Default to `value` size. */
	rawSize?: number;
};
