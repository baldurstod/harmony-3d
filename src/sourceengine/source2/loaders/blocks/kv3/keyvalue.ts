import { BinaryReader } from 'harmony-binary-reader';
import { Source2File } from '../../source2file';
import { Source2DataBlock } from '../../source2fileblock';
import { loadDataKv3 } from './kv3';
import { loadDataVkv } from './vkv';

export async function loadKeyValue(reader: BinaryReader, file: Source2File, block: Source2DataBlock): Promise<boolean> {
	const bytes = reader.getUint32(block.offset);
	switch (bytes) {
		case 0x03564B56: // VKV3
			loadDataVkv(reader, block);
			return true;
		case 0x4B563301: // kv31
			await loadDataKv3(reader, block, 1);
			return true;
		case 0x4B563302: // kv32 ?? new since wind ranger arcana
			await loadDataKv3(reader, block, 2);
			return true;
		case 0x4B563303: // KV3 v3 new since muerta
			await loadDataKv3(reader, block, 3);
			return true;
		case 0x4B563304: // KV3 v4 new since dota 7.33
			await loadDataKv3(reader, block, 4);
			return true;
		case 0x4B563305: // KV3 v5 new since frostivus 2024
			await loadDataKv3(reader, block, 5);
			return true;
		default:
			console.info('Unknown block data type:', bytes, block, file);
	}
	return false
}
