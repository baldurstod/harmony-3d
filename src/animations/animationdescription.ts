export class AnimationDescription {
	#animation;
	#weight;
	#frame = 0;
	constructor(animation, weight) {
		this.#animation = animation;
		this.#weight = weight;
	}

	set weight(weight) {
		this.#weight = weight;
	}

	get weight() {
		return this.#weight;
	}

	set frame(frame) {
		this.#frame = Math.floor(frame % this.#animation.frameCount);
	}

	get name() {
		return this.#animation.name;
	}
}
