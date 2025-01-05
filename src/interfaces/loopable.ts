export interface Loopable {
	isLoopable: true;
	setlooping: (looping: boolean) => void;
	getlooping: () => boolean;
}
