import { IO_TYPE_TEXTURE_2D, } from '../inputoutput';
import { Node } from '../node';
import { NodeImageEditorMaterial } from '../nodeimageeditormaterial';
import { DEBUG } from '../../buildoptions';
import { RenderTarget } from '../../textures/rendertarget';
import { registerOperation } from '../operations';
import { Graphics } from '../../graphics/graphics';
import { NodeImageEditor } from '../nodeimageeditor';

export class Multiply extends Node {
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
		this.material = new NodeImageEditorMaterial({ shaderName: 'multiply' });
		this.material.addUser(this);
		this.#textureSize = params.textureSize;
	}

	async operate() {
		if (false && DEBUG) {
			console.log('Multiply operate');
		}
		let textureArray = [];
		let usedArray = [];
		for (let i = 0; i < 8; ++i) {
			//let inputName = 'uInput' + i;
			//this.material.uniforms['uInput' + i] = await this.getInput('input' + i).value;
			let texture = await this.getInput('input' + i).value;
			textureArray.push(texture);
			usedArray.push(texture != undefined);
		}

		//this.material.uniforms['uInput[0]'] = await this.getInput('input').value;
		this.material.setTextureArray('uInput[0]', textureArray);
		this.material.uniforms['uUsed[0]'] = usedArray;
		//this.material.uniforms['uInput1'] = await this.getInput('input1').value;

		if (!this.#renderTarget) {
			this.#renderTarget = new RenderTarget({ width: this.#textureSize, height: this.#textureSize, depthBuffer: false, stencilBuffer: false, texture: this.getOutput('output')._value });
		}

		Graphics.pushRenderTarget(this.#renderTarget);
		this.editor.render(this.material);

		//let pixelArray = new Uint8Array(this.#textureSize * this.#textureSize * 4);
		//Graphics.glContext.readPixels(0, 0, this.#textureSize, this.#textureSize, GL_RGBA, GL_UNSIGNED_BYTE, pixelArray);
		Graphics.popRenderTarget();

		this.updatePreview();



		this.getOutput('output')._value = this.#renderTarget.getTexture();
		//this.getOutput('output')._pixelArray = pixelArray;
		if (false && DEBUG) {
			console.log('Multiply end operate');
		}
	}

	get title() {
		return 'multiply';
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
registerOperation('multiply', Multiply);
