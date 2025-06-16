export class AudioGroup {
	name: string;
	#muted = false;
	groups = new Map<string, AudioGroup>();
	audioList = new Set<HTMLMediaElement>();

	constructor(name: string) {
		this.name = name;
	}

	mute(mute: boolean): void {
		this.#muted = (mute == true);
		for (const audio of this.audioList) {
			audio.muted = this.#muted;
		}
	}

	isMute(): boolean {
		return this.#muted;
	}

	getGroup(groupPath: string[]): AudioGroup {
		if (groupPath[0] == this.name) {
			if (groupPath.length == 1) {
				return this;
			}

			let group = this.groups.get(groupPath[1]);
			if (!group) {
				group = this.createSubGroup(groupPath[1]);
			}
			return group.getGroup(groupPath.slice(1));
		}
	}

	createSubGroup(name: string): AudioGroup {
		console.log('Creating group ' + name);
		const subGroup = new AudioGroup(name);
		this.groups.set(name, subGroup);
		return subGroup;
	}

	async playAudio(audio: HTMLMediaElement): Promise<void> {
		audio.muted = this.#muted;
		audio.currentTime = 0;
		try {
			await audio.play();
		} catch (e) {
			console.error(e)
		}
		this.audioList.add(audio);
	}
}
