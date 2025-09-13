import { AnimationDescription } from './animationdescription';

export class Animations {
	readonly #animations = new Map<number, AnimationDescription>();

	[Symbol.iterator] = (): ArrayIterator<[number, AnimationDescription]> => {
		return this.#animations.entries();
	}

	clear(): void {
		this.#animations.clear();
	}

	set(id: number, animation: AnimationDescription): void {
		this.#animations.set(id, animation);
		this.#computeWeights();
	}

	remove(id: number): void {
		this.#animations.delete(id);
		this.#computeWeights();
	}

	/*
	get animations(): AnimationDescription[] {
		return this.#animations;
	}
	*/

	get(id: number): AnimationDescription | null {
		return this.#animations.get(id) ?? null;
	}

	setWeight(id: number, weight: number): boolean {
		const animation = this.#animations.get(id);
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
