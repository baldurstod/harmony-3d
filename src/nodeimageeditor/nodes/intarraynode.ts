import { IO_TYPE_ARRAY_INT } from '../inputoutput';
import { NodeImageEditor } from '../nodeimageeditor';
import { NodeParam, NodeParamType } from '../nodeparam';
import { registerOperation } from '../operations';
import { ParametersNode } from './parametersnode';

export class IntArrayNode extends ParametersNode {
	#length: number;
	#array: number[] = [];

	constructor(editor: NodeImageEditor, params?: any) {
		super(editor, params);
		this.#length = params.length ?? 0;
		this.addOutput('output', IO_TYPE_ARRAY_INT);
		for (let i = 0; i < this.#length; ++i) {
			this.#array.push(0);
		}

		this.addParam(new NodeParam('value', NodeParamType.Int, this.#array, this.#length));
	}

	async operate(context: any = {}) {
		const output = this.getOutput('output');
		if (output) {
			output._value = this.#array;
		}
	}

	get title() {
		return 'int array';
	}

	setValue(index: number, value: number) {
		if (index >= this.#length) {
			throw 'wrong index';
		}
		this.#array[index] = value;
		this.invalidate();
	}
}

registerOperation('int array', IntArrayNode);
