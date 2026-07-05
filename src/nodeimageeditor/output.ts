import { InputOutput, InputOutputType } from './inputoutput';
import { Node, NodeContext } from './node';

export class Output extends InputOutput {
	#successors = new Set<InputOutput>();

	getValue(context: NodeContext): Promise<unknown> {
		// eslint-disable-next-line @typescript-eslint/no-misused-promises
		const valuePromise = new Promise(async resolve => {
			await this.node.validate(context);
			if (this.type == InputOutputType.Texture2D) {
				resolve(this._value);
			} else {
				resolve(this._value);
			}
		}
		);
		return valuePromise;
	}

	addSuccessor(successor: InputOutput): void {
		this.#successors.add(successor);
	}

	removeSuccessor(successor: InputOutput): void {
		this.#successors.delete(successor);
	}

	hasSuccessor(): boolean {
		return this.#successors.size > 0;
	}

	successorsLength(): number {
		let max = 0;
		for (const successor of this.#successors) {
			const l = successor.node.successorsLength() + 1;
			if (l > max) {
				max = l;
			}
		}
		return max;
	}

	invalidate(): void {
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

	getType(): void | null {
		if (this.node) {
			return this.node.getType();
		}
		return null;
	}

	isValid(startingPoint: Node): boolean {
		if (this.node) {
			return this.node.isValid(startingPoint);
		}
		return false;
	}

	async toString(tabs = ''): Promise<string> {
		return await this.node.toString(tabs);
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	dispose(): void {
	}
}
