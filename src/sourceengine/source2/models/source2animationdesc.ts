import { quat, vec3 } from 'gl-matrix';
import { BinaryReader } from 'harmony-binary-reader';
import { DEBUG, TESTING } from '../../../buildoptions';
import { clamp, pow2 } from '../../../math/functions';
import { Kv3Element } from '../../common/keyvalue/kv3element';
import { decodeCCompressedDeltaVector3 } from '../animations/decoders/compresseddeltavector3';
import { Source2SeqGroup } from '../animations/source2seqgroup';
import { Source2Animation } from './source2animation';
import { Source2AnimeDecoder } from './source2animgroup';
import { Source2Model } from './source2model';

const Warning: Record<string, boolean> = {};
export class Source2AnimationDesc {
	#source2Model: Source2Model;
	#fps: number;
	#lastFrame: number = 0;
	data: Kv3Element;
	#animationResource: Source2Animation | Source2SeqGroup;
	#frameBlockArray: Kv3Element[] | null = null;
	#segmentReaders = new Map<Kv3Element, BinaryReader>;

	constructor(source2Model: Source2Model, data: Kv3Element, animationResource: Source2Animation | Source2SeqGroup) {
		this.#source2Model = source2Model;
		this.data = data;
		this.#animationResource = animationResource;
		this.#fps = data.getValueAsNumber('fps') ?? 30;

		const frameDatas = data.getValueAsElement('m_pData');
		if (frameDatas) {
			this.#lastFrame = (frameDatas.getValueAsNumber('m_nFrames') ?? 1) - 1;
			this.#frameBlockArray = frameDatas.getValueAsElementArray('m_frameblockArray');
		}
	}

	get fps(): number {
		return this.#getActualAnimDesc()?.fps ?? this.#fps;
	}

	get lastFrame(): number {
		return this.#getActualAnimDesc()?.lastFrame ?? this.#lastFrame;
	}

