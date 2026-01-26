import { InputOutput, InputOutputType } from './inputoutput';
import { Node, NodeContext } from './node';
import { Output } from './output';

//const isUndefined = (element) => element == undefined;

export class Input extends InputOutput {
	#predecessor?: Output;

	constructor(node: Node, id: string, type: InputOutputType, size = 1) {
		super(node, id, type, size);
	}

	setValue(value: any) {
		//TODO: check the value type
		this._value = value;
		this.node.invalidate();
	}
	/*
	setArrayValue(value, index) {
		if (index == undefined) {
			index = this._value.findIndex(isUndefined)
			if (index == -1) {
				return;
			}
		}

		//TODOv3 check type / index
		this._value[index] = value;
		this.node.invalidate();
	}*/

	setPredecessor(predecessor: Output) {
		if (predecessor) {
			predecessor.addSuccessor(this);
		}

		if (this.#predecessor && !predecessor) {
			this.#predecessor.removeSuccessor(this);
		}

		this.#predecessor = predecessor;
		this.node.invalidate();
	}

	getPredecessor() {
		return this.#predecessor;
	}

	/* TODO:remove
	draw(glContext) {
		if (this.#predecessor) {
			this.#predecessor.draw(glContext);
		}
	}

	getInputTexture(defaultWhite) {
		if (this.#predecessor) {
			return this.#predecessor.outputTexture;
		}
	}
	*/

	hasPredecessor() {
		return this.#predecessor ? true : false;
	}

	getType() {
		if (this.#predecessor) {
			return this.#predecessor.getType();
		}
		return null;
	}

	async getValue(context: NodeContext): Promise<any | null> {
		if (this.#predecessor) {
			return this.#predecessor.getValue(context);
		}
		return null;
	}

	isValid(startingPoint: Node): boolean {
		if (this.#predecessor) {
			return this.#predecessor.isValid(startingPoint);
		}
		return true;//TODO: check input mandatory
	}

	async toString(tabs = ''): Promise<string> {
		const ret = [];
		const tabs1 = tabs + '\t';
		ret.push(tabs + 'id : ' + this.id);
		if (this.#predecessor) {
			ret.push(await this.#predecessor.toString(tabs1));
		} else {
			console.error('no predecessor : ', this);
		}
		return ret.join('\n');
	}
}
