import { AnimationDescription } from './animationdescription';

export class Animations {
	#animations: AnimationDescription[] = [];

	[Symbol.iterator] = (): ArrayIterator<[number, AnimationDescription]> => {
		return this.#animations.entries();
	}

	clear(): void {
		this.#animations.length = 0;
	}

	set(id: number, animation: AnimationDescription): void {
		this.#animations[id] = animation;
		this.#computeWeights();
	}

	remove(id: number): void {
		this.#animations[id] = undefined;
		this.#computeWeights();
	}

	get animations(): AnimationDescription[] {
		return this.#animations;
	}

	get(id: number): AnimationDescription {
		return this.#animations[id];
	}

	setWeight(id: number, weight: number): boolean {
		const animation = this.#animations[id];
		if (!animation) {
			return false;
		}

		animation.weight = weight;
		this.#computeWeights();
		return true;
	}

	#computeWeights(): void {
		// do nothing.
	}
}
