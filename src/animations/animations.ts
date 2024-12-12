import { AnimationDescription } from './animationdescription';

export class Animations {
	#animations = new Map<string, AnimationDescription>();

	[Symbol.iterator] = () => {
		return this.#animations.entries();
	}

	add(animation: AnimationDescription) {
		this.#animations.set(animation.name, animation);
		this.#computeWeights();
	}

	remove(animation: AnimationDescription) {
		this.#animations.delete(animation.name);
		this.#computeWeights();
	}

	get animations() {
		return this.#animations;
	}

	get(animationName: string) {
		return this.#animations.get(animationName);
	}

	setWeight(animationName: string, weight: number) {
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
}
