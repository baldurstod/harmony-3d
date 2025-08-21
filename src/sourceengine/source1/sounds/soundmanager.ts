import { AudioMixer } from '../../../audio/audiomixer';
import { Repositories } from '../../../repositories/repositories';
import { KvElement, KvReader } from '../loaders/kvreader';
import { Sound } from './sound';

export class Source1SoundManager {
	static #mute = false;
	static #audioList = new Map<string, HTMLAudioElement>();
	static #soundList = {};
	static #soundsPerRepository = new Map<string, Map<string, Sound>>();
	static #soundListPerRepository = {};
	static #manifestsPerRepository = new Map<string, string[]>();
	static #promisePerRepository = new Map<string, Promise<boolean>>();


	/**
	 * Play a sound
	 * @param {String} soundName soundName
	 */
	static async playSound(repositoryName: string, soundName: string): Promise<HTMLAudioElement | null> {
		if (this.#mute) {
			return null;
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
				const response = await Repositories.getFileAsBlob(sound.getRepository(), '/sound/' + wave);

				if (!response.error) {
					audio = new Audio(URL.createObjectURL(response.blob as Blob)/*new URL('/sound/' + wave, repository.base).toString()*/);
					this.#audioList.set(wave, audio);
					audio.volume = 0.1;
					//audio.play();
					AudioMixer.playAudio('master', audio);//TODO: change master per actual channel
				} else {
					return null;
				}
			} else {
				AudioMixer.playAudio('master', audio);
			}
			return audio;
		}
		return null;
	}

	static async #getSound(repositoryName: string, soundName: string): Promise<Sound | null> {
		await this.#fetchManifests(repositoryName);
		/*const repo = this.#soundsPerRepository[repositoryName];
		if (repo) {
			return repo[soundName];
		}*/

		return this.#soundsPerRepository.get(repositoryName)?.get(soundName) ?? null;
	}

	static async #fetchManifests(repositoryName: string): Promise<void> {
		if (this.#promisePerRepository.has(repositoryName)) {
			await this.#promisePerRepository.get(repositoryName);
		}

		if (!this.#soundsPerRepository.has(repositoryName)) {
			this.#soundsPerRepository.set(repositoryName, new Map());
		}

		let promiseResolve: (value: boolean) => void;
		this.#promisePerRepository.set(repositoryName, new Promise(resolve => promiseResolve = resolve));

		const manifests = this.#manifestsPerRepository.get(repositoryName);

		if (manifests) {
			this.#manifestsPerRepository.delete(repositoryName);
			for (const manifest of manifests) {
				await this.#fetchManifest(repositoryName, manifest);
			}
		}

		promiseResolve!(true);
	}

	static async #fetchManifest(repositoryName: string, manifestPath: string): Promise<void> {
		const response = await Repositories.getFileAsText(repositoryName, manifestPath);
		if (!response.error) {
			this.#loadManifest(repositoryName, response.text as string);
		}
	}

	static #loadManifest(repositoryName: string, manifestTxt: string): void {
		const sounds = this.#soundsPerRepository.get(repositoryName);

		const kv = new KvReader();
		kv.readText(manifestTxt);
		const list = kv.rootElements as Record<string, KvElement>;
		const keyArray = Object.keys(list);
		for (let i = 0; i < keyArray.length; ++i) {
			const soundKey = keyArray[i]!;
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
	static loadManifest(repositoryName: string, fileName: string): void {
		let manifests = this.#manifestsPerRepository.get(repositoryName);

		if (!manifests) {
			manifests = [];
			this.#manifestsPerRepository.set(repositoryName, manifests);
		}
		manifests.push(fileName);
	}

	static mute(): void {
		this.#mute = true;
	}

	static unmute(): void {
		this.#mute = false;
	}
}
