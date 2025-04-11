import { quat, vec3 } from 'gl-matrix';
import { BinaryReader } from 'harmony-binary-reader';
import { decodeCCompressedDeltaVector3 } from '../animations/decoders/compresseddeltavector3';
import { clamp, pow2 } from '../../../math/functions';
import { DEBUG, TESTING } from '../../../buildoptions';
import { Source2Model } from './source2model';

const Warning = {};
export class Source2AnimationDesc {
	#source2Model: Source2Model;
	#fps = 30;
	#lastFrame = 0;
	data;
	animationResource;
	frameBlockArray;

	constructor(source2Model, data, animationResource) {
		this.#source2Model = source2Model;
		this.data = data;
		this.animationResource = animationResource;
		this.frameBlockArray = null;
		if (data) {
			this.#fps = data.fps ?? 30;
			if (data.m_pData) {
				this.#lastFrame = data.m_pData.m_nFrames - 1;
				this.frameBlockArray = data.m_pData.m_frameblockArray;
			}
		}
	}

	get fps() {
		return this.#getActualAnimDesc()?.fps ?? this.#fps;
	}

	get lastFrame() {
		return this.#getActualAnimDesc()?.lastFrame ?? this.#lastFrame;
	}

	#getActualAnimDesc(): Source2AnimationDesc {
		let fetch = this.data?.m_fetch;
		if (fetch) {
			let localReferenceArray = fetch.m_localReferenceArray;
			//TODO: mix multiple anims
			if (localReferenceArray[0] !== undefined) {
				let animName = this.animationResource.localSequenceNameArray[localReferenceArray[0]];
				if (animName) {
					let animDesc = this.#source2Model.getAnimationByName(animName);
					if (animDesc) {
						return animDesc;
					}
				}
			}
		}
	}


	getFrame(frameIndex) {
		frameIndex = clamp(frameIndex, 0, this.lastFrame);
		var frameBlockArray = this.frameBlockArray;
		var segmentIndexArray = null;
		var frameBlock = null;
		var decodeKey = this.animationResource.getDecodeKey();
		var decodeArray = this.animationResource.getDecoderArray();
		var boneArray = [];

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
		let actualAnimDesc = this.#getActualAnimDesc();
		if (actualAnimDesc) {
			return actualAnimDesc.getFrame(frameIndex);
		}

		if (frameBlockArray && decodeArray && decodeKey && decodeKey.m_boneArray) {
			for (var i = 0; i < decodeKey.m_boneArray.length; i++) {
				boneArray.push({ name: decodeKey.m_boneArray[i].m_name });
			}


			for (var i = 0; i < frameBlockArray.length; i++) {
				frameBlock = frameBlockArray[i];
				if ((frameBlock.m_nStartFrame <= frameIndex) && (frameBlock.m_nEndFrame >= frameIndex)) {
					segmentIndexArray = frameBlock.m_segmentIndexArray;
					//console.log(this);
					//console.log(decodeKey);
					for (var j = 0; j < segmentIndexArray.length; j++) {
						var segment = this.animationResource.getSegment(segmentIndexArray[j]);
						if (TESTING && !segment) {
							//console.error('missing segment : ', segmentIndexArray[j]);
							continue;
						}
						//console.log(frameIndex, frameIndex - frameBlock.m_nStartFrame);
						//console.log(frameIndex);
						this.readSegment(frameIndex - frameBlock.m_nStartFrame, segment, boneArray, decodeKey.m_dataChannelArray, decodeArray);
					}
				}
			}
		}
		//console.log(boneArray);
		return boneArray;
	}
	readSegment(frameIndex, segment, boneArray, dataChannelArray, decodeArray) {
		//console.log(segment);
		var channel = dataChannelArray[segment.m_nLocalChannel];
		var segmentToBoneIndex = {};
		var channelVar = channel.m_szVariableName;
		var container = segment.m_container;
		var reader = segment.dataReader;
		if (!reader) {
			reader = new BinaryReader(container);
			segment.dataReader = reader;
		}

		var decoderId = container[0] + (container[1] << 8);
		var bytesPerBone = container[2] + (container[3] << 8);
		var boneCount = container[4] + (container[5] << 8);
		var dataLength = container[6] + (container[7] << 8);
		bytesPerBone = 0;
		var segmentBoneArray = [];

		if (channel.m_nElementIndexArray) {
			var elementIndexArray = channel.m_nElementIndexArray;
			for (var i = 0; i < elementIndexArray.length; i++) {
				segmentToBoneIndex[elementIndexArray[i]] = i;
			}
		} else {
			//TODO
			return;
		}

		var decoder = decodeArray[decoderId];
		//console.log(decoderId, bytesPerBone, boneCount, dataLength);
		if (decoder && decoder.m_szName) {
			var decoderName = decoder.m_szName;
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
							console.error('Warning: unknown decoder ' + decoderName + ' in ' + this.animationResource.fileName);
							Warning[decoderName] = true;
						}
					}
					return;
			}

			var byteIndex = 8;
			for (var boneIndex = 0; boneIndex < boneCount; boneIndex++, byteIndex += 2) {
				segmentBoneArray.push(container[byteIndex + 0] + (container[byteIndex + 1] << 8));
			}

			var byteIndex = 8 + boneCount * 2 + frameIndex * boneCount * bytesPerBone;
			for (var boneIndex = 0; boneIndex < boneCount; boneIndex++) {
				var boneIndex2 = segmentToBoneIndex[segmentBoneArray[boneIndex]];
				/*if (boneIndex2 === undefined) {//removeme
					return;
				}*/
				var bytes = [];
				var byteIndex2 = byteIndex + boneIndex * bytesPerBone;
				for (var j = 0; j < bytesPerBone; j++) {
					bytes.push(container[byteIndex2 + j]);
				}

				var tmpValue = null;
				switch (decoderName) {
					case 'CCompressedFullFloat':
					case 'CCompressedStaticFloat':
						tmpValue = _getFloat32(bytes, 0);
						break;
					case 'CCompressedStaticFullVector3':
					case 'CCompressedFullVector3':
						//case 'CCompressedAnimVector3':
						var x = _getFloat32(bytes, 0);
						var y = _getFloat32(bytes, 4);
						var z = _getFloat32(bytes, 8);
						tmpValue = vec3.fromValues(x, y, z);
						break;
					case 'CCompressedDeltaVector3':
						tmpValue = decodeCCompressedDeltaVector3(reader, boneCount, boneIndex, frameIndex);
						break;
					case 'CCompressedStaticVector3':
						var x = _getFloat16(bytes, 0);
						var y = _getFloat16(bytes, 2);
						var z = _getFloat16(bytes, 4);
						tmpValue = vec3.fromValues(x, y, z);
						break;
					case 'CCompressedAnimQuaternion':
						tmpValue = _readQuaternion48(bytes, boneIndex2, boneArray[boneIndex2]?.name);
						break;
					default:
						if (DEBUG) {
							if (!Warning[decoderName]) {
								console.error('Warning: unknown decoder ' + decoderName + ' in ' + this.animationResource.fileName + ' for bone ' + boneArray[boneIndex2].name);
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

	matchActivity(activityName) {
		let activityArray = this.data?.m_activityArray;
		if (activityArray) {
			for (let activity of activityArray) {
				if (activity.m_name == activityName) {
					return true;
				}
			}
		}
	}

	getActivityName() {
		return this.data?.m_activityArray?.[0]?.m_name;
	}

	hasModifiers() {
		return this.data?.m_activityArray?.length > 1;
	}


	modifiersScore(activityName, modifiers) {
		let activityArray = this.data?.m_activityArray;
		if (activityArray && activityArray.length > 0) {
			if (activityArray[0].m_name != activityName) {
				return -1;
			}

			if (activityArray.length == 1 && modifiers.size == 0) {
				// We have no modifiers and activityArray only contains the activity
				return 1;
			}

			const matchingModifiers = {};
			for (const modifier of modifiers) {
				for (const activity of activityArray) {
					if (activityName == activity.m_name) {
						continue;
					}
					if (modifier == activity.m_name) {
						matchingModifiers[modifier] = 1;
						break;
					}
				}
			}
			return Object.keys(matchingModifiers).length;
		}
		return -1;
	}

	matchModifiers(activityName, modifiers) {
		let activityArray = this.data?.m_activityArray;
		if (activityArray && activityArray.length > 0) {
			if (activityArray[0].m_name != activityName) {
				return false;
			}

			if (activityArray.length == 1 && modifiers.size == 0) {
				// We have no modifiers and activityArray only contains the activity
				return true;
			}

			if (activityArray.length - 1 != modifiers.size) {
				return false;
			}

			const matchingModifiers = {};
			for (const modifier of modifiers) {
				for (const activity of activityArray) {
					if (activityName == activity.m_name) {
						continue;
					}
					if (modifier == activity.m_name) {
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




function _getFloat16(b, offset) {//TODOv3: optimize this function
	var sign = b[1 + offset] >> 7;
	var exponent = ((b[1 + offset] & 0x7C) >> 2);
	var mantissa = ((b[1 + offset] & 0x03) << 8) | b[0 + offset];

	if (exponent == 0) {
		return (sign ? -1 : 1) * Math.pow(2, -14) * (mantissa / Math.pow(2, 10));
	} else if (exponent == 0x1F) {
		return mantissa ? NaN : ((sign ? -1 : 1) * Infinity);
	}

	return (sign ? -1 : 1) * Math.pow(2, exponent - 15) * (1 + (mantissa / Math.pow(2, 10)));
}
function _getFloat32(b, offset) {//TODOv3: remove these functions or something
	let sign = 1 - (2 * (b[3 + offset] >> 7)),
		exponent = (((b[3 + offset] << 1) & 0xff) | (b[2 + offset] >> 7)) - 127,
		mantissa = ((b[2 + offset] & 0x7f) << 16) | (b[1 + offset] << 8) | b[0 + offset];

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

let QUATERNION48_SCALE = Math.SQRT1_2 / 0x4000;
function _readQuaternion48(bytes, boneIndexRemoveMe, boneNameRemoveMe) {
	// Values
	let i1 = bytes[0] + ((bytes[1] & 127) << 8) - 0x4000;
	let i2 = bytes[2] + ((bytes[3] & 127) << 8) - 0x4000;
	let i3 = bytes[4] + ((bytes[5] & 127) << 8) - 0x4000;

	// Signs
	let s1 = bytes[1] & 128;
	let s2 = bytes[3] & 128;
	let s3 = bytes[5] & 128;

	let x = QUATERNION48_SCALE * i1;
	let y = QUATERNION48_SCALE * i2;
	let z = QUATERNION48_SCALE * i3;

	let w = Math.sqrt(1 - (x * x) - (y * y) - (z * z));

	// Apply sign 3
	if (s3 == 128) {
		w *= -1;
	}
	if (TESTING) {
		if (s1 == 128 && s2 == 128 && s3 == 128) {
			//console.log(boneNameRemoveMe, bytes);
		}
		if (boneNameRemoveMe == 'left_hook3_0') {
			//console.log(boneNameRemoveMe, s1, s2, s3, bytes);
		}
	}
	// Apply sign 1 and 2
	if (s1 == 128) {
		return s2 == 128 ? quat.fromValues(y, z, w, x) : quat.fromValues(z, w, x, y);
	} else {
		return s2 == 128 ? quat.fromValues(w, x, y, z) : quat.fromValues(x, y, z, w);
	}
}
