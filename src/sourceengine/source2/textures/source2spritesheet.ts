import { vec4 } from 'gl-matrix';

class Source2SpriteSheetFrame {
	coords = vec4.create();
	duration = 0;
}

class Source2SpriteSheetSequence {
	duration = 0;
	frames: Array<Source2SpriteSheetFrame> = [];

	addFrame() {
		let frame = new Source2SpriteSheetFrame();
		this.frames.push(frame);
		return frame;
	}
}

export class Source2SpriteSheet {
	sequences: Array<Source2SpriteSheetSequence> = [];

	addSequence(): Source2SpriteSheetSequence {
		let sequence = new Source2SpriteSheetSequence();
		this.sequences.push(sequence);
		return sequence;
	}

	getFrame(sequenceId, frame): Source2SpriteSheetFrame {
		let sequence = this.sequences[sequenceId] ?? this.sequences[0];
		if (sequence) {
			frame = (frame % sequence.frames.length) << 0;
			return sequence.frames[frame];
		}
		return null;
	}
}
