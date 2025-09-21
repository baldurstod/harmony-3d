export class SpriteSheetCoord {
	uMin = 0;
	vMin = 0;
	uMax = 0;
	vMax = 0;
}

export class SpriteSheetFrame {
	readonly coords: SpriteSheetCoord[] = [];
	duration = 0;

	addCoord(): SpriteSheetCoord {
		const coord = new SpriteSheetCoord();
		this.coords.push(coord);
		return coord;
	}
}

export class SpriteSheetSequence {
	readonly frames: SpriteSheetFrame[] = [];
	duration = 0;
	clamp = false;

	addFrame(): SpriteSheetFrame {
		const frame = new SpriteSheetFrame();
		this.frames.push(frame);
		return frame;
	}

	getFrame(frame: number, channel = 0): SpriteSheetCoord | null {
		if (this.clamp) {
			frame = Math.min(frame, this.frames.length - 1);
		} else {
			frame = (frame % this.frames.length) << 0;
		}
		return this.frames[frame]?.coords[channel] ?? null;
	}
}

export class SpriteSheet {
	readonly sequences: SpriteSheetSequence[] = [];

	addSequence(): SpriteSheetSequence {
		const sequence = new SpriteSheetSequence();
		this.sequences.push(sequence);
		return sequence;
	}

	getFrame(sequenceId: number, frame: number, channel = 0): SpriteSheetCoord | null {
		const sequence = this.sequences[sequenceId] ?? this.sequences[0];
		if (sequence) {
			if (sequence.clamp) {
				frame = Math.min(frame, sequence.frames.length - 1);
			} else {
				frame = (frame % sequence.frames.length) << 0;
			}
			return sequence.frames[frame]?.coords[channel] ?? null;
		}
		return null;
	}
}
