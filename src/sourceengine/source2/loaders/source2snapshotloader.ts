import { SaveFile } from 'harmony-browser-utils';
import { BinaryReader } from 'harmony-binary-reader';

import { Source2FileLoader } from './source2fileloader';
import { Source2Snapshot } from '../particles/source2snapshot';
import { LOG, DEBUG, ERROR, TESTING } from '../../../buildoptions';

export const Source2SnapshotLoader = new (function () {
	class Source2SnapshotLoader {

		async load(repository, fileName) {
			fileName = fileName.replace(/.vsnap_c/, '').replace(/.vsnap/, '');
			let snapFile = await new Source2FileLoader(true).load(repository, fileName + '.vsnap_c');
			if (snapFile) {
				return this.loadSnapshot(snapFile);
			} else {
				if (ERROR) {
					console.error('Error loading snapshot', repository, fileName);
				}
				return null;
			}
		}

		loadSnapshot(snapFile) {
			let snapShot = new Source2Snapshot();
			snapShot.file = snapFile;

			let dataBlock = snapFile.getBlockByType('DATA');
			let snapBlock = snapFile.getBlockByType('SNAP');
			if (dataBlock && snapBlock) {
				if (LOG) {
					console.log(dataBlock);
					console.log(snapBlock);
				}
				let particleCount = Number(dataBlock.getKeyValue('num_particles'));
				snapShot.setParticleCount(particleCount);
				let snapshotAttributes = dataBlock.getKeyValue('attributes') ?? [];
				let snapshotStringList = dataBlock.getKeyValue('string_list') ?? [];

				let reader = new BinaryReader(snapBlock.datas);
				let attributeValue;
				let bones;
				let weights;
				for (let snapshotAttribute of snapshotAttributes) {
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
								let skinning = Object.create(null);
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
								SaveFile(new File([new Blob([snapBlock.datas])], 'snap_datas_' + snapBlock.length));
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
