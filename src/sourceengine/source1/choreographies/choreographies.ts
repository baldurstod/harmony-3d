import { BinaryReader } from 'harmony-binary-reader';
import { DEBUG } from '../../../buildoptions';
import { Repositories } from '../../../repositories/repositories';
import { DecompressLZMA } from '../utils/utils';
import { Actor } from './actor';
import { Channel } from './channel';
import { Choreography } from './choreography';
import { CurveData } from './curvedata';
import { ChoreographyEvent, EventType } from './event';

const CHOREOGRAPHIES_CHUNK_SIZE = 200000;

interface SceneEntry {
	do: any,
	dl: any,
	sso: any,
}

export class Choreographies {
	// TODO: multiple repos
	#repository: string = '';
	choreographies: Record<string, Choreography> = {};//TODO: use map instead ?
	stringPool: Record<string, string> = {};//TODO: use map instead ?
	#reader!: BinaryReader;
	fileId!: number;
	fileVersion!: number;
	scenesCount!: number;
	stringsCount!: number;
	scenesOffset!: number;
	#sceneEntries = new Map<number, SceneEntry>();
	#initialized = false;

	async loadFile(repositoryName: string, fileName: string) {
		this.#repository = repositoryName;
		/*
		if (!repository) {
			console.error(`Unknown repository ${repositoryName} in Choreographies.loadFile`);
			return null;
		}
			*/

		const respone = await Repositories.getFileAsArrayBuffer(repositoryName, fileName);
		if (respone.error) {
			return null;
		}
		/*
		p.then((arrayBuffer) => {
			if (arrayBuffer) {
				resolve(this.parse(repositoryName, fileName, arrayBuffer));
			} else {
				resolve(null);
			}
		});
		*/


		//this.#reader = new RemoteBinaryReader(new URL(fileName, repository.base), undefined, CHOREOGRAPHIES_CHUNK_SIZE);
		this.#reader = new BinaryReader(respone.buffer!, undefined, undefined, true);
		await this.#parseHeader();
	}

