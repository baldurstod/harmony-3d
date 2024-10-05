import { BinaryReader, TWO_POW_10, TWO_POW_MINUS_14 } from 'harmony-binary-reader';

import { SourceBinaryLoader } from '../../common/loaders/sourcebinaryloader.js';
import { SourceEngineVTF } from '../textures/sourceenginevtf.js';
import { DEBUG } from '../../../buildoptions.js';
import { IMAGE_FORMAT_NONE, IMAGE_FORMAT_RGBA8888, IMAGE_FORMAT_ABGR8888, IMAGE_FORMAT_RGB888, IMAGE_FORMAT_BGR888, IMAGE_FORMAT_RGB565, IMAGE_FORMAT_I8, IMAGE_FORMAT_IA88, IMAGE_FORMAT_P8, IMAGE_FORMAT_A8, IMAGE_FORMAT_RGB888_BLUESCREEN, IMAGE_FORMAT_BGR888_BLUESCREEN, IMAGE_FORMAT_ARGB8888, IMAGE_FORMAT_BGRA8888, IMAGE_FORMAT_DXT1, IMAGE_FORMAT_DXT3, IMAGE_FORMAT_DXT5, IMAGE_FORMAT_BGRX8888, IMAGE_FORMAT_BGR565, IMAGE_FORMAT_BGRX5551, IMAGE_FORMAT_BGRA4444, IMAGE_FORMAT_DXT1_ONEBITALPHA, IMAGE_FORMAT_BGRA5551, IMAGE_FORMAT_UV88, IMAGE_FORMAT_UVWQ8888, IMAGE_FORMAT_RGBA16161616F, IMAGE_FORMAT_RGBA16161616, IMAGE_FORMAT_UVLX8888 } from '../textures/sourceenginevtf.js';
import { MAX_IMAGES_PER_FRAME_ON_DISK, SEQUENCE_SAMPLE_COUNT, MAX_IMAGES_PER_FRAME_IN_MEMORY, SheetSequenceSample_t, GetInterpolationData } from './sheet.js';

export class SourceEngineVTFLoader extends SourceBinaryLoader {

	parse(repository, fileName, arrayBuffer) {
		let vtf = new SourceEngineVTF(repository, fileName);
		try {
			let reader = new BinaryReader(arrayBuffer);
			this.#parseHeader(reader, vtf);

			if (vtf.isHigherThan72()) {
				for (let i = 0; i < vtf.numResources; ++i) {
					vtf.resEntries.push({type:reader.getUint32(), resData:reader.getUint32()});
				}
			} else {
				if (vtf.lowResImageFormat==-1) {
					vtf.resEntries.push({type:48, resData:vtf.headerSize});
				} else {
					vtf.resEntries.push({type:1, resData:vtf.headerSize});
					if (vtf.lowResImageWidth ==0 && vtf.lowResImageHeight == 0) {
						vtf.resEntries.push({type:48, resData:vtf.headerSize});
					} else {
						vtf.resEntries.push({type:48, resData:vtf.headerSize + Math.max(2, vtf.lowResImageWidth * vtf.lowResImageHeight * 0.5)});// 0.5 bytes per pixel
					}
				}
			}
			if (vtf.isHigherThan72()) {
				reader.seek(vtf.headerSize);
			}
			this.#parseResEntries(reader, vtf);
		}
		catch(err) {
			if (DEBUG) {
				console.error(err);
			}
			return null;
		}
		return vtf;
	}

	#parseHeader(reader, vtf) {
		reader.seek(4); //skip first 4 char TODO: check == 'VTF\0' ?

		vtf.setVerionMaj(reader.getUint32());
		vtf.setVerionMin(reader.getUint32());
		vtf.headerSize = reader.getUint32();
		vtf.width = reader.getUint16();
		vtf.height = reader.getUint16();
		vtf.setFlags(reader.getUint32());
		vtf.frames = reader.getUint16();
		vtf.firstFrame = reader.getUint16();
		reader.seek(reader.tell() + 4);//padding
		vtf.reflectivity = reader.getVector3();
		reader.seek(reader.tell() + 4);//padding
		vtf.bumpmapScale = reader.getFloat32();
		vtf.highResImageFormat = reader.getInt32();
		vtf.mipmapCount = reader.getUint8();
		vtf.lowResImageFormat = reader.getInt32();
		vtf.lowResImageWidth = reader.getUint8();
		vtf.lowResImageHeight = reader.getUint8();

