import { Kv3Element } from '../../common/keyvalue/kv3element';
import { Source2File } from '../loaders/source2file';
import { Source2Animation } from '../models/source2animation';
import { Source2AnimationDesc } from '../models/source2animationdesc';
import { Source2AnimGroup } from '../models/source2animgroup';
import { Source2Activity } from './source2activity';
import { Source2Sequence } from './source2sequence';

export class Source2SeqGroup {
	#animNames = new Map<string, Source2AnimationDesc>();
	#animGroup: Source2AnimGroup;
	#localSequenceNameArray;
	sequences: Source2Sequence[] = [];
	file;
	m_localS1SeqDescArray: Kv3Element[] | null = null;
	#animArray: Kv3Element[] | null = null;
	loaded = false;

	constructor(animGroup: Source2AnimGroup) {
		this.#animGroup = animGroup;
	}

	setFile(sourceFile: Source2File) {
		this.file = sourceFile;

		const sequenceGroupResourceData_t = sourceFile.getBlockStruct('DATA', 'structs.SequenceGroupResourceData_t'/*TODO: check that*/);
		let localSequenceNameArray: string[] | null;
		if (sequenceGroupResourceData_t) {
			this.m_localS1SeqDescArray = sequenceGroupResourceData_t.m_localS1SeqDescArray;
			localSequenceNameArray = sequenceGroupResourceData_t.m_localSequenceNameArray;
		} else {
			this.m_localS1SeqDescArray = sourceFile.getBlockStructAsElementArray('DATA', 'm_localS1SeqDescArray') ?? sourceFile.getBlockStructAsElementArray('ASEQ', 'm_localS1SeqDescArray');
			localSequenceNameArray = sourceFile.getBlockStructAsStringArray('DATA', 'm_localSequenceNameArray') ?? sourceFile.getBlockStructAsStringArray('ASEQ', 'm_localSequenceNameArray');
		}
		this.#localSequenceNameArray = localSequenceNameArray;


		if (this.m_localS1SeqDescArray && localSequenceNameArray) {
			this.#processSeqDesc(this.m_localS1SeqDescArray, localSequenceNameArray);
		}

		this.#animArray = this.m_localS1SeqDescArray;

		if (this.#animArray) {
			for (let i = 0; i < this.#animArray.length; i++) {
				const anim = this.#animArray[i];
				const animName = anim.getValueAsString('m_sName');
				if (animName) {
					this.#animNames.set(animName, new Source2AnimationDesc(this.#animGroup.source2Model, anim, this));
				}
			}
		}

		const anims = sourceFile.getBlockKeyValues('DATA');// ?? sourceFile.getBlockStruct('DATA', ''/*.structs.SequenceGroupResourceData_t'*/);
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

	#processSeqDesc(m_localS1SeqDescArray: Kv3Element[], localSequenceNameArray: string[]) {
		for (const sequence of m_localS1SeqDescArray) {
			//const sequence = m_localS1SeqDescArray[i];
			const activities = [];
			const activityArray = sequence.getValueAsElementArray('m_activityArray');
			const sequenceName = sequence.getValueAsString('m_sName');
			if (!sequenceName) {
				continue;
			}
			if (activityArray) {
				for (const activity of activityArray) {
					//const activity = activityArray[j];
					const name = activity.getValueAsString('m_name') ?? '';
					const weight = activity.getValueAsNumber('m_nWeight') ?? 0;
					const flags = activity.getValueAsNumber('m_nFlags') ?? 0;
					const act = activity.getValueAsNumber('m_nActivity') ?? 0;

					activities.push(new Source2Activity(name, weight, flags, act));
				}
			}

			const localReferenceArray = sequence.getSubValueAsNumberArray('m_fetch.m_localReferenceArray')//?.m_fetch?.m_localReferenceArray;
			const animNames = [];
			if (localReferenceArray) {
				for (const localReference of localReferenceArray) {
					animNames.push(localSequenceNameArray[localReference]);
				}
			}

			const s2Seq = new Source2Sequence(sequenceName, { activities: activities, animNames: animNames });
			//console.error(s2Seq);
			this.sequences.push(s2Seq);
		}
	}

	matchActivity(activity: string, modifiers: string[]) {
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
