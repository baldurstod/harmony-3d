import { Texture } from './texture';

export class AnimatedTexture extends Texture {
	frames: Texture[] = [];

	addFrame(frame: number, texture: Texture): void {
		this.frames[frame] = texture;
		texture.addUser(this);
	}

	getFrame(frame: number): Texture | undefined {
		frame = Math.floor(frame) % this.frames.length;
		return this.frames[frame];//TODOv3 handle missing textures
	}

	hasOnlyUser(user: any): boolean {
		if (!super.hasOnlyUser(user)) {
			return false;
		}

		for (const frame of this.frames) {
			if (!frame.hasOnlyUser(this)) {
				return false;
			}
		}
		return true;
	}

	dispose(): void {
		if (this.hasNoUser()) {
			// Check if frames have other users
			for (const frame of this.frames) {
				if (!frame.hasOnlyUser(this)) {
					return;
				}
			}
			super.dispose();
			this.frames.forEach(frame => frame.removeUser(this));
		}
	}
}
