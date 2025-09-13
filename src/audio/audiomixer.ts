import { AudioGroup } from './audiogroup';

export class AudioMixer {
	static master = new AudioGroup('master');

	static muteGroup(groupName: string, mute = true): void {
		this.getGroup(groupName)?.mute(mute);
	}

	static mute(mute = true): void {
		this.master.mute(mute);
	}

	static getGroup(groupName = ''): AudioGroup | null {
		return this.master.getGroup(groupName.split('.'));
	}

	static async playAudio(groupName: string, audio: HTMLMediaElement): Promise<void> {
		await this.getGroup(groupName)?.playAudio(audio);
	}
}
