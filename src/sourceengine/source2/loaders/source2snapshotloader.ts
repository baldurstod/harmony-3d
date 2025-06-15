import { saveFile } from 'harmony-browser-utils';
import { BinaryReader } from 'harmony-binary-reader';
import { Source2FileLoader } from './source2fileloader';
import { Source2Snapshot } from '../particles/source2snapshot';
import { LOG, DEBUG, ERROR, TESTING } from '../../../buildoptions';
import { Source2File } from './source2file';

export const Source2SnapshotLoader = new (function () {
	class Source2SnapshotLoader {

		async load(repository: string, filename: string) {
			filename = filename.replace(/.vsnap_c/, '').replace(/.vsnap/, '');
			const snapFile = await new Source2FileLoader(true).load(repository, filename + '.vsnap_c');
			if (snapFile) {
				return this.loadSnapshot(snapFile as Source2File);
			} else {
				if (ERROR) {
					console.error('Error loading snapshot', repository, filename);
				}
				return null;
			}
		}

		loadSnapshot(snapFile: Source2File) {
			const snapShot = new Source2Snapshot();
			snapShot.file = snapFile;

			const dataBlock = snapFile.getBlockByType('DATA');
			const snapBlock = snapFile.getBlockByType('SNAP');
			if (dataBlock && snapBlock) {
				if (LOG) {
					console.log(dataBlock);
					console.log(snapBlock);
				}
				const particleCount = Number(dataBlock.getKeyValue('num_particles'));
				snapShot.setParticleCount(particleCount);
				const snapshotAttributes = dataBlock.getKeyValue('attributes') ?? [];
				const snapshotStringList = dataBlock.getKeyValue('string_list') ?? [];

				const reader = new BinaryReader(snapBlock.datas);
				let attributeValue;
				let bones;
				let weights;
				for (const snapshotAttribute of snapshotAttributes) {
					reader.seek(Number(snapshotAttribute.data_offset));
					switch (snapshotAttribute.type) {
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
								const skinning = Object.create(null);
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
							console.error('Unknow snapshot attribute type', snapshotAttribute.type, snapshotAttribute, snapFile, Number(snapshotAttribute.data_size) / particleCount);
							if (TESTING) {
								saveFile(new File([new Blob([snapBlock.datas])], 'snap_datas_' + snapBlock.length));
							}
					}
					snapShot.attributes[snapshotAttribute.name] = attributeValue;

				}
			}
			return snapShot;
		}
	}
	return Source2SnapshotLoader;
}());
