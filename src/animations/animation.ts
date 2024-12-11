import { AnimationFrame } from './animationframe';

export class Animation {
	#name;
	#weight: number = 1;
	#frame = 0;
	#frameCount = 0;
	#looping: boolean = false;
	//#sequence;
	#fps = 30;
	#frames: Array<AnimationFrame> = [];

	constructor(name: string) {
		this.#name = name;
	}

	addFrame(animationFrame: AnimationFrame) {
		this.#frames.push(animationFrame);
		++this.#frameCount;
	}

	get name() {
		return this.#name;
	}

	get frameCount() {
		return this.#frameCount;
	}

	set fps(fps) {
		this.#fps = fps;
	}

	get fps() {
		return this.#fps;
	}
}
