import { ParametersNode } from './parametersnode';
import { IO_TYPE_ARRAY_INT } from '../inputoutput';
import { NODE_PARAM_TYPE_INT } from '../node';
import { registerOperation } from '../operations';

export class IntArrayNode extends ParametersNode {
	#length;
	#array = [];
	constructor(editor, params) {
		super(editor, params);
		this.#length = params.length ?? 0;
		this.addOutput('output', IO_TYPE_ARRAY_INT);
		for (let i = 0; i < this.#length; ++i) {
			this.#array.push(0);
		}

		this.addParam('value', NODE_PARAM_TYPE_INT, this.#array, this.#length);
	}

	async operate() {
		this.getOutput('output')._value = this.#array;
	}

	get title() {
		return 'int array';
	}

	setValue(index, value) {
		if (index >= this.#length) {
			throw 'wrong index';
		}
		this.#array[index] = value;
		this.invalidate();
	}
}

registerOperation('int array', IntArrayNode);
