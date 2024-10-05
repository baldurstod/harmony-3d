import { AudioGroup } from './audiogroup';

export class AudioMixer {
	static master = new AudioGroup('master');

	static muteGroup(groupName, mute = true) {
		this.getGroup(groupName).mute(mute);
	}

	static mute(mute = true) {
		this.master.mute(mute);
	}

	static getGroup(groupName = '') {
		return this.master.getGroup(groupName.split('.'));
	}

	static playAudio(groupName, audio) {
		this.getGroup(groupName).playAudio(audio);
	}
}
