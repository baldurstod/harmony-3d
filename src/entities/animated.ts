export interface Animated {
	hasAnimations: true;
	getAnimations: () => Promise<Set<string>>;
	playSequence: (name: string) => void;
	playAnimation: (name: string) => void;
}
