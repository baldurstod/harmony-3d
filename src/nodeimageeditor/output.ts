import { InputOutput, InputOutputType, IO_TYPE_TEXTURE_2D } from './inputoutput';
import { Node } from './node';

export class Output extends InputOutput {
	#successors = new Set<InputOutput>();
	#pixelArray?: Uint8Array;

	get value() {
		return this.getValue();
	}

	getValue() {
		const valuePromise = new Promise(async (resolve, reject) => {
			await this.node.validate();
			if (this.type == IO_TYPE_TEXTURE_2D) {
				resolve(this._value);
			} else {
				resolve(this._value);
			}
		}
		);
		return valuePromise;
	}

	get pixelArray() {
		return this.getPixelArray();
	}

	getPixelArray(): Promise<Uint8Array | null> {
		const valuePromise = new Promise<Uint8Array | null>(async (resolve, reject) => {
			await this.node.validate();
			if (this.type == InputOutputType.Texture2D) {
				resolve(this.#pixelArray ?? null);
			} else {
				//TODO: this should resolve to something else
				resolve(this.#pixelArray ?? null);
			}
		}
		);
		return valuePromise;
	}

	addSuccessor(successor: InputOutput) {
		this.#successors.add(successor);
	}

	removeSuccessor(successor: InputOutput) {
		this.#successors.delete(successor);
	}

	hasSuccessor() {
		return this.#successors.size > 0;
	}

	successorsLength() {
		let max = 0;
		for (const successor of this.#successors) {
			const l = successor.node.successorsLength() + 1;
			if (l > max) {
				max = l;
			}
		}
		return max;
	}

	invalidate() {
		for (const successor of this.#successors) {
			successor.node.invalidate();
		}
	}

	/*
	draw(glContext) {
		if (this.node) {
			this.node.draw(glContext);
		}
	}
	*/

	getType() {
		if (this.node) {
			return this.node.getType();
		}
		return null;
	}

	isValid(startingPoint: Node) {
		if (this.node) {
			return this.node.isValid(startingPoint);
		}
		return false;
	}

	async toString(tabs = '') {
		return await this.node.toString(tabs);
	}

	dispose() {
		this.#pixelArray = undefined;
	}
}
