import { Source2Activity } from './source2activity';
import { Source2Sequence } from './source2sequence';
import { Source2Animation } from '../models/source2animation';
import { Source2AnimationDesc } from '../models/source2animationdesc';
import { Source2AnimGroup } from '../models/source2animgroup';

export class Source2SeqGroup {
	#animNames = new Map<string, Source2AnimationDesc>();
	#animGroup: Source2AnimGroup;
	#localSequenceNameArray;
	sequences = [];
	file;
	m_localS1SeqDescArray;
	animArray;
	loaded = false;

	constructor(animGroup: Source2AnimGroup) {
		this.#animGroup = animGroup;
	}

	setFile(sourceFile) {
		this.file = sourceFile;


		const sequenceGroupResourceData_t = sourceFile.getBlockStruct('DATA.structs.SequenceGroupResourceData_t');
		let localSequenceNameArray;
		if (sequenceGroupResourceData_t) {
			this.m_localS1SeqDescArray = sequenceGroupResourceData_t.m_localS1SeqDescArray;
			localSequenceNameArray = sequenceGroupResourceData_t.m_localSequenceNameArray;
		} else {
			this.m_localS1SeqDescArray = sourceFile.getBlockStruct('DATA.keyValue.root.m_localS1SeqDescArray') ?? sourceFile.getBlockStruct('ASEQ.keyValue.root.m_localS1SeqDescArray');
			localSequenceNameArray = sourceFile.getBlockStruct('DATA.keyValue.root.m_localSequenceNameArray') ?? sourceFile.getBlockStruct('ASEQ.keyValue.root.m_localSequenceNameArray');
		}
		this.#localSequenceNameArray = localSequenceNameArray;


		this.#processSeqDesc(this.m_localS1SeqDescArray, localSequenceNameArray);

		this.animArray = this.m_localS1SeqDescArray;

		if (this.animArray) {
			for (let i = 0; i < this.animArray.length; i++) {
				const anim = this.animArray[i];
				this.#animNames.set(anim.m_sName, new Source2AnimationDesc(this.#animGroup.source2Model, anim, this));
			}
		}

		const anims = sourceFile.getBlockStruct('DATA.keyValue.root') ?? sourceFile.getBlockStruct('DATA.structs.SequenceGroupResourceData_t');
		if (anims) {
			const loadedAnim = new Source2Animation(this, '');
			loadedAnim.setAnimDatas(anims);
			this.#animGroup._changemyname = this.#animGroup._changemyname || [];
			this.#animGroup._changemyname.push(loadedAnim);
		}

		this.loaded = true;
	}

	getAnimDesc(name: string): Source2AnimationDesc | undefined {
		return this.#animNames.get(name);
	}

	#processSeqDesc(m_localS1SeqDescArray, localSequenceNameArray) {
		if (m_localS1SeqDescArray) {
			for (let i = 0; i < m_localS1SeqDescArray.length; ++i) {
				const sequence = m_localS1SeqDescArray[i];
				const activities = [];
				if (sequence.m_activityArray) {
					for (let j = 0; j < sequence.m_activityArray.length; ++j) {
						const activity = sequence.m_activityArray[j];
						activities.push(new Source2Activity(activity.m_name, activity.m_nWeight, activity.m_nFlags, activity.m_nActivity));
					}
				}

				const localReferenceArray = sequence?.m_fetch?.m_localReferenceArray;
				const animNames = [];
				if (localReferenceArray) {
					for (const localReference of localReferenceArray) {
						animNames.push(localSequenceNameArray[localReference]);
					}
				}

				const s2Seq = new Source2Sequence(sequence.m_sName, { activities: activities, animNames: animNames });
				//console.error(s2Seq);
				this.sequences.push(s2Seq);
			}
		}
	}

	matchActivity(activity, modifiers) {
		for (let i = 0; i < this.sequences.length; i++) {
			const sequence = this.sequences[i];
			if (sequence.matchActivity(activity, modifiers)) {
				return sequence.animNames[0];//TODO
			}
		}
		return null;
	}

	getAnimationsByActivity(activityName) {
		const anims = [];
		for (const [animName, animDesc] of this.#animNames) {
			if (animDesc.matchActivity(activityName)) {
				anims.push(animDesc);
			}
		}
		return anims;
	}

	getDecodeKey() {
		return this.#animGroup.getDecodeKey();
	}

	getDecoderArray() {
		return this.#animGroup.decoderArray;
	}

	get localSequenceNameArray() {
		return this.#localSequenceNameArray;
	}
}
