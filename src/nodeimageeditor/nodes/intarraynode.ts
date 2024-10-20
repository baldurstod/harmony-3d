import { ParametersNode } from './parametersnode';
import { IO_TYPE_ARRAY_INT } from '../inputoutput';
import { registerOperation } from '../operations';
import { NodeParam, NodeParamType } from '../nodeparam';

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

		this.addParam(new NodeParam('value', NodeParamType.Int, this.#array, this.#length));
	}

	async operate(context: any = {}) {
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
