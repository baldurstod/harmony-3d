export class Source2Sequence {
	name: string;
	fps: number;
	frameCount: number;
	activities;
	animNames;

	constructor(name, params: any = {}) {
		this.name = name;
		this.fps = params.fps ?? 30;
		this.frameCount = params.frameCount ?? 0;

		if (params.activities) {
			this.activities = params.activities;
		}
		if (params.animNames) {
			this.animNames = params.animNames;
		}
	}

	matchActivity(activity: string, modifiers: string[]) {
		if (modifiers) {
			if (this.activities.length == modifiers.size + 1) {
				if (this.activities[0].name == activity) {
					let matchCount = 0;
					for (let i = 1; i < this.activities.length; i++) {
						for (const modifier of modifiers) {
							if (this.activities[i] == modifier) {
								++matchCount;
							}
						}
					}
					if (matchCount == modifiers.size) {
						return true;
					}
				}
			}
			return false;
		} else {
			if (this.activities[0]?.name == activity) {
				return true;
			}
		}
	}
}
