import { BinaryReader } from 'harmony-binary-reader';
import { ArgumentDependency } from '../files/blocks/argumentdependency';
import { InputDependency } from '../files/blocks/inputdependency';
import { RediBlockConstructor } from '../files/blocks/redi';
import { SpecialDependency } from '../files/blocks/specialdependency';
import { Source2File } from '../source2file';
import { Source2ResEditInfoBlock } from '../source2fileblock';
import { loadKeyValue } from './kv3/keyvalue';

const rediBlockConstructors: [RediBlockConstructor, 'inputDependencies' | 'additionalInputDependencies' | 'argumentDependencies' | 'specialDependencies'][] = [
	[InputDependency, 'inputDependencies'],
	[InputDependency, 'additionalInputDependencies'],
	[ArgumentDependency, 'argumentDependencies'],
	[SpecialDependency, 'specialDependencies'],
	// TODO: add other stuff
];

export async function loadRedi(reader: BinaryReader, file: Source2File, block: Source2ResEditInfoBlock): Promise<boolean> {
	if (await loadKeyValue(reader, file, block)) {
		return true;
	}

	block.inputDependencies = [];
	block.additionalInputDependencies = [];
	block.argumentDependencies = [];
	block.specialDependencies = [];

	reader = new BinaryReader(reader, block.offset);

	for (let i = 0; i < rediBlockConstructors.length; i++) {
		reader.seek(i * 8 /*size of offset + count*/);

		const startOffset = reader.tell() + reader.getUint32();
		const count = reader.getUint32();

		let offset = startOffset;
		for (let j = 0; j < count; j++) {
			const rediBock = new rediBlockConstructors[i]![0]();

			rediBock.fromReader(new BinaryReader(reader, offset));
			offset += rediBock.getLength();
			//console.info(rediBock);

			block[rediBlockConstructors[i]![1]].push(rediBock as any/*evil*/);
		}
	}

	return true;
}
