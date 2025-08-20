import { BinaryReader } from 'harmony-binary-reader';
import { decodeLz4 } from '../../../../utils/lz4';
import { VTEX_FLAG_CUBE_TEXTURE, VTEX_FORMAT_BGRA8888 } from '../../constants';
import { Source2SpriteSheet } from '../../textures/source2spritesheet';
import { Source2Texture, VtexImageFormat } from '../../textures/source2texture';
import { Source2VtexBlock } from '../source2fileblock';

export function loadDataVtex(reader: BinaryReader, block: Source2VtexBlock, file: Source2Texture) {
	const DATA_UNKNOWN = 0;
	const DATA_FALLBACK_BITS = 1;
	const DATA_SHEET = 2;
	const DATA_FILL_TO_POWER_OF_TWO = 3;
	const DATA_COMPRESSED_MIP_SIZE = 4;
	const DATA_CUBEMAP_RADIANCE = 5;
	reader.seek(block.offset);
	block.vtexVersion = reader.getUint16();
	block.flags = reader.getUint16();

	block.reflectivity = reader.getVector4();

	block.width = reader.getUint16();
	block.height = reader.getUint16();
	block.depth = reader.getUint16();
	file.setImageFormat(reader.getUint8());
	block.numMipLevels = reader.getUint8();
	block.picmip0Res = reader.getUint32();

	const extraDataOffset = reader.tell() + reader.getUint32();
	const extraDataCount = reader.getUint32();

	let nonPow2Width = 0;
	let nonPow2Height = 0;
	let compressedMips = null;//new Uint32Array(mips);

	if (extraDataCount) {
		/* read headers */
		const headers = [];
		for (let i = 0; i < extraDataCount; i++) {
			const h = {
				type: reader.getUint32(),
				offset: reader.tell() + reader.getUint32(),
				size: reader.getUint32(),
			};
			headers.push(h);
		}


		for (let i = 0; i < extraDataCount; i++) {
			const h = headers[i]!;
			const type = h.type;
			const offset = h.offset;
			const size = h.size;
			reader.seek(offset);

			switch (type) {
				case DATA_FALLBACK_BITS:
					reader.seek(offset + size);
					break;
				case DATA_FILL_TO_POWER_OF_TWO:
					const unk = reader.getUint16();
					const nw = reader.getUint16();
					const nh = reader.getUint16();
					if (nw > 0 && nh > 0 && block.width >= nw && block.height >= nh) {
						console.error('code me');
						nonPow2Width = nw;
						nonPow2Height = nh;
					}
					break;
				case DATA_COMPRESSED_MIP_SIZE:
					const unk1 = reader.getUint32();
					const unk2 = reader.getUint32();
					const mips = reader.getUint32();
					compressedMips = new Array(mips);// we can't upe pop() on a Uint32Array

					for (let i = 0; i < mips; i++) {
						compressedMips[i] = reader.getUint32();
					}
					console.warn(`compressed mips : ${unk1} ${unk2} ${mips}`, compressedMips);
					break;
				case DATA_SHEET:
					loadVtexSpriteSheet(reader, block, offset, size);
					/*if (TESTING) {
						SaveFile(new File([new Blob([reader.getBytes(size, offset)])], 'block_' + size + '_' + offset));
					}*/
					break;
				case DATA_CUBEMAP_RADIANCE:
					loadVtexCubemapRadiance(reader, block, offset, size);
					break;
				default:
					/*if (TESTING) {
						SaveFile(new File([new Blob([reader.getBytes(size, offset)])], 'block_' + size + '_' + offset));
					}*/
					console.error(`Unknown type : ${type}`);
			}
		}
	}

	loadDataVtexImageData(reader, file, block, compressedMips);
}

function loadDataVtexImageData(reader: BinaryReader, file: Source2Texture, block: Source2VtexBlock, compressedMips: number[] | null) {
	let faceCount = 1;
	if ((block.flags & VTEX_FLAG_CUBE_TEXTURE) == VTEX_FLAG_CUBE_TEXTURE) { // Handle cube texture
		faceCount = 6;
	}

	// Goto
	reader.seek(block.file.fileLength);
	let mipmapWidth = block.width * Math.pow(0.5, block.numMipLevels - 1);
	let mipmapHeight = block.height * Math.pow(0.5, block.numMipLevels - 1);
	block.imageData = [];

	// Only keep last (biggest) mipmap
	for (let mipmapIndex = 0; mipmapIndex < block.numMipLevels; mipmapIndex++) {
		// Todo : add frame support + depth support
		for (let faceIndex = 0; faceIndex < faceCount; faceIndex++) {
			const compressedLength = compressedMips?.pop() ?? null; //TODO: check how this actually works with depth / frames
			block.imageData[faceIndex] = getImage(reader, mipmapWidth, mipmapHeight, file.getVtexImageFormat(), compressedLength);
			if (false /*&& block.imageFormat == VTEX_FORMAT_BC4*/) {//TODOv3: removeme
				const str = block.imageData[faceIndex];
				if (str.length >= 512 * 512) {
					/*const buf = new ArrayBuffer(str.length);
					const bufView = new Uint8Array(buf);
					for (let i = 0, strLen = str.length; i < strLen; i ++) {
						bufView[i] = str.charCodeAt(i);
					}*/
					//SaveFile('vtex' + str.length, str);
				}
			}
		}
		mipmapWidth *= 2;
		mipmapHeight *= 2;
	}
}

