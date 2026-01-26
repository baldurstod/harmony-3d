import { InputOutput, IO_TYPE_TEXTURE_2D } from './inputoutput';
import { Node, NodeContext } from './node';

export class Output extends InputOutput {
	#successors = new Set<InputOutput>();

	getValue(context: NodeContext) {
		const valuePromise = new Promise(async resolve => {
			await this.node.validate(context);
			if (this.type == IO_TYPE_TEXTURE_2D) {
				resolve(this._value);
			} else {
				resolve(this._value);
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
	}
}
