export class Rig {
	#bones = new Map<string, string>();

	constructor(bones?: [string, string][] | Map<string, string> | Record<string, string>) {
		if (bones) {
			this.setBones(bones);
		}
	}

	setBone(source: string, target: string): void {
		this.#bones.set(source, target);
	}

	setBones(bones: [string, string][] | Map<string, string> | Record<string, string>): void {
		if (Array.isArray(bones) || bones instanceof Map) {
			for (const [source, target] of bones) {
				this.setBone(source, target);
			}
		} else {
			for (const source in bones) {
				const target = bones[source]!;
				this.setBone(source, target);
			}
		}
	}

	getTarget(source: string): string | undefined {
		return this.#bones.get(source);
	}
}
