export class AudioGroup {
	name: string;
	muted = false;
	groups = new Map();
	audioList = new Set<HTMLMediaElement>();
	constructor(name: string) {
		this.name = name;
	}

	mute(mute) {
		this.muted = (mute == true);
		for (const audio of this.audioList) {
			audio.muted = this.muted;
		}
	}

	getGroup(groupPath) {
		if (groupPath[0] = this.name) {
			if (groupPath.length == 1) {
				return this;
			}

			let group;
			if (this.groups.has(groupPath[1])) {
				group = this.groups.get(groupPath[1]);
			} else {
				group = this.createSubGroup(groupPath[1]);
			}
			return group.getGroup(groupPath.shift());
		}
	}

	createSubGroup(name) {
		console.log('Creating group ' + name);
		const subGroup = new AudioGroup(name);
		this.groups.set(name, subGroup);
		return subGroup;
	}

	playAudio(audio) {
		audio.muted = this.muted;
		audio.currentTime = 0;
		try {
			audio.play();
		} catch (e) { }
		this.audioList.add(audio);
	}
}
