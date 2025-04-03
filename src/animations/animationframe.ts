import { AnimationFrameData, AnimationFrameDataType, AnimationFrameDataTypes } from './animationframedata';

export class AnimationFrame {
	#frameId: number;
	#datas = new Map<string, AnimationFrameData>();

	constructor(frameId: number) {
		this.#frameId = frameId;
	}

	setDatas(name: string, type: AnimationFrameDataType, datas: Array<AnimationFrameDataTypes>) {
		this.#datas.set(name, new AnimationFrameData(type, datas));
	}

	pushData(name: string, data: AnimationFrameDataTypes) {
		const frameDatas = this.#datas.get(name);
		frameDatas?.pushData(data);
	}

	getData(name: string): AnimationFrameData | undefined {
		return this.#datas.get(name);
	}

	getFrameId(): number {
		return this.#frameId;
	}
}
