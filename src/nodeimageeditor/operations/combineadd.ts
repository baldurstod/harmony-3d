import { DEBUG } from '../../buildoptions';
import { Graphics } from '../../graphics/graphics2';
import { RenderTarget } from '../../textures/rendertarget';
import { GL_RGBA, GL_UNSIGNED_BYTE } from '../../webgl/constants';
import { IO_TYPE_TEXTURE_2D } from '../inputoutput';
import { Node, NodeContext } from '../node';
import { NodeImageEditor } from '../nodeimageeditor';
import { NodeImageEditorMaterial } from '../nodeimageeditormaterial';
import { registerOperation } from '../operations';

export class CombineAdd extends Node {
	#renderTarget?: RenderTarget;
	#textureSize: number;
	constructor(editor: NodeImageEditor, params?: any) {
		super(editor, params);
		this.hasPreview = true;

		for (let i = 0; i < 8; ++i) {
			this.addInput('input' + i, IO_TYPE_TEXTURE_2D);
		}
		//this.addInput('input', IO_TYPE_TEXTURE_2D, 8);
		this.addOutput('output', IO_TYPE_TEXTURE_2D);
		this.material = new NodeImageEditorMaterial({ shaderName: 'combine_add' });
		this.material.addUser(this);
		this.#textureSize = params.textureSize;
	}


	async operate(context: NodeContext = {}) {
		if (!this.material) {
			return;
		}
		/*let input1 = this.getInput('input1').value;
		let input2 = this.getInput('input2').value;
		let input3 = this.getInput('input3').value;
		let input4 = this.getInput('input4').value;
		let input5 = this.getInput('input5').value;*/


		/*this.material.uniforms['uInput1'] = input1;
		this.material.uniforms['uInput2'] = input2;
		this.material.uniforms['uInput3'] = input3;
		this.material.uniforms['uInput4'] = input4;
		this.material.uniforms['uInput5'] = input5;*/

		//this.material.uniforms['uInput[0]'] = await this.getInput('input').value;

		const textureArray = [];
		for (let i = 0; i < 8; ++i) {
			textureArray.push(await this.getInput('input' + i)?.value);
		}
		this.material.setTextureArray('uInput[0]', textureArray);

		if (!this.#renderTarget) {
			this.#renderTarget = new RenderTarget({ width: this.#textureSize, height: this.#textureSize, depthBuffer: false, stencilBuffer: false });
		}
		Graphics.pushRenderTarget(this.#renderTarget);
		this.editor.render(this.material, this.#textureSize, this.#textureSize);

		const pixelArray = new Uint8Array(this.#textureSize * this.#textureSize * 4);
		Graphics.glContext.readPixels(0, 0, this.#textureSize, this.#textureSize, GL_RGBA, GL_UNSIGNED_BYTE, pixelArray);
		Graphics.popRenderTarget();


		this.updatePreview(context);

		const output = this.getOutput('output');
		if (output) {
			output._value = this.#renderTarget.getTexture();
			output._pixelArray = pixelArray;
		}
		if (DEBUG) {
			console.error('CombineAdd end operate');
		}
	}

	get title() {
		return 'combine add';
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
registerOperation('combine_add', CombineAdd);
