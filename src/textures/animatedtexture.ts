import { Texture } from './texture';

export class AnimatedTexture extends Texture {
	frames: Array<Texture> = [];

	addFrame(frame: number, texture: Texture) {
		this.frames[frame] = texture;
		texture.addUser(this);
	}

	getFrame(frame: number) {
		frame = frame % this.frames.length;
		return this.frames[frame];//TODOv3 handle missing textures
	}

	hasOnlyUser(user: any) {
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

	dispose() {
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