		if (vtf.isHigherThan71()) {
			vtf.depth = reader.getUint16();
		}
		if (vtf.isHigherThan72()) {
			reader.seek(reader.tell()+3);//padding
			vtf.numResources = reader.getUint32();
			reader.seek(reader.tell()+8);//padding
		}
	}

	#parseResEntries(reader, vtf) {
		const startOffset = reader.tell();

		for (let resIndex = 0; resIndex < vtf.resEntries.length; ++resIndex) {
			this.#parseResEntry(reader, vtf, vtf.resEntries[resIndex]);
		}
	}

	#parseResEntry(reader, vtf, entry) {
		switch (entry.type) {
			case 1: // Low-res image data
				//TODO
				break;
			case 48: // Image data
				//TODO
				if (vtf.mipmapCount>0) {
					this.#parseImageData(reader, vtf, entry);
				} else {
					console.error('vtf.mipmapCount == 0');
				}
				break;
			case 16: // sheet
				this.#parseSheet(reader, vtf, entry);
				break;
			case 37966403: // CRC
				break;
		}
	}

	#parseImageData(reader, vtf, entry) {
		reader.seek(entry.resData);
		let mipmapWidth = vtf.width*Math.pow(0.5, vtf.mipmapCount-1);
		let mipmapHeight = vtf.height*Math.pow(0.5, vtf.mipmapCount-1);
		entry.mipMaps = [];

		for (let mipmapIndex = 0; mipmapIndex < vtf.mipmapCount; ++mipmapIndex) {
			this.#parseMipMap(reader, vtf, entry, mipmapIndex, mipmapWidth, mipmapHeight);
			mipmapWidth *= 2;
			mipmapHeight *= 2;
		}
	}

	#parseSheet(reader, vtf, entry) {
		reader.seek(entry.resData);
		const sheet = Object.create(null);
		vtf.sheet = sheet;

		sheet.length = reader.getUint32();
		let nVersion = reader.getUint32();
		let nNumCoordsPerFrame = (nVersion) ? MAX_IMAGES_PER_FRAME_ON_DISK:1;

		let nNumSequences = reader.getUint32();
		sheet.sequences = [];
		let valuesCount = 16;
		if (sheet.format == 0) {//TODOv3 : where comes sheet.format ?
			valuesCount = 4;
		}

		//for (let groupIndex=0; groupIndex < sheet.groupsCount; ++groupIndex) {
		while (nNumSequences--) {
			const group = Object.create(null);
			group.duration = 0;
			group.m_pSamples = [];
			group.m_pSamples2 = [];
			sheet.sequences.push(group);
			let nSequenceNumber = reader.getUint32();
			group.clamp = reader.getUint32() != 0;
			group.frameCount = reader.getUint32();

			let bSingleFrameSequence = (group.frameCount == 1);
			let nTimeSamples = bSingleFrameSequence ? 1 : SEQUENCE_SAMPLE_COUNT;

			//let m_pSample = [];
			//sheet.m_pSamples[nSequenceNumber] = m_pSample;
			for (let i = 0; i < nTimeSamples; i++) {
				group.m_pSamples[i] = new SheetSequenceSample_t();
			}

			let Samples = [];
			for (let i = 0; i < SEQUENCE_SAMPLE_COUNT; i++) {
				Samples[i] = new SheetSequenceSample_t();
			}

			//group.frames = [];
			let fTotalSequenceTime = reader.getFloat32();
			let InterpKnot = new Float32Array(SEQUENCE_SAMPLE_COUNT);
			let InterpValue = new Float32Array(SEQUENCE_SAMPLE_COUNT);

			let fCurTime = 0.;
			for (let frameIndex = 0; frameIndex < group.frameCount; ++frameIndex) {
				const frameSample = new SheetSequenceSample_t();
				group.m_pSamples2.push(frameSample);
				//const frame = Object.create(null);
				//group.frames.push(frame);
				//frame.values = [];
				//frame.duration = reader.getFloat32();
				let fThisDuration = reader.getFloat32();
				InterpValue[ frameIndex ] = frameIndex;
				InterpKnot [ frameIndex ] = SEQUENCE_SAMPLE_COUNT * (fCurTime / fTotalSequenceTime);
				fCurTime += fThisDuration;
				group.duration += fThisDuration//frame.duration;

				/*for (let i = 0; i < valuesCount; ++i) {
					frame.values.push(reader.getFloat32());
				}*/
				let seq = Samples[frameIndex];
				for(let nImage = 0 ; nImage < nNumCoordsPerFrame; nImage++) {
					let s = seq.m_TextureCoordData[nImage];
					let s2 = frameSample.m_TextureCoordData[nImage];
					if (s) {
						s.m_fLeft_U0	= reader.getFloat32();
						s.m_fTop_V0		= reader.getFloat32();
						s.m_fRight_U0	= reader.getFloat32();
						s.m_fBottom_V0	= reader.getFloat32();

						if (s2) {
							s2.m_fLeft_U0 = s.m_fLeft_U0;
							s2.m_fTop_V0 = s.m_fTop_V0;
							s2.m_fRight_U0 = s.m_fRight_U0;
							s2.m_fBottom_V0 = s.m_fBottom_V0;
						}
					} else {
						//drop it ?
						reader.getFloat32();
						reader.getFloat32();
						reader.getFloat32();
						reader.getFloat32();
					}
				}
			}
			group.duration += fCurTime;

			// now, fill in the whole table
			for (let nIdx = 0; nIdx < nTimeSamples; ++nIdx) {
				//float flIdxA, flIdxB, flInterp;
				let result = GetInterpolationData(InterpKnot, InterpValue, group.frameCount,
									SEQUENCE_SAMPLE_COUNT,
									nIdx,
									!group.clamp/*,
									&flIdxA, &flIdxB, &flInterp */);
				let sA = Samples[result.pValueA];
				let sB = Samples[result.pValueB];
				let oseq = group.m_pSamples[nIdx];

				oseq.m_fBlendFactor = result.pInterpolationValue;
				for(let nImage = 0 ; nImage< MAX_IMAGES_PER_FRAME_IN_MEMORY; nImage++) {
					let src0=sA.m_TextureCoordData[nImage];
					let src1=sB.m_TextureCoordData[nImage];
					let o=oseq.m_TextureCoordData[nImage];
					o.m_fLeft_U0 = src0.m_fLeft_U0;
					o.m_fTop_V0	= src0.m_fTop_V0;
					o.m_fRight_U0 = src0.m_fRight_U0;
					o.m_fBottom_V0 = src0.m_fBottom_V0;
					o.m_fLeft_U1 = src1.m_fLeft_U0;
					o.m_fTop_V1	= src1.m_fTop_V0;
					o.m_fRight_U1 = src1.m_fRight_U0;
					o.m_fBottom_V1 = src1.m_fBottom_V0;
				}
			}
		}
	}

	#parseMipMap(reader, vtf, entry, mipmaplvl, mipmapWidth, mipmapHeight) {
		//TODO: frame face, zlice
		let startingByte = reader.tell();

		// Mipmap minimum size is 1*1 px
		mipmapWidth = Math.max(1.0, vtf.width*Math.pow(0.5, vtf.mipmapCount-mipmaplvl-1));
		mipmapHeight = Math.max(1.0, vtf.height*Math.pow(0.5, vtf.mipmapCount-mipmaplvl-1));

		const mipmap = {width:mipmapWidth, height:mipmapHeight, frames:[]};
		entry.mipMaps.push(mipmap);


		let faceIndex;
		let face;
		for (let frameIndex=0; frameIndex < vtf.frames; ++frameIndex) {
			let frame = [];
			mipmap.frames.push(frame);
			for (faceIndex=0; faceIndex<vtf.faceCount; faceIndex++) {
				if (vtf.faceCount==1) {
					face = [];
				} else {
					face = [];
				}
				face = frame;

				let entrySize;
				let s;
				switch (vtf.highResImageFormat) {
					case IMAGE_FORMAT_ABGR8888://1
						entrySize = mipmapWidth * mipmapHeight * 4; // 4 byte per pixel
						face.push(str2abABGR(reader, startingByte, entrySize));
						startingByte += entrySize;
						reader.skip(entrySize);
						break;
					case IMAGE_FORMAT_RGB888_BLUESCREEN:
					case IMAGE_FORMAT_BGR888_BLUESCREEN:
						entrySize = mipmapWidth * mipmapHeight * 2; // 2 byte per pixel
						face.push(str2ab(reader, startingByte, entrySize));
						startingByte += entrySize;
						reader.skip(entrySize);
						break;
					case IMAGE_FORMAT_RGB888:
						entrySize = mipmapWidth * mipmapHeight * 3; // 3 byte per pixel
						face.push(str2ab(reader, startingByte, entrySize));
						startingByte += entrySize;
						reader.skip(entrySize);
						break;
					case IMAGE_FORMAT_BGR888:
						entrySize = mipmapWidth * mipmapHeight * 3; // 3 byte per pixel
						s = reader.getString(entrySize);
						face.push(str2abBGR(s));
						break;
					case IMAGE_FORMAT_RGBA8888:
						entrySize = mipmapWidth * mipmapHeight * 4; // 4 byte per pixel
						face.push(str2ab(reader, startingByte, entrySize));
						startingByte += entrySize;
						reader.skip(entrySize);
						break;
					case IMAGE_FORMAT_BGRA8888:
						entrySize = mipmapWidth * mipmapHeight * 4; // 4 byte per pixel
						s = reader.getString(entrySize);
						face.push(str2abBGRA(s));
						break;
					case IMAGE_FORMAT_DXT1:
						entrySize = Math.max(mipmapWidth * mipmapHeight * 0.5, 8); // 0.5 byte per pixel
						face.push(str2ab(reader, startingByte, entrySize));
						startingByte += entrySize;
						reader.skip(entrySize);
						break;
					case IMAGE_FORMAT_DXT3:
						entrySize = Math.max(mipmapWidth * mipmapHeight, 16); // 1 byte per pixel
						face.push(str2ab(reader, startingByte, entrySize));
						startingByte += entrySize;
						reader.skip(entrySize);
						break;
					case IMAGE_FORMAT_DXT5:
						entrySize = Math.max(mipmapWidth, 4) * Math.max(mipmapHeight, 4); // 1 byte per pixel
						face.push(str2ab(reader, startingByte, entrySize));
						startingByte += entrySize;
						reader.skip(entrySize);
						break;
					case IMAGE_FORMAT_RGBA16161616F:
						entrySize = mipmapWidth * mipmapHeight * 8; // 8 bytes per pixel
						s = reader.getString(entrySize);
						face.push(str2abRGBA16F(s));
						break;
				}
			}
		}
	}
}

