import { Animation } from './animation';

export class AnimationDescription {
	#animation: Animation;
	#weight: number;
	#frame = 0;

	constructor(animation: Animation, weight: number) {
		this.#animation = animation;
		this.#weight = weight;
	}

	set weight(weight) {
		this.#weight = weight;
	}

	get weight(): number {
		return this.#weight;
	}

	set frame(frame: number) {
		this.#frame = Math.floor(frame % this.#animation.frameCount);
	}

	get frame(): number {
		return this.#frame;
	}

	get name(): string {
		return this.#animation.name;
	}

	get animation(): Animation {
		return this.#animation;
	}
}
