import { Sound } from './sound';
import { KvReader } from '../loaders/kvreader';
import { AudioMixer } from '../../../audio/audiomixer';
import { Repositories } from '../../../repositories/repositories';
import { customFetch } from '../../../utils/customfetch';

export class Source1SoundManager {
	static #mute = false;
	static #audioList = {};
	static #soundList = {};
	static #soundsPerRepository = {};
	static #soundListPerRepository = {};
	static #manifestsPerRepository = {};
	static #promisePerRepository = {};


	/**
	 * Play a sound
	 * @param {String} soundName soundName
	 */
	static async playSound(repositoryName, soundName) {
		if (this.#mute) {
			return;
		}

		const sound = await this.#getSound(repositoryName, soundName);
		//const sound = this.#soundList[soundName];
		if (sound) {
			let wave = sound.getWave();

			// Remove #, *, ( and ) from paths
			wave = wave.replace(/[\(\)\#\*]/g, '').toLowerCase();

			let audio = this.#audioList[wave];
			//audio = null;//removeme
			if (!audio) {
				const response = await new Repositories().getFileAsBlob(sound.getRepository(), '/sound/' + wave);

				if (!response.error) {
					audio = new Audio(URL.createObjectURL(response.blob)/*new URL('/sound/' + wave, repository.base).toString()*/);
					this.#audioList[wave] = audio;
					audio.volume = 0.1;
					//audio.play();
					AudioMixer.playAudio('master', audio);//TODO: change master per actual channel
				}
			} else {
				AudioMixer.playAudio('master', audio);
			}
			return audio;
		}
	}

	static async #getSound(repositoryName, soundName) {
		await this.#fetchManifests(repositoryName);
		/*const repo = this.#soundsPerRepository[repositoryName];
		if (repo) {
			return repo[soundName];
		}*/

		return this.#soundsPerRepository[repositoryName]?.[soundName];
	}

	static async #fetchManifests(repositoryName) {
		if (this.#promisePerRepository[repositoryName]) {
			await this.#promisePerRepository[repositoryName];
		}
		this.#soundsPerRepository[repositoryName] = this.#soundsPerRepository[repositoryName] ?? {};
		let promiseResolve;
		this.#promisePerRepository[repositoryName] = new Promise(resolve => promiseResolve = resolve);

		let manifests = this.#manifestsPerRepository[repositoryName];

		if (manifests) {
			delete this.#manifestsPerRepository[repositoryName];
			for (const manifest of manifests) {
				await this.#fetchManifest(repositoryName, manifest);
			}
		}

		promiseResolve(true);
	}

	static async #fetchManifest(repositoryName: string, manifestPath: string) {
		const response = await new Repositories().getFileAsText(repositoryName, manifestPath);
		if (!response.error) {
			this.#loadManifest(repositoryName, response.text);
		}
	}

	static #loadManifest(repositoryName: string, manifestTxt: string) {
		const sounds = this.#soundsPerRepository[repositoryName];

		const kv = new KvReader();
		kv.readText(manifestTxt);
		const list = kv.rootElements;
		const keyArray = Object.keys(list);
		for (let i = 0; i < keyArray.length; ++i) {
			const soundKey = keyArray[i];
			const sound = list[soundKey];
			let wave;
			if (sound.rndwave) {
				wave = [];
				Object.keys(sound.rndwave).forEach(function (element) {
					wave.push(sound.rndwave[element]);
				});
			} else {
				wave = sound.wave;
			}
			//const wave = sound.rndwave ? sound.rndwave : sound.wave;
			sounds[soundKey] = new Sound(repositoryName, wave);
			sounds[soundKey].channel = sound.channel;
		}

	}

	/**
	 * Load soundManifest
	 */
	/*

		static loadManifest(repositoryName, fileName) {
			const callback =
				async (response) => {
					if (!response.ok) {
						return;
					}
					let arg1 = await response.text();
					if (arg1) {
						const kv = new KvReader();
						kv.readText(arg1);
						const list = kv.rootElements//['Demoman.Death'];
						const keyArray = Object.keys(list);
						for (let i = 0; i < keyArray.length; ++i) {
							const soundKey = keyArray[i];
							const sound = list[soundKey];
							let wave;
							if (sound.rndwave) {
								wave = [];
								Object.keys(sound.rndwave).forEach(function(element) {
									wave.push(sound.rndwave[element]);
								});
							} else {
								wave = sound.wave;
							}
							//const wave = sound.rndwave ? sound.rndwave : sound.wave;
							this.#soundList[soundKey] = new Sound(wave);
							this.#soundList[soundKey].repositoryName = repositoryName;
							this.#soundList[soundKey].channel = sound.channel;
						}
					}
					this.#initialisationPhase = 2;//TODO: per file
				}
			const ajaxReject =
				function(value) {
					//TODO: ????
				};


			const repository = new Repositories().getRepository(repositoryName);
			if (!repository) {
				console.error(`Unknown repository ${repositoryName} in Source1SoundManager.loadManifest`);
				return null;
			}

			customFetch(new URL(fileName, repository.base)).then(callback, ajaxReject);
		}
		*/

	static loadManifest(repositoryName: string, fileName: string) {
		let manifests = this.#manifestsPerRepository[repositoryName];

		if (!manifests) {
			manifests = [];
			this.#manifestsPerRepository[repositoryName] = manifests;
		}
		manifests.push(fileName);
	}

	static mute() {
		this.#mute = true;
	}

	static unmute() {
		this.#mute = false;
	}
}
