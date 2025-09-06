import { IO_TYPE_FLOAT, IO_TYPE_TEXTURE_2D } from '../inputoutput';
import { Node } from '../node';
import { NodeImageEditorMaterial } from '../nodeimageeditormaterial';
import { DEBUG } from '../../buildoptions';
import { RenderTarget } from '../../textures/rendertarget';
import { GL_UNSIGNED_BYTE, GL_RGBA } from '../../webgl/constants';
import { registerOperation } from '../operations';
import { Graphics } from '../../graphics/graphics';
import { NodeImageEditor } from '../nodeimageeditor';

const MAX_SELECTORS = 16

export class Select extends Node {
	#renderTarget?: RenderTarget;
	#textureSize: number;
	constructor(editor: NodeImageEditor, params?: any) {
		super(editor, params);
		this.hasPreview = true;
		this.addInput('input', IO_TYPE_TEXTURE_2D);
		this.addInput('selectvalues', IO_TYPE_FLOAT, MAX_SELECTORS);
		this.addOutput('output', IO_TYPE_TEXTURE_2D);
		this.material = new NodeImageEditorMaterial({ shaderName: 'select' });
		this.material.setDefine('MAX_SELECTORS', String(MAX_SELECTORS));
		this.material.addUser(this);
		this.#textureSize = params.textureSize;
	}

	async operate(context: any = {}) {
		if (false && DEBUG) {
			console.log('Select operate');
		}
		this.material.setTexture('uInputTexture', await this.getInput('input').value);
		this.material.uniforms['uSelect[0]'] = await this.getInput('selectvalues').value;

		if (!this.#renderTarget) {
			this.#renderTarget = new RenderTarget({ width: this.#textureSize, height: this.#textureSize, depthBuffer: false, stencilBuffer: false });
		}
		Graphics.pushRenderTarget(this.#renderTarget);
		this.editor.render(this.material);

		const pixelArray = new Uint8Array(this.#textureSize * this.#textureSize * 4);
		Graphics.glContext.readPixels(0, 0, this.#textureSize, this.#textureSize, GL_RGBA, GL_UNSIGNED_BYTE, pixelArray);
		Graphics.popRenderTarget();

		this.updatePreview(context);

		this.getOutput('output')._value = this.#renderTarget.getTexture();
		this.getOutput('output')._pixelArray = pixelArray;
		if (false && DEBUG) {
			console.log('Select end operate');
		}
	}

	get title() {
		return 'select';
	}

	async toString(tabs = '') {
		const ret = [];
		const tabs1 = tabs + '\t';
		ret.push(tabs + this.constructor.name);

		for (const input of this.inputs.values()) {
			if (input.getPredecessor()) {
				ret.push(await input.toString(tabs1));
			}
		}

		const selectvalues = await this.getInput('selectvalues').value;
		const a = [];
		for (const v of selectvalues) {
			if (v) {
				a.push(v);
			}
		}
		ret.push(tabs1 + 'values : ' + a.join(' '));

		return ret.join('\n');
	}

	dispose() {
		super.dispose();
		if (this.#renderTarget) {
			this.#renderTarget.dispose();
		}
		if (this.material) {
			this.material.removeUser(this);
		}
	}
}
registerOperation('select', Select);
