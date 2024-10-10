const EMPTY_MODIFIERS = new Set();
export class Source2Animations {
	#animations = [];

	addAnimations(animations) {
		this.#animations.push(...animations);
	}

	getAnimations() {
		return this.#animations;
	}

	getAnimation(activityName, activityModifiers = EMPTY_MODIFIERS) {
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
	}

	getBestAnimation(activityName, activityModifiers) {
		let bestMatch = this.getAnimation(activityName);
		let bestScore = bestMatch ? 0 : -1;
		for (let animDesc of this.#animations) {

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
