import { ParametersNode } from './parametersnode';
import { IO_TYPE_ARRAY_FLOAT } from '../inputoutput';
import { NODE_PARAM_TYPE_FLOAT } from '../node';
import { registerOperation } from '../operations';

export class FloatArrayNode extends ParametersNode {
	#length;
	#array = [];
	constructor(editor, params) {
		super(editor, params);
		this.#length = params.length ?? 0;
		this.addOutput('output', IO_TYPE_ARRAY_FLOAT);
		for (let i = 0; i < this.#length; ++i) {
			this.#array.push(0);
		}

		this.addParam('value', NODE_PARAM_TYPE_FLOAT, this.#array, this.#length);
	}

	async operate() {
		this.getOutput('output')._value = this.#array;
	}

	get title() {
		return 'float array';
	}

	setValue(index, value) {
		if (index >= this.#length) {
			throw 'wrong index';
		}
		this.#array[index] = value;
		this.invalidate();
	}
}

registerOperation('float array', FloatArrayNode);