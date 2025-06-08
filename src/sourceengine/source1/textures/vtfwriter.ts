import { saveFile } from 'harmony-browser-utils';
import { BinaryReader } from 'harmony-binary-reader';

const LOW_RES_IMAGE = 0x01;
const HIGH_RES_IMAGE = 0x30;

class VTFResource {
	#type;
	#flag;
	#data: any;
	#length: number = 0;
	constructor(type: number, flag: number = 0) {
		this.#type = type;
		this.#flag = flag;
		this.data = null;
	}

	set data(data: any) {
		this.#data = data;
		if (data) {
			this.#length = data.length;
		} else {
			this.#length = 0;
		}
	}

	get type() {
		return this.#type;
	}

	get length() {
		return this.#length;
	}

	get flag() {
		return this.#flag;
	}
}

export class VTFFile {
	#flags = 0;
	#width;
	#height;
	#frames;
	#imageFormat;
	#faces;
	#slices;
	#hasThumbnail = false;
	#hasMipMaps = false;
	#mipMaps: Array<Array<Array<Array<Uint8ClampedArray>>>> = [[[[]]]];
	#bumpmapScale = 1.0;//todo
	#highResImageFormat = 0;//todo
	#resources: Array<VTFResource> = [];
	#highResResource = new VTFResource(HIGH_RES_IMAGE);
	constructor(width = 512, height = 512, imageFormat = 0/*TODO*/, frames = 1, faces = 1, slices = 1) {
		this.#width = width;
		this.#height = height;
		this.#imageFormat = imageFormat;
		this.#frames = frames;
		this.#faces = faces;
		this.#slices = slices;

		this.addResource(this.#highResResource);
	}

	addResource(resource: VTFResource) {
		this.#resources.push(resource);
	}

	get height() {
		return this.#height;
	}

	get width() {
		return this.#width;
	}

	setFlag(flag: number) {
		this.#flags |= flag;
	}

	unsetFlag(flag: number) {
		this.#flags &= ~flag;
	}

	get flags() {
		return this.#flags;
	}

	get frames() {
		return 1;//TODO
	}

	get bumpmapScale() {
		return this.#bumpmapScale;
	}

	get highResImageFormat() {
		return this.#highResImageFormat;
	}

	get mipmapCount() {
		return 1;//TODO
	}

	get lowResImageFormat() {
		return -1;//TODO
	}

	get lowResImageWidth() {
		return 0;//TODO
	}

	get lowResImageHeight() {
		return 0;//TODO
	}

	get depth() {
		return 1;//TODO
	}

	get numResources() {
		return this.#resources.length;//TODO
	}

	get resources() {
		return this.#resources;
	}

	getMipMaps() {
		return this.#mipMaps;
	}

	setImageData(imageData: Uint8ClampedArray, frame = 0, face = 0, slice = 0, mipmap = 0) {
		this.#mipMaps[mipmap][frame][face][slice] = imageData;//TODO: check values;
		this.#highResResource.data = imageData;
	}
}

export class VTFWriter {
	static writeAndSave(vtffile: VTFFile, filename: string) {
		let arrayBuffer = this.write(vtffile);
		var dataView = new DataView(arrayBuffer);

		//saveFile(filename, new Blob([dataView]));
		saveFile(new File([new Blob([dataView])], filename));
	}

	static write(vtffile: VTFFile) {
		//TODO: check vtffile
		let writer = new BinaryReader(new Uint8Array(this.#computeLength(vtffile)));
		this.#writeHeader(writer, vtffile);
		return writer.buffer;
	}

	static #computeLength(vtffile: VTFFile) {
		let result = 80 + vtffile.numResources * 8;

		let resArray = vtffile.resources;
		for (let i in resArray) {
			let resource = resArray[i];
			if (resource.flag != 2) {
				result += resource.length;
			}
		}

		return result;
	}

	static #writeHeader(writer: BinaryReader, vtffile: VTFFile) {
		let fixedHeaderLength = 80;
		writer.seek(0);
		writer.setUint32(0x00465456);//VTF\0
		writer.setUint32(VTFWriter.majorVersion);
		writer.setUint32(VTFWriter.minorVersion);
		let headerLength = fixedHeaderLength + vtffile.numResources * 8;
		writer.setUint32(headerLength);
		writer.setUint16(vtffile.width);
		writer.setUint16(vtffile.height);
		writer.setUint32(vtffile.flags);
		writer.setUint16(vtffile.frames);
		writer.setUint16(0);//TODO ??? firstFrame
		writer.skip(4);//padding.
		writer.setFloat32(0.092801064);//TODO reflectivity vector.
		writer.setFloat32(0.092801064);//TODO reflectivity vector.
		writer.setFloat32(0.092801064);//TODO reflectivity vector.
		writer.skip(4);//padding.
		writer.setFloat32(vtffile.bumpmapScale);//TODO bumpmapScale

		//writer.writeInt32(vtffile.highResImageFormat);
		writer.setInt32(0);
		writer.setUint8(vtffile.mipmapCount);
		writer.setInt32(vtffile.lowResImageFormat);
		writer.setUint8(vtffile.lowResImageWidth);
		writer.setUint8(vtffile.lowResImageHeight);

		writer.setUint16(vtffile.depth);
		writer.skip(3);
		writer.setUint32(vtffile.numResources);
		writer.skip(8);

		let resArray = vtffile.resources;
		let dataOffset = headerLength;
		let resHeaderOffset = fixedHeaderLength;
		for (let i in resArray) {
			writer.seek(resHeaderOffset);
			let resource = resArray[i];
			writer.setUint32(resource.type);
			/*writer.skip(-1);
			writer.setUint8(resource.flag);*/
			if (resource.flag == 2) {// resource doesn't have data
				writer.skip(4);
				//todo writedata
			} else {
				writer.setUint32(dataOffset);
				this.#writeResource(writer, vtffile, resource, dataOffset);
				dataOffset += resource.length;
			}

			resHeaderOffset += 8;
		}
	}

	static #writeResource(writer: BinaryReader, vtffile: VTFFile, resource: VTFResource, dataOffset: number) {
		switch (resource.type) {
			case LOW_RES_IMAGE:
				break;
			case HIGH_RES_IMAGE:
				this.#writeHighResImage(writer, vtffile, resource, dataOffset);
				break;
		}
	}

	static #writeHighResImage(writer: BinaryReader, vtffile: VTFFile, resource: VTFResource, dataOffset: number) {
		writer.seek(dataOffset);
		writer.setBytes(vtffile.getMipMaps()[0][0][0][0]);
	}

	static get majorVersion() {
		return 7;
	}

	static get minorVersion() {
		return 5;
	}
}
