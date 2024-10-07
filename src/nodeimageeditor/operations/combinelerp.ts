import { IO_TYPE_TEXTURE_2D } from '../inputoutput';
import { Node, NODE_PARAM_TYPE_FLOAT } from '../node';
import { NodeImageEditorMaterial } from '../nodeimageeditormaterial';
import { DEBUG } from '../../buildoptions';
import { RenderTarget } from '../../textures/rendertarget';
import { GL_UNSIGNED_BYTE, GL_RGBA } from '../../webgl/constants';
import { registerOperation } from '../operations';
import { Graphics } from '../../graphics/graphics';
import { NodeImageEditor } from '../nodeimageeditor';

export class CombineLerp extends Node {
	#renderTarget?: RenderTarget;
	#textureSize: number;
	constructor(editor: NodeImageEditor, params?: any) {
		super(editor, params);
		this.hasPreview = true;
		this.addInput('input0', IO_TYPE_TEXTURE_2D);
		this.addInput('input1', IO_TYPE_TEXTURE_2D);
		this.addInput('weight', IO_TYPE_TEXTURE_2D);
		this.addOutput('output', IO_TYPE_TEXTURE_2D);
		this.material = new NodeImageEditorMaterial({ shaderName: 'combine_lerp' });
		this.material.addUser(this);
		this.#textureSize = params.textureSize;

		this.addParam('adjust black', NODE_PARAM_TYPE_FLOAT, 0.0);
		this.addParam('adjust white', NODE_PARAM_TYPE_FLOAT, 1.0);
		this.addParam('adjust gamma', NODE_PARAM_TYPE_FLOAT, 1.0);
	}

	async operate() {
		if (false && DEBUG) {
			console.log('CombineLerp operate');
		}
		this.material.setTexture('uInput0', await this.getInput('input0').value);
		this.material.setTexture('uInput1', await this.getInput('input1').value);
		this.material.setTexture('uInputWeight', await this.getInput('weight').value);

		if (!this.#renderTarget) {
			this.#renderTarget = new RenderTarget({ width: this.#textureSize, height: this.#textureSize, depthBuffer: false, stencilBuffer: false });
		}
		Graphics.pushRenderTarget(this.#renderTarget);
		this.editor.render(this.material);

		let pixelArray = new Uint8Array(this.#textureSize * this.#textureSize * 4);
		Graphics.glContext.readPixels(0, 0, this.#textureSize, this.#textureSize, GL_RGBA, GL_UNSIGNED_BYTE, pixelArray);
		Graphics.popRenderTarget();


		this.updatePreview();

		this.getOutput('output')._value = this.#renderTarget.getTexture();
		this.getOutput('output')._pixelArray = pixelArray;
		if (false && DEBUG) {
			console.log('CombineLerp end operate');
		}
	}

	get title() {
		return 'combine lerp';
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
registerOperation('combine_lerp', CombineLerp);