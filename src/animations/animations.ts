import { Animation } from './animation';

export class Animations {
	#animations = new Map<string, Animation>();

	[Symbol.iterator] = () => {
		return this.#animations.entries();
	}

	add(animation) {
		this.#animations.set(animation.name, animation);
		this.#computeWeights();
	}

	delete(animation) {
		this.#animations.delete(animation.name);
		this.#computeWeights();
	}

	get animations() {
		return this.#animations;
	}

	get(animationName) {
		return this.#animations.get(animationName);
	}

	setWeight(animationName, weight) {
		let animation = this.#animations.get(animationName);
		if (!animation) {
			return false;
		}

		animation.weight = weight;
		this.#computeWeights();
		return true;
	}

	#computeWeights() {

	}

	play(delta) {

	}
}
