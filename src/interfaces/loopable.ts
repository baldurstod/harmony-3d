export interface Loopable {
	isLoopable: true;
	setLooping: (looping: boolean) => void;
	getLooping: () => boolean;
}
