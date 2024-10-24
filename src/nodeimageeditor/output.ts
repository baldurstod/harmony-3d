import { InputOutput, IO_TYPE_TEXTURE_2D } from './inputoutput';

export class Output extends InputOutput {
	successors = new Set<InputOutput>();
	_pixelArray?: Uint8Array;

	get value() {
		return this.getValue();
	}

	getValue() {
		let valuePromise = new Promise(async (resolve, reject) => {
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
		let valuePromise = new Promise(async (resolve, reject) => {
			await this.node.validate();
			if (this.type == IO_TYPE_TEXTURE_2D) {
				resolve(this._pixelArray);
			} else {
				resolve(this._pixelArray);
			}
		}
		);
		return valuePromise;
	}

	addSuccessor(successor) {
		this.successors.add(successor);
	}

	removeSuccessor(successor) {
		this.successors.delete(successor);
	}

	hasSuccessor() {
		return this.successors.size > 0;
	}

	successorsLength() {
		let max = 0;
		for (let successor of this.successors) {
			let l = successor.node.successorsLength() + 1;
			if (l > max) {
				max = l;
			}
		}
		return max;
	}

	invalidate() {
		for (let successor of this.successors) {
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

	isValid(startingPoint) {
		if (this.node) {
			return this.node.isValid(startingPoint);
		}
		return false;
	}

	getPixelArray() {

	}

	async toString(tabs = '') {
		return await this.node.toString(tabs);
	}

	dispose() {
		delete this._pixelArray;
	}
}
