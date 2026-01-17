export type StorageValue = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array;

export type StorageBuffer = {
	value: StorageValue;
	buffer?: GPUBuffer | null;
};
