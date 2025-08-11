import { Source2AnimationDesc } from '../models/source2animationdesc';

const EMPTY_MODIFIERS = new Set();
export class Source2Animations {
	#animations: Source2AnimationDesc[] = [];

	addAnimations(animations: Source2AnimationDesc[]): void {
		this.#animations.push(...animations);
	}

	getAnimations(): Source2AnimationDesc[] {
		return this.#animations;
	}

	getAnimation(activityName: string, activityModifiers = EMPTY_MODIFIERS): Source2AnimationDesc | null {
		for (const animation of this.#animations) {
			if (animation.matchModifiers(activityName, activityModifiers)) {
				return animation;
			}
		}

		// Try without modifiers
		for (const animation of this.#animations) {
			if (animation.matchModifiers(activityName, EMPTY_MODIFIERS)) {
				return animation;
			}
		}
		return null;
	}

	getBestAnimation(activityName: string, activityModifiers: Set<string>): Source2AnimationDesc | null {
		let bestMatch = this.getAnimation(activityName);
		let bestScore = bestMatch ? 0 : -1;
		for (const animDesc of this.#animations) {

			/*if (animDesc.matchModifiers(activityName, activityModifiers)) {
				return animDesc;
			}*/
			const score = animDesc.modifiersScore(activityName, activityModifiers);
			if (score > bestScore) {
				bestMatch = animDesc;
				bestScore = score;
			}
		}
		return bestMatch;
	}
}
