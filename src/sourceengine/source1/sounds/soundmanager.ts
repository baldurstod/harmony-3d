import { Sound } from './sound';
import { KvElement, KvReader } from '../loaders/kvreader';
import { AudioMixer } from '../../../audio/audiomixer';
import { Repositories } from '../../../repositories/repositories';
import { customFetch } from '../../../utils/customfetch';
import { Kv3Element } from '../../common/keyvalue/kv3element';

export class Source1SoundManager {
	static #mute = false;
	static #audioList = new Map<string, HTMLAudioElement>();
	static #soundList = {};
	static #soundsPerRepository = new Map<string, Map<string, Sound>>();
	static #soundListPerRepository = {};
	static #manifestsPerRepository = new Map<string, Array<string>>();
	static #promisePerRepository = new Map<string, Promise<boolean>>();


	/**
	 * Play a sound
	 * @param {String} soundName soundName
	 */
	static async playSound(repositoryName: string, soundName: string) {
		if (this.#mute) {
			return;
		}

		const sound = await this.#getSound(repositoryName, soundName);
		//const sound = this.#soundList[soundName];
		if (sound) {
			let wave = sound.getWave();

			// Remove #, *, ( and ) from paths
			wave = wave.replace(/[\(\)\#\*]/g, '').toLowerCase();

			let audio = this.#audioList.get(wave);
			//audio = null;//removeme
			if (!audio) {
				const response = await new Repositories().getFileAsBlob(sound.getRepository(), '/sound/' + wave);

				if (!response.error) {
					audio = new Audio(URL.createObjectURL(response.blob as Blob)/*new URL('/sound/' + wave, repository.base).toString()*/);
					this.#audioList.set(wave, audio);
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

	static async #getSound(repositoryName: string, soundName: string) {
		await this.#fetchManifests(repositoryName);
		/*const repo = this.#soundsPerRepository[repositoryName];
		if (repo) {
			return repo[soundName];
		}*/

		return this.#soundsPerRepository.get(repositoryName)?.get(soundName);
	}

	static async #fetchManifests(repositoryName: string) {
		if (this.#promisePerRepository.has(repositoryName)) {
			await this.#promisePerRepository.get(repositoryName);
		}

		if (!this.#soundsPerRepository.has(repositoryName)) {
			this.#soundsPerRepository.set(repositoryName, new Map());
		}

		let promiseResolve: (value: boolean) => void;
		this.#promisePerRepository.set(repositoryName, new Promise(resolve => promiseResolve = resolve));

		let manifests = this.#manifestsPerRepository.get(repositoryName);

		if (manifests) {
			this.#manifestsPerRepository.delete(repositoryName);
			for (const manifest of manifests) {
				await this.#fetchManifest(repositoryName, manifest);
			}
		}

		promiseResolve!(true);
	}

	static async #fetchManifest(repositoryName: string, manifestPath: string) {
		const response = await new Repositories().getFileAsText(repositoryName, manifestPath);
		if (!response.error) {
			this.#loadManifest(repositoryName, response.text as string);
		}
	}

	static #loadManifest(repositoryName: string, manifestTxt: string) {
		const sounds = this.#soundsPerRepository.get(repositoryName);

		const kv = new KvReader();
		kv.readText(manifestTxt);
		const list = kv.rootElements as { [key: string]: KvElement /*TODO: improve type*/ };
		const keyArray = Object.keys(list);
		for (let i = 0; i < keyArray.length; ++i) {
			const soundKey = keyArray[i];
			const sound = list[soundKey] as any/*TODO: improve type*/;
			let wave;
			if (sound.rndwave) {
				wave = [];
				Object.keys(sound.rndwave).forEach(function (element) {
					wave.push(sound.rndwave[element]);
				});
			} else {
				wave = sound.wave as string;
			}
			//const wave = sound.rndwave ? sound.rndwave : sound.wave;
			const s = new Sound(repositoryName, wave, sound.channel);

			sounds?.set(soundKey, s);
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
		let manifests = this.#manifestsPerRepository.get(repositoryName);

		if (!manifests) {
			manifests = [];
			this.#manifestsPerRepository.set(repositoryName, manifests);
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
