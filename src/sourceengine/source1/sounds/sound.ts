export class Sound {
	#repository;
	#wave;
	constructor(repository, wave) {
		this.#repository = repository;
		this.#wave = wave
	}

	getRepository() {
		return this.#repository;
	}

	getWave() {
		const wave = this.#wave;
		if (wave instanceof Array) {
			const index = Math.floor(Math.random() * wave.length);
			return wave[index];
		} else {
			return wave;
		}
	}
}
