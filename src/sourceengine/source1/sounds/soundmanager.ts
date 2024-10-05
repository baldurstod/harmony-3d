import { Sound } from './sound';
import { KvReader } from '../loaders/kvreader';
import { AudioMixer } from '../../../audio/audiomixer';
import { Repositories } from '../../../misc/repositories';
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

				const repository = Repositories.getRepository(sound.getRepository());
				if (!repository) {
					console.error(`Unknown repository ${sound.repositoryName} in Source1SoundManager.playSound`);
					return null;
				}

				const soundUrl = //sound.repository + '/sound/' + wave;//TODO: constant
				audio = new Audio(new URL('/sound/' + wave, repository.base).toString());
				this.#audioList[wave] = audio;
				audio.volume = 0.1;
				//audio.play();
				AudioMixer.playAudio('master', audio);//TODO: change master per actual channel
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

	static async #fetchManifest(repositoryName, manifestPath) {
		const repository = Repositories.getRepository(repositoryName);
		if (!repository) {
			console.error(`Unknown repository ${repositoryName} in Source1SoundManager.#fetchManifests`);
			return null;
		}

		//try {
			const response = await customFetch(new URL(manifestPath, repository.base));
			this.#loadManifest(repositoryName, await response.text());

		/*} catch(e) {
			console.error(`Error while fetching ${repositoryName} ${manifestPath} in Source1SoundManager.#fetchManifests`, e);
			return null;
		}*/
	}

	static #loadManifest(repositoryName, manifestTxt) {
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
				Object.keys(sound.rndwave).forEach(function(element) {
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


		const repository = Repositories.getRepository(repositoryName);
		if (!repository) {
			console.error(`Unknown repository ${repositoryName} in Source1SoundManager.loadManifest`);
			return null;
		}

		customFetch(new URL(fileName, repository.base)).then(callback, ajaxReject);
	}
	*/

	static loadManifest(repositoryName, fileName) {
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