	async #parseHeader() {
		this.fileId = this.#reader.getUint32(0);
		this.fileVersion = this.#reader.getUint32();
		this.scenesCount = this.#reader.getUint32();
		this.stringsCount = this.#reader.getUint32();
		this.scenesOffset = this.#reader.getUint32();
	}

	async getChoreography(fileName: string) {
		const choreoCRC = crc32(fileName.replace(/\//g, '\\').toLowerCase());

		if (!this.#initialized) {
			await this.#parseSceneEntries();
			this.#initialized = true;
			if (!this.#initialized) {
				return null;
			}
		}

		if (this.choreographies[choreoCRC]) {
			//return choreographies[choreoCRC];TODOVV2
		}

		if (this.#sceneEntries.get(choreoCRC)) {
			const choreo = await this.#parseSceneData(this.#repository, choreoCRC);
			if (choreo) {
				this.choreographies[choreoCRC] = choreo;
				//console.info(choreo);
				return choreo;
			}
		}
		return null;
	}

	async #parseSceneEntries() {
		//await this.#reader.getLock();
		if (this.scenesOffset && this.scenesCount) {
			const size = this.scenesCount * 16;

			// Ensure we have enough data
			//if (this.hasChunk(this.scenesOffset, size))
			{
				this.#sceneEntries.clear();
				this.#initialized = true;

				this.#reader.seek(this.scenesOffset);
				for (let i = 0; i < this.scenesCount; i++) {
					const sceneCRC = this.#reader.getUint32();
					const doo = this.#reader.getUint32();
					const dl = this.#reader.getUint32();
					const sso = this.#reader.getUint32();
					const sceneEntry = { 'do': doo, 'dl': dl, 'sso': sso };
					this.#sceneEntries.set(sceneCRC, sceneEntry);
				}
			}
		}
		//this.#reader.releaseLock();
	}

	async #parseSceneData(repository: string, sceneCRC: number) {
		//await this.#reader.getLock();
		let choreography = null;

		const sceneEntry = this.#sceneEntries.get(sceneCRC);
		if (sceneEntry) {
			//if (this.hasChunk(sceneEntry['do'], sceneEntry['dl']) && this.hasChunk(sceneEntry['sso'], 8))
			{
				//this.#reader.seek(sceneEntry['do']);
				//reader.skip(4);//LZMA
				const format = this.#reader.getString(4, sceneEntry['do']);
				let decompressedDatas;
				try {
					if (format == 'LZMA') {
						const HEADER_SIZE = 17;// 4 + 4 + 4 + 5
						const uncompressedSize = this.#reader.getUint32();
						const compressedSize = this.#reader.getUint32();
						const properties = this.#reader.getBytes(5);
						const compressedDatas = this.#reader.getBytes(sceneEntry['dl'] - HEADER_SIZE);

						//decompressedDatas = _decompress(properties, compressedDatas, uncompressedSize);
						decompressedDatas = DecompressLZMA(properties, compressedDatas, uncompressedSize);
					} else {
						decompressedDatas = this.#reader.getString(sceneEntry['dl'], sceneEntry['do']);
					}
					if (decompressedDatas) {
						choreography = await this.#loadChoreography(repository, decompressedDatas);
					}
				} catch (e) {
					//fixme: add error code
					console.error(e);
				}
				if (choreography) {
					//this.#reader.seek(sceneEntry['sso']);
					choreography.sceneLength = (this.#reader.getUint32(sceneEntry['sso'])) * 0.001;
				}
			}
		}
		//this.#reader.releaseLock();
		return choreography;
	}

	async #loadChoreography(repository: string, fileContent: string | Uint8Array) {
		const reader = new BinaryReader(fileContent, undefined, undefined, true);
		//saveFile(new File([new Blob([reader.buffer])], '#parseSceneData'));
		const choreography = new Choreography(repository);

		const formatId = await reader.getInt32();
		const formatVersion = await reader.getInt8();
		const crc = await reader.getInt32();

		await this.#loadChoreoEvents(reader, choreography);
		await this.#loadChoreoActors(reader, choreography);

		if (DEBUG) {
			console.log(choreography.toString());
		}
		return choreography;
	}

	/**
	* load choreography events
	* @param {Object jDataView} reader File reader
	*/
	async #loadChoreoEvents(reader: BinaryReader, choreography: Choreography) {
		const repository = choreography.getRepository();
		const eventCount = await reader.getUint8();
		for (let eventIndex = 0; eventIndex < eventCount; ++eventIndex) {
			choreography.addEvent(await this.#loadChoreoEvent(reader, repository, choreography));
		}
	}

	/**
	* load choreography actors
	* @param {Object jDataView} reader File reader
	*/
	async #loadChoreoActors(reader: BinaryReader, choreography: Choreography) {
		const actorCount = await reader.getUint8();
		for (let actorIndex = 0; actorIndex < actorCount; ++actorIndex) {
			choreography.addActor(await this.#loadChoreoActor(reader, choreography.getRepository(), choreography));
		}
	}

	/**
	* load an actor
	* @param {Object jDataView} reader File reader
	*/
	async #loadChoreoActor(reader: BinaryReader, repository: string, choreography: Choreography) {
		const actorName = await this.readString(reader);
		const actor = new Actor(choreography, actorName);

		const channelCount = await reader.getUint8();
		for (let channelIndex = 0; channelIndex < channelCount; ++channelIndex) {
			actor.addChannel(await this.#loadChoreoChannel(reader, repository, choreography));
		}

		actor.setActive(reader.getInt8() != 0);
		return actor;
	}

	/**
	* load an channel
	* @param {Object jDataView} reader File reader
	*/
	async #loadChoreoChannel(reader: BinaryReader, repository: string, choreography: Choreography) {
		const channelName = await this.readString(reader);
		const channel = new Channel(channelName);

		const eventCount = await reader.getUint8();
		for (let eventIndex = 0; eventIndex < eventCount; ++eventIndex) {
			channel.addEvent(await this.#loadChoreoEvent(reader, repository, choreography));
		}

		channel.setActive(reader.getInt8() != 0);
		return channel
	}

	/**
	* load an event
	* @param {Object jDataView} reader File reader
	*/
	async #loadChoreoEvent(reader: BinaryReader, repository: string, choreography: Choreography) {
		const eventType = await reader.getInt8();
		const eventName = await this.readString(reader);
		const startTime = await reader.getFloat32();
		const endTime = await reader.getFloat32();
		const param1 = await this.readString(reader);
		const param2 = await this.readString(reader);
		const param3 = await this.readString(reader);

		const ramp = await this.#loadCurveData(reader);
		const flags = await reader.getUint8();
		const distToTarget = await reader.getFloat32();

		const event = new ChoreographyEvent(choreography, repository, eventType, eventName, startTime, endTime, param1, param2, param3, flags, distToTarget);
		event.setRamp(ramp);

		// Relative & timing tags
		for (let tagtype = 0; tagtype < 2; ++tagtype) {
			const numTags = await reader.getUint8();
			for (let j = 0; j < numTags; ++j) {
				const tagName = await this.readString(reader);
				const percentage = await reader.getUint8() / 255.0;
				if (tagtype == 0) {
					event.addRelativeTag(/*tagName, percentage*/);
				} else {
					event.addTimingTag(/*tagName, percentage, false*/);
				}
			}
		}

		// Absolute tags PLAYBACK / ORIGINAL
		for (let tagtype = 0; tagtype < 2; ++tagtype) {
			const numTags = await reader.getUint8();
			for (let j = 0; j < numTags; ++j) {
				const tagName = await this.readString(reader);
				const percentage = await reader.getUint16() / 4096.0;

				event.addAbsoluteTag(/*tagtype, tagName, percentage*/);
			}
		}

		if (event.getType() == EventType.Gesture) {
			const duration = await reader.getFloat32();
			console.error('TODO');
		}

		if (await reader.getInt8()) {
			const tagname = await this.readString(reader);
			const wavname = await this.readString(reader);
			console.error('TODO');
		}

		await this.#loadFlexAnimations(reader, event);

		if (event.getType() == EventType.Loop) {
			event.m_nNumLoops = await reader.getInt8();
		}

		if (event.getType() == EventType.Speak) {
			event.setCloseCaptionType(await reader.getInt8());
			event.setCloseCaptionToken(await this.readString(reader));
			const flags = await reader.getInt8();
			console.error('TODO');
		}

		return event;
	}

	/**
	* load flex animations
	* @param {Object jDataView} reader File reader
	*/
	#loadFlexAnimations(reader: BinaryReader, event: ChoreographyEvent) {
		const numTracks = reader.getUint8();
		for (let i = 0; i < numTracks; ++i) {
			console.error('TODO');
			// Controller name
			const track = event.addTrack(this.readString(reader));
			track.setFlags(reader.getUint8());

			track.setMin(reader.getFloat32());
			track.setMax(reader.getFloat32());

			const sampleTypeCount = track.isComboType() ? 2 : 1;
			for (let sampleType = 0; sampleType < sampleTypeCount; ++sampleType) {//TODO: improve condition
				const sampleCount = reader.getUint16();
				for (let j = 0; j < sampleCount; ++j) {
					const sample = track.addSample(reader.getFloat32(), reader.getUint8() / 255.0, sampleType);
					sample.setCurveType(reader.getUint16());
					/*t = await reader.getFloat32();
					v = await reader.getUint8() / 255.0;*/
					//TODO: add sample
					//					await reader.getUint16();
				}
			}
		}
	}

	/**
	* load curve data
	* @param {Object jDataView} reader File reader
	*/
	#loadCurveData(reader: BinaryReader): CurveData {
		const curveData = new CurveData();

		const count = reader.getUint8();
		/*if (count == 3) {
			//	TODO: there is an issue with choreo 'scenes/workshop/player/engineer/low/taunt_jackhammer_rodeo.vcd'
			count is stored as an unsigned char but actual count is 259
			count += 256;
		}*/
		for (let i = 0; i < count; ++i) {
			const t = reader.getFloat32();
			const v = reader.getUint8() / 255.0;

			curveData.add(t, v, false);
		}

		return curveData;
	}



	/**
	* Read string index, return the string
	* @return {String} The read string or null
	*/
	readString(reader: BinaryReader) {
		return this.getString(reader.getInt16());
	}

	/**
	* Get a string
	* @param {Number} stringIndex stringIndex
	* @return {String} The read string or error string
	*/
	getString(stringIndex: number) {
		const s = this.stringPool[stringIndex];
		if (s === undefined) {
			const stringOffsetOffset = 20 + stringIndex * 4;
			const stringOffset = this.#reader.getUint32(stringOffsetOffset);
			return this.#reader.getNullString(stringOffset);
		}
		throw new Error(`String not found ${stringIndex}`);
	}

	/*readNullString() {
		let s='';
		let c;
		do {
			c = reader.getChar();
			if (c == '\0') {
			} else {
				s += c;
			}

		} while(c != '\0');
		return s;
	}*/
}

function makeCRCTable() {
	let c;
	const crcTable = [];
	for (let n = 0; n < 256; n++) {
		c = n;
		for (let k = 0; k < 8; k++) {
			c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
		}
		crcTable[n] = c;
	}
	return crcTable;
}

let CacheCrcTable: number[];
function crc32(str: string) {
	const crcTable = CacheCrcTable ?? (CacheCrcTable = makeCRCTable());
	let crc = 0 ^ (-1);

	for (let i = 0; i < str.length; i++) {
		crc = (crc >>> 8) ^ crcTable[(crc ^ str.charCodeAt(i)) & 0xFF]!;
	}

	return (crc ^ (-1)) >>> 0;
};
