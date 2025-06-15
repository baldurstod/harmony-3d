export class Sound {
	#repository: string;
	#wave: string | string[];
	#channel: string;

	constructor(repository: string, wave: string | string[], channel: string) {
		this.#repository = repository;
		this.#wave = wave;
		this.#channel = channel;
	}

	getRepository() {
		return this.#repository;
	}

	getWave() {
		if (Array.isArray(this.#wave)) {
			const index = Math.floor(Math.random() * this.#wave.length);
			return this.#wave[index];
		} else {
			return this.#wave;
		}
	}

	getChannel() {
		return this.#channel;
	}
}