	#getActualAnimDesc(): Source2AnimationDesc | null {
		const fetch = this.data.getValueAsElement('m_fetch');
		if (fetch) {
			const localReferenceArray = fetch.getValueAsNumberArray('m_localReferenceArray');
			//TODO: mix multiple anims
			if (localReferenceArray && localReferenceArray[0] !== undefined && (this.#animationResource as Source2SeqGroup).localSequenceNameArray) {
				const animName = (this.#animationResource as Source2SeqGroup).localSequenceNameArray![localReferenceArray[0]];
				if (animName) {
					const animDesc = this.#source2Model.getAnimationByName(animName);
					if (animDesc) {
						return animDesc;
					}
				}
			}
		}
		return null;
	}


	getFrame(frameIndex: number): { name: string, Position: vec3, Angle: quat }/*TODO: fix type*/[] {
		frameIndex = clamp(frameIndex, 0, this.lastFrame);
		const frameBlockArray = this.#frameBlockArray;
		let segmentIndexArray = null;
		let frameBlock = null;
		const decodeKey = this.#animationResource.getDecodeKey();
		const decodeArray = this.#animationResource.getDecoderArray();
		const boneArray: { name: string, Position: vec3, Angle: quat }[] = [];
		const decodeKeyBoneArray = decodeKey?.getValueAsElementArray('m_boneArray');
		const decodeKeyDataChannelArray = decodeKey?.getValueAsElementArray('m_dataChannelArray');

		/*
		let fetch = this.data?.m_fetch;
		if (fetch) {
			let localReferenceArray = fetch.m_localReferenceArray;
			//TODO: mix multiple anims
			if (localReferenceArray[0] !== undefined) {
				let animName = this.animationResource.localSequenceNameArray[localReferenceArray[0]];
				if (animName) {
					//console.log(localReference);
					let animDesc = this.#source2Model.getAnimationByName(animName);
					if (animDesc) {
						return animDesc.getFrame(frameIndex);
					}
				}
				return [];
			}
		}*/
		const actualAnimDesc = this.#getActualAnimDesc();
		if (actualAnimDesc) {
			return actualAnimDesc.getFrame(frameIndex);
		}

		if (frameBlockArray && decodeArray && decodeKeyBoneArray && decodeKeyDataChannelArray) {
			for (const decodeKeyBone of decodeKeyBoneArray) {
				boneArray.push({
					name: decodeKeyBone.getValueAsString('m_name') ?? '',
					Position: vec3.create(),
					Angle: quat.create(),
				});
			}

			for (const frameBlock of frameBlockArray) {
				const startFrame = frameBlock.getValueAsNumber('m_nStartFrame') ?? 0;
				const endFrame = frameBlock.getValueAsNumber('m_nEndFrame') ?? 0;
				if ((startFrame <= frameIndex) && (endFrame >= frameIndex)) {
					segmentIndexArray = frameBlock.getValueAsNumberArray('m_segmentIndexArray');
					//console.log(this);
					//console.log(decodeKey);
					if (segmentIndexArray) {
						for (const segmentIndex of segmentIndexArray) {
							const segment = (this.#animationResource as Source2Animation).getSegment(segmentIndex);
							if (TESTING && !segment) {
								//console.error('missing segment : ', segmentIndexArray[j]);
								continue;
							}
							//console.log(frameIndex, frameIndex - frameBlock.m_nStartFrame);
							//console.log(frameIndex);
							if (segment) {
								this.#readSegment(frameIndex - startFrame, segment, boneArray, decodeKeyDataChannelArray, decodeArray);
							}
						}
					}
				}
			}
		}
		//console.log(boneArray);
		return boneArray;
	}

	#getReader(segment: Kv3Element, container: Uint8Array): BinaryReader {
		let reader = this.#segmentReaders.get(segment);
		if (!reader) {
			reader = new BinaryReader(segment.getValueAsBlob('m_container') ?? '');
			this.#segmentReaders.set(segment, reader);
		}
		return reader;
	}

	#readSegment(frameIndex: number, segment: Kv3Element, boneArray: any/*TODO: fix type*/[], dataChannelArray: Kv3Element[], decodeArray: Source2AnimeDecoder[]): void {
		//console.log(segment);
		const channel = dataChannelArray[segment.getValueAsNumber('m_nLocalChannel') ?? 0];
		if (!channel) {
			return;
		}
		const segmentToBoneIndex = new Map<number, number>();
		const channelVar = channel.getValueAsString('m_szVariableName');
		const container = segment.getValueAsBlob('m_container');
		if (!channelVar || !container || container.length < 8) {
			return;
		}

		const reader = this.#getReader(segment, container);//segment.dataReader;

		const decoderId = container[0]! + (container[1]! << 8);
		let bytesPerBone = container[2]! + (container[3]! << 8);
		const boneCount = container[4]! + (container[5]! << 8);
		const dataLength = container[6]! + (container[7]! << 8);
		bytesPerBone = 0;
		const segmentBoneArray = [];

		const elementIndexArray = channel.getValueAsNumberArray('m_nElementIndexArray');

		if (elementIndexArray) {
			for (let i = 0; i < elementIndexArray.length; i++) {
				segmentToBoneIndex.set(elementIndexArray[i]!, i);
			}
		} else {
			//TODO
			return;
		}

		const decoder = decodeArray[decoderId];
		if (!decoder) {
			return;
		}
		const decoderName = decoder.name;
		//console.log(decoderId, bytesPerBone, boneCount, dataLength);
		if (decoder && decoderName) {
			//console.log(decoderName);
			switch (decoderName) {
				case 'CCompressedStaticFullVector3':
					bytesPerBone = 12;
					frameIndex = 0;
					break;
				case 'CCompressedAnimQuaternion':
					bytesPerBone = 6;
					break;
				case 'CCompressedStaticVector3':
					bytesPerBone = 6;
					frameIndex = 0;
					break;
				case 'CCompressedFullVector3':
					bytesPerBone = 12;
					break;
				case 'CCompressedDeltaVector3':
					break;
				case 'CCompressedAnimVector3':
					bytesPerBone = 12;
					frameIndex = 0;
					//TODO
					break;
				case 'CCompressedFullFloat':
				case 'CCompressedStaticFloat':
					bytesPerBone = 4;
					frameIndex = 0;
					//TODO
					break;
				default:
					if (DEBUG && TESTING) {
						if (!Warning[decoderName]) {
							console.error('Warning: unknown decoder ' + decoderName + ' in ' + (this.#animationResource).file?.fileName);
							Warning[decoderName] = true;
						}
					}
					return;
			}

			var byteIndex = 8;
			for (var boneIndex = 0; boneIndex < boneCount; boneIndex++, byteIndex += 2) {
				segmentBoneArray.push(container[byteIndex + 0]!/*TODO: actually check value*/ + (container[byteIndex + 1]!/*TODO: actually check value*/ << 8));
			}

			var byteIndex = 8 + boneCount * 2 + frameIndex * boneCount * bytesPerBone;
			for (var boneIndex = 0; boneIndex < boneCount; boneIndex++) {
				const boneIndex2 = segmentToBoneIndex.get(segmentBoneArray[boneIndex]!/*TODO: actually check value*/);
				if (boneIndex2 === undefined) {//removeme
					continue;
				}
				const bytes: number[] = [];
				const byteIndex2 = byteIndex + boneIndex * bytesPerBone;
				for (let j = 0; j < bytesPerBone; j++) {
					bytes.push(container[byteIndex2 + j] ?? 0);
				}

				let tmpValue = null;
				switch (decoderName) {
					case 'CCompressedFullFloat':
					case 'CCompressedStaticFloat':
						tmpValue = getFloat32(bytes, 0);
						break;
					case 'CCompressedStaticFullVector3':
					case 'CCompressedFullVector3':
						//case 'CCompressedAnimVector3':
						var x = getFloat32(bytes, 0);
						var y = getFloat32(bytes, 4);
						var z = getFloat32(bytes, 8);
						tmpValue = vec3.fromValues(x, y, z);
						break;
					case 'CCompressedDeltaVector3':
						tmpValue = decodeCCompressedDeltaVector3(reader, boneCount, boneIndex, frameIndex);
						break;
					case 'CCompressedStaticVector3':
						var x = getFloat16(bytes, 0);
						var y = getFloat16(bytes, 2);
						var z = getFloat16(bytes, 4);
						tmpValue = vec3.fromValues(x, y, z);
						break;
					case 'CCompressedAnimQuaternion':
						tmpValue = readQuaternion48(bytes);
						break;
					default:
						if (DEBUG) {
							if (!Warning[decoderName]) {
								console.error('Warning: unknown decoder ' + decoderName + ' in ' + this.#animationResource.file?.fileName + ' for bone ' + boneArray[boneIndex2].name);
								Warning[decoderName] = true;
							}
						}
					//TODO
				}

				if (tmpValue && boneArray[boneIndex2]) {
					boneArray[boneIndex2][channelVar] = tmpValue;
				}

			}
		}
	}

	matchActivity(activityName: string): boolean {
		const activityArray = this.data.getValueAsElementArray('m_activityArray');
		if (activityArray) {
			for (const activity of activityArray) {
				if (activity.getValueAsString('m_name') == activityName) {
					return true;
				}
			}
		}
		return false;
	}

	/*
	getActivityName() {
		return this.data?.m_activityArray?.[0]?.m_name;
	}

	hasModifiers() {
		return this.data?.m_activityArray?.length > 1;
	}
	*/


	modifiersScore(activityName: string, modifiers: Set<string>) {
		const activityArray = this.data?.getSubValueAsElementArray('m_activityArray');
		if (activityArray && activityArray.length > 0) {
			if (activityArray[0]!.getSubValueAsString('m_name') != activityName) {
				return -1;
			}

			if (activityArray.length == 1 && modifiers.size == 0) {
				// We have no modifiers and activityArray only contains the activity
				return 1;
			}

			const matchingModifiers: Record<string, number> = {};
			for (const modifier of modifiers) {
				for (const activity of activityArray) {
					const name = activity.getSubValueAsString('m_name');
					if (activityName == name) {
						continue;
					}
					if (modifier == name) {
						matchingModifiers[modifier] = 1;
						break;
					}
				}
			}
			return Object.keys(matchingModifiers).length;
		}
		return -1;
	}

	matchModifiers(activityName: string, modifiers: Set<string>): boolean {
		const activityArray = this.data.getValueAsElementArray('m_activityArray');
		if (activityArray && activityArray.length > 0) {
			if (activityArray[0]!.getValueAsString('m_name') != activityName) {
				return false;
			}

			if (activityArray.length == 1 && modifiers.size == 0) {
				// We have no modifiers and activityArray only contains the activity
				return true;
			}

			if (activityArray.length - 1 != modifiers.size) {
				return false;
			}

			const matchingModifiers: Record<string, number> = {};
			for (const modifier of modifiers) {
				for (const activity of activityArray) {
					const name = activity.getSubValueAsString('m_name');
					if (activityName == name) {
						continue;
					}
					if (modifier == name) {
						matchingModifiers[modifier] = 1;
						break;
					}
				}
			}
			return (Object.keys(matchingModifiers).length == modifiers.size);
		}
		return false;
	}
}

function getFloat16(b: number[], offset: number) {//TODOv3: optimize this function
	const sign = b[1 + offset]! >> 7;
	const exponent = ((b[1 + offset]! & 0x7C) >> 2);
	const mantissa = ((b[1 + offset]! & 0x03) << 8) | b[0 + offset]!;

	if (exponent == 0) {
		return (sign ? -1 : 1) * Math.pow(2, -14) * (mantissa / Math.pow(2, 10));
	} else if (exponent == 0x1F) {
		return mantissa ? NaN : ((sign ? -1 : 1) * Infinity);
	}

	return (sign ? -1 : 1) * Math.pow(2, exponent - 15) * (1 + (mantissa / Math.pow(2, 10)));
}

function getFloat32(b: number[], offset: number) {//TODOv3: remove these functions or something
	const sign = 1 - (2 * (b[3 + offset]! >> 7)),
		exponent = (((b[3 + offset]! << 1) & 0xff) | (b[2 + offset]! >> 7)) - 127,
		mantissa = ((b[2 + offset]! & 0x7f) << 16) | (b[1 + offset]! << 8) | b[0 + offset]!;

	if (exponent === 128) {
		if (mantissa !== 0) {
			return NaN;
		} else {
			return sign * Infinity;
		}
	}

	if (exponent === -127) { // Denormalized
		return sign * mantissa * pow2(-126 - 23);
	}

	return sign * (1 + mantissa * pow2(-23)) * pow2(exponent);
}

const QUATERNION48_SCALE = Math.SQRT1_2 / 0x4000;
function readQuaternion48(bytes: number[]) {
	// Values
	const i1 = bytes[0]! + ((bytes[1]! & 127) << 8) - 0x4000;
	const i2 = bytes[2]! + ((bytes[3]! & 127) << 8) - 0x4000;
	const i3 = bytes[4]! + ((bytes[5]! & 127) << 8) - 0x4000;

	// Signs
	const s1 = bytes[1]! & 128;
	const s2 = bytes[3]! & 128;
	const s3 = bytes[5]! & 128;

	const x = QUATERNION48_SCALE * i1;
	const y = QUATERNION48_SCALE * i2;
	const z = QUATERNION48_SCALE * i3;

	let w = Math.sqrt(1 - (x * x) - (y * y) - (z * z));

	// Apply sign 3
	if (s3 == 128) {
		w *= -1;
	}
	if (TESTING) {
		if (s1 == 128 && s2 == 128 && s3 == 128) {
			//console.log(boneNameRemoveMe, bytes);
		}
	}
	// Apply sign 1 and 2
	if (s1 == 128) {
		return s2 == 128 ? quat.fromValues(y, z, w, x) : quat.fromValues(z, w, x, y);
	} else {
		return s2 == 128 ? quat.fromValues(w, x, y, z) : quat.fromValues(x, y, z, w);
	}
}
