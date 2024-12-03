export interface Animated {
	getAnimations: () => Promise<Set<string>>;
	playSequence: (name: string) => void;
}
