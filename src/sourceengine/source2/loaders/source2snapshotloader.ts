import { BinaryReader } from 'harmony-binary-reader';
import { saveFile } from 'harmony-browser-utils';
import { ERROR, LOG, TESTING } from '../../../buildoptions';
import { Source2Snapshot } from '../particles/source2snapshot';
import { Source2File } from './source2file';
import { Source2SnapBlock } from './source2fileblock';
import { Source2FileLoader } from './source2fileloader';

export const Source2SnapshotLoader = new (function () {
	class Source2SnapshotLoader {

		async load(repository: string, filename: string): Promise<Source2Snapshot | null> {
			filename = filename.replace(/\.vsnap_c/, '').replace(/\.vsnap/, '');
			const snapFile = await new Source2FileLoader(true).load(repository, filename + '.vsnap_c');
			if (snapFile) {
				return this.#loadSnapshot(snapFile as Source2File);
			} else {
				if (ERROR) {
					console.error('Error loading snapshot', repository, filename);
				}
				return null;
			}
		}

		#loadSnapshot(snapFile: Source2File): Source2Snapshot {
			const snapShot = new Source2Snapshot();
			snapShot.file = snapFile;

			const dataBlock = snapFile.getBlockByType('DATA');
			const snapBlock = snapFile.getBlockByType('SNAP') as Source2SnapBlock;
			if (dataBlock && snapBlock) {
				if (LOG) {
					console.log(dataBlock);
					console.log(snapBlock);
				}
				const particleCount = dataBlock.getKeyValueAsNumber('num_particles') ?? 0;
				snapShot.setParticleCount(particleCount);
				const snapshotAttributes = dataBlock.getKeyValueAsElementArray('attributes') ?? [];
				const snapshotStringList = dataBlock.getKeyValueAsStringArray('string_list') ?? [];

				const reader = new BinaryReader(snapBlock.datas);
				let attributeValue;
				let bones;
				let weights;
				for (const snapshotAttribute of snapshotAttributes) {
					const dataOffset = snapshotAttribute.getSubValueAsNumber('data_offset');
					if (dataOffset === null) {
						continue;
					}
					reader.seek(dataOffset);
					const attributeType = snapshotAttribute.getSubValueAsString('type')
					switch (attributeType) {
						case 'float3':
						case 'vector':
							attributeValue = [];
							for (let i = 0; i < particleCount; ++i) {
								attributeValue.push(reader.getVector3());
							}
							break;
						case 'skinning':
							attributeValue = [];
							for (let i = 0; i < particleCount; ++i) {
								const skinning = Object.create(null)/*TODO: create type*/;
								bones = [];
								weights = [];
								for (let i = 0; i < 4; ++i) {
									bones.push(snapshotStringList[reader.getUint16()]);
								}
								for (let i = 0; i < 4; ++i) {
									weights.push(reader.getFloat32());
								}
								skinning.bones = bones;
								skinning.weights = weights;
								attributeValue.push(skinning);
							}
							break;
						case 'string':
							attributeValue = [];
							for (let i = 0; i < particleCount; ++i) {
								attributeValue.push(snapshotStringList[reader.getUint32()]);
							}
							break;
						case 'float':
							attributeValue = [];
							for (let i = 0; i < particleCount; ++i) {
								attributeValue.push(reader.getFloat32());
							}
							break;
						default:
							attributeValue = null;
							console.error('Unknown snapshot attribute type', attributeType, snapshotAttribute, snapFile, particleCount);
							if (TESTING) {
								saveFile(new File([new Blob([snapBlock.datas])], 'snap_datas_' + snapBlock.length));
							}
					}
					const name = snapshotAttribute.getSubValueAsString('name');
					if (name) {
						snapShot.attributes[name] = attributeValue;
					}

				}
			}
			return snapShot;
		}
	}
	return Source2SnapshotLoader;
}());
