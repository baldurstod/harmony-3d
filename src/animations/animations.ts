import { AnimationDescription } from './animationdescription';

export class Animations {
	#animations: AnimationDescription[] = [];

	[Symbol.iterator] = () => {
		return this.#animations.entries();
	}

	clear() {
		this.#animations.length = 0;
	}

	set(id: number, animation: AnimationDescription) {
		this.#animations[id] = animation;
		this.#computeWeights();
	}

	remove(id: number) {
		this.#animations[id] = undefined;
		this.#computeWeights();
	}

	get animations() {
		return this.#animations;
	}

	get(id: number) {
		return this.#animations[id];
	}

	setWeight(id: number, weight: number) {
		const animation = this.#animations[id];
		if (!animation) {
			return false;
		}

		animation.weight = weight;
		this.#computeWeights();
		return true;
	}

	#computeWeights() {

	}
}