function str2abRGBA16F(str) {
	let len = str.length / 2;
	const buf = new ArrayBuffer(str.length * 2);
	const bufView = new Float32Array(buf);
	let j;
	for (let i = 0; i < len; ++i) {
		j = i * 2;
		bufView[i] = float16(str.charCodeAt(j + 0), str.charCodeAt(j + 1));//(str.charCodeAt(i+0) + str.charCodeAt(i+1)*256);
	}
	return bufView;
}

function float16(byte1, byte2){
	const b = new Uint8Array([byte1, byte2]);

	let sign = b[1] >> 7;
	let exponent = ((b[1] & 0x7C) >> 2);
	let mantissa = ((b[1] & 0x03) << 8) | b[0];


	if(exponent == 0) {
		return (sign ? -1 : 1) * TWO_POW_MINUS_14 * (mantissa / TWO_POW_10);
	} else if (exponent == 0x1F) {
		return mantissa ? NaN : ((sign ? -1 : 1) * Infinity);
	}

	return (sign?-1:1) * Math.pow(2, exponent-15) * (1+(mantissa/TWO_POW_10));
}

function str2ab(reader, start, length) {
	return new Uint8Array(reader.buffer.slice(start, start + length));
}

function str2abBGR(str) {
// assume str.length is divisible by 3
	const buf = new ArrayBuffer(str.length);
	const bufView = new Uint8Array(buf);
	for (let i = 0, strLen = str.length; i < strLen; i += 3) {
		bufView[i	] = str.charCodeAt(i+2);
		bufView[i+1] = str.charCodeAt(i+1);
		bufView[i+2] = str.charCodeAt(i	);
	}
	return bufView;
}