function getImage(reader: BinaryReader, mipmapWidth: number, mipmapHeight: number, imageFormat: VtexImageFormat, compressedLength: number | null) {
	let entrySize = 0;
	switch (imageFormat) {
		case VtexImageFormat.Dxt1:
			entrySize = Math.max(mipmapWidth * mipmapHeight * 0.5, 8); // 0.5 byte per pixel
			break;
		case VtexImageFormat.Dxt5:
			entrySize = Math.max(mipmapWidth, 4) * Math.max(mipmapHeight, 4); // 1 byte per pixel
			break;
		case VtexImageFormat.R8:
			entrySize = Math.max(mipmapWidth, 1) * Math.max(mipmapHeight, 1); // 1 byte per pixel;
			break;
		case VtexImageFormat.R8G8B8A8Uint:
		case VtexImageFormat.BGRA8888:
			// 4 bytes per pixel
			entrySize = mipmapWidth * mipmapHeight * 4;
			break;
		case VtexImageFormat.PngR8G8B8A8Uint:
		case VtexImageFormat.PngDXT5:
			entrySize = reader.byteLength - reader.tell();
			/*
			const a = reader.tell();
			SaveFile('loadout.obj', b64toBlob(encode64(reader.getString(entrySize))));//TODOv3: removeme
			reader.seek(a);
			*/
			break;
		case VtexImageFormat.Bc4:
		case VtexImageFormat.Bc5:
			entrySize = Math.ceil(mipmapWidth / 4) * Math.ceil(mipmapHeight / 4) * 8;// 0.5 byte per pixel
			break;
		case VtexImageFormat.Bc7:
			entrySize = Math.max(mipmapWidth, 4) * Math.max(mipmapHeight, 4);// 1 byte per pixel, blocks of 16 bytes
			break;
		default:
			console.error('Unknown image format ' + imageFormat, reader, mipmapWidth, mipmapHeight, compressedLength);
	}
	let imageDatas;
	if (compressedLength === null || compressedLength === entrySize) {
		const start = reader.tell();
		//return reader.getString(entrySize);
		imageDatas = new Uint8Array(reader.buffer, reader.tell(), entrySize);
		reader.seek(start + entrySize);
	} else {
		const start = reader.tell();
		const buf = new ArrayBuffer(entrySize);
		imageDatas = new Uint8Array(buf);
		decodeLz4(reader, imageDatas, compressedLength, entrySize);
		reader.seek(start + compressedLength);// decoder may overread, place the reader at the start of the next image block
		if ((start + compressedLength) != reader.tell()) {
			console.error('error decoding texture: wrong decompressed size: ', start, compressedLength, entrySize);
		}
	}

	if (imageDatas && imageFormat == VTEX_FORMAT_BGRA8888) {
		for (let i = 0, l = imageDatas.length; i < l; i += 4) {
			const b = imageDatas[i]!;
			imageDatas[i] = imageDatas[i + 2]!;
			imageDatas[i + 2] = b;
		}
	}

	return imageDatas;
}


function loadVtexSpriteSheet(reader: BinaryReader, block: Source2VtexBlock, offset: number, size: number) {
	reader.seek(offset);
	const version = reader.getUint32();
	let sequenceCount = reader.getUint32();

	let headerOffset = reader.tell();
	const spriteSheet = new Source2SpriteSheet();
	block.spriteSheet = spriteSheet;

	while (sequenceCount--) {
		const spriteSheetSequence = spriteSheet.addSequence();
		const sequenceId = reader.getUint32(headerOffset);
		const unknown1 = reader.getUint32();//1 ? probably some flag -> clamp //0 in materials/particle/water_ripples/allripples
		//unknown1 is most likely 2 uint16 -> see dota2 texture materials/particle/smoke3/smoke3b
		const sequenceDataOffset = reader.tell() + reader.getUint32();
		const frameCount = reader.getUint32();
		spriteSheetSequence.duration = reader.getFloat32();
		const unknown2 = reader.getUint32();//offset to 'CDmeSheetSequence'
		const unknown3 = reader.getUint32();//0
		const unknown4 = reader.getUint32();//0
		headerOffset = reader.tell();

		reader.seek(sequenceDataOffset);

		let frameHeaderOffset = reader.tell();
		let frameIndex = frameCount;
		while (frameIndex--) {
			const spriteSheetFrame = spriteSheetSequence.addFrame();
			spriteSheetFrame.duration = reader.getFloat32(frameHeaderOffset);
			const frameOffset = reader.tell() + reader.getUint32();
			const frameCoords = reader.getUint32();
			frameHeaderOffset = reader.tell();

			reader.seek(frameOffset);
			//while (frameCoords--) we should use all coords but they are identical ? probably one per channel
			{
				spriteSheetFrame.coords[0] = reader.getFloat32();
				spriteSheetFrame.coords[1] = reader.getFloat32();
				spriteSheetFrame.coords[2] = reader.getFloat32();
				spriteSheetFrame.coords[3] = reader.getFloat32();
			}
		}

		//console.error(sequenceId, frameCount, spriteSheetSequence.duration, sequenceDataOffset);
		//console.error(unknown1, unknown2, unknown3, unknown4);

	}
	//console.error(version, sequenceCount);
}

function loadVtexCubemapRadiance(reader: BinaryReader, block: Source2VtexBlock, offset: number, size: number) {
	reader.seek(offset);
	const coeffOffset = reader.getUint32();
	const coeffCount = reader.getUint32();

	//Spherical Harmonics
	const coefficients: number[] = new Array(coeffCount);

	reader.seek(offset + coeffOffset);

	for (let i = 0; i < coeffCount; i++) {
		coefficients[i] = reader.getFloat32();
	}

	block.cubemapRadiance = coefficients;
}
