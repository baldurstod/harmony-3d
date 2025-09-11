import { IO_TYPE_ARRAY_FLOAT } from '../inputoutput';
import { NodeImageEditor } from '../nodeimageeditor';
import { NodeParam, NodeParamType } from '../nodeparam';
import { registerOperation } from '../operations';
import { ParametersNode } from './parametersnode';

export class FloatArrayNode extends ParametersNode {
	#length;
	#array: number[] = [];

	constructor(editor: NodeImageEditor, params?: any) {
		super(editor, params);
		this.#length = params.length ?? 0;
		this.addOutput('output', IO_TYPE_ARRAY_FLOAT);
		for (let i = 0; i < this.#length; ++i) {
			this.#array.push(0);
		}

		this.addParam(new NodeParam('value', NodeParamType.Float, this.#array, this.#length));
	}

	async operate(context: any = {}) {
		const output = this.getOutput('output');
		if (output) {
			output._value = this.#array;
		}
	}

	get title() {
		return 'float array';
	}

	setValue(index: number, value: number) {
		if (index >= this.#length) {
			throw 'wrong index';
		}
		this.#array[index] = value;
		this.invalidate();
	}
}

registerOperation('float array', FloatArrayNode);
