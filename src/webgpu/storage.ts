export type StorageValueSingle = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array;
export type StorageValueMultiple = { [key: string]: StorageValue };
export type StorageValue = StorageValueSingle | StorageValueMultiple;

export type StorageBuffer = {
	value: StorageValue;
	buffer?: GPUBuffer | null;
};
