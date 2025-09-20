class SpriteSheetCoord {
	uMin = 0;
	vMin = 0;
	uMax = 0;
	vMax = 0;
}

class SpriteSheetFrame {
	readonly coords: SpriteSheetCoord[] = [];
	duration = 0;

	addCoord(): SpriteSheetCoord {
		const coord = new SpriteSheetCoord();
		this.coords.push(coord);
		return coord;
	}
}

class SpriteSheetSequence {
	readonly frames: SpriteSheetFrame[] = [];
	duration = 0;

	addFrame(): SpriteSheetFrame {
		const frame = new SpriteSheetFrame();
		this.frames.push(frame);
		return frame;
	}
}

export class SpriteSheet {
	readonly sequences: SpriteSheetSequence[] = [];

	addSequence(): SpriteSheetSequence {
		const sequence = new SpriteSheetSequence();
		this.sequences.push(sequence);
		return sequence;
	}

	/*
	getFrame(sequenceId: number, frame: number, channel = 0): SpriteSheetCoord | null {
		return this.sequences[sequenceId]?.frames[frame]?.coords[channel] ?? null;
	}
	*/


	getFrame(sequenceId: number, frame: number, channel = 0): SpriteSheetCoord | null {
		const sequence = this.sequences[sequenceId] ?? this.sequences[0];
		if (sequence) {
			frame = (frame % sequence.frames.length) << 0;
			return sequence.frames[frame]?.coords[channel] ?? null;
		}
		return null;
	}
}
