import { BinaryReader } from 'harmony-binary-reader';
import { VERBOSE } from '../../../../buildoptions';
import { Kv3Element } from '../../../common/keyvalue/kv3element';
import { Kv3File } from '../../../common/keyvalue/kv3file';
import { Source2Texture } from '../../textures/source2texture';
import { Source2File } from '../source2file';
import { Source2NtroBlock, Source2RerlBlock, Source2ResEditInfoBlock, Source2VtexBlock } from '../source2fileblock';
import { loadKeyValue } from './kv3/keyvalue';
import { loadStruct } from './structs';
import { loadDataVtex } from './vtex';

export async function loadData(reader: BinaryReader, file: Source2File, reference: Source2RerlBlock, block: Source2ResEditInfoBlock, introspection: Source2NtroBlock, parseVtex: boolean): Promise<boolean> {
	if (await loadKeyValue(reader, file, block)) {
		return true;
	}

	if (!introspection || !introspection.structsArray) {
		if (parseVtex) {//TODO
			loadDataVtex(reader, block as Source2VtexBlock, file as Source2Texture);
			return true
		}
		return false;
	}
	block.keyValue = new Kv3File();
	const rootElement = new Kv3Element();
	block.keyValue.setRoot(rootElement);

	const structList = introspection.structsArray;
	let startOffset = block.offset;
	for (let structIndex = 0; structIndex < 1/*TODO:removeme*//*structList.length*/; structIndex++) {
		const struct = structList[structIndex]!;//introspection.firstStruct;
		//block.structs[struct.name] = ;
		rootElement.setProperty(struct.name, loadStruct(reader, reference, struct, block, startOffset, introspection, 0));
		startOffset += struct.discSize;
	}
	if (VERBOSE) {
		console.log(block.structs);
	}
	return true;
}