function str2abBGRA(str) {
// assume str.length is divisible by 4
	const buf = new ArrayBuffer(str.length);
	const bufView = new Uint8Array(buf);
	for (let i = 0, strLen = str.length; i < strLen; i += 4) {
		bufView[i	] = str.charCodeAt(i+2);
		bufView[i+1] = str.charCodeAt(i+1);
		bufView[i+2] = str.charCodeAt(i	);
		bufView[i+3] = str.charCodeAt(i+3);
	}
	return bufView;
}

function str2abARGB(str) {
// assume str.length is divisible by 4
	const buf = new ArrayBuffer(str.length);
	const bufView = new Uint8Array(buf);
	for (let i = 0, strLen = str.length; i < strLen; i += 4) {
		bufView[i	] = str.charCodeAt(i+1);
		bufView[i+1] = str.charCodeAt(i+2);
		bufView[i+2] = str.charCodeAt(i+3);
		bufView[i+3] = str.charCodeAt(i	);
	}
	return bufView;
}
/*
function str2abABGR(reader, start, length) {
// assume str.length is divisible by 4
	const buf = new ArrayBuffer(str.length);
	const bufView = new Uint8Array(buf);
	for (let i = 0, strLen = str.length; i < strLen; i += 4) {
		bufView[i	] = str.charCodeAt(i+3);
		bufView[i+1] = str.charCodeAt(i+2);
		bufView[i+2] = str.charCodeAt(i+1);
		bufView[i+3] = str.charCodeAt(i	);
	}
	return bufView;
}*/

function str2abABGR(reader, start, length) {
	let arr =	new Uint8Array(reader.buffer.slice(start, start + length));
	for (let i = 0; i < length; i += 4) {
		let a = arr[i	];
		arr[i	] = arr[i+1];
		arr[i+1] = arr[i+2];
		arr[i+2] = arr[i+2]
		arr[i+3] = a;
	}
	return arr;
}

function ab2str(arrayBuf) {
	return String.fromCharCode.apply(null, arrayBuf);
}
