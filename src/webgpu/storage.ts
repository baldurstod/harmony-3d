export type StorageValueArray = Int8Array | Uint8Array | Int16Array | Uint16Array | Int32Array | Uint32Array | Float32Array | StorageValueStruct[];
export type StorageValueStruct = { [key: string]: StorageValue | number };
export type StorageValue = StorageValueArray | StorageValueStruct;

export type StorageBuffer = {
	value: StorageValue;
	buffer?: GPUBuffer | null;
};
