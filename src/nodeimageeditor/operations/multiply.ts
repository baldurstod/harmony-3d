import { DEBUG } from '../../buildoptions';
import { Graphics } from '../../graphics/graphics2';
import { RenderTarget } from '../../textures/rendertarget';
import { Texture } from '../../textures/texture';
import { TextureManager } from '../../textures/texturemanager';
import { GL_LINEAR } from '../../webgl/constants';
import { IO_TYPE_TEXTURE_2D, } from '../inputoutput';
import { Node, NodeContext } from '../node';
import { NodeImageEditor } from '../nodeimageeditor';
import { NodeImageEditorMaterial } from '../nodeimageeditormaterial';
import { registerOperation } from '../operations';

export class Multiply extends Node {
	#renderTarget?: RenderTarget;
	#textureSize: number;
	#outputTexture?: Texture;

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
		this.#textureSize = params.textureSize ?? this.editor.textureSize;
	}

	async operate(context: NodeContext = {}): Promise<void> {
		if (Graphics.isWebGLAny) {
			await this.#operateWebGL(context);
		} else {
			await this.#operateWebGPU(context);
		}
	}

	async #operateWebGL(context: NodeContext = {}) {
		if (!this.material) {
			return;
		}

		const textureArray: Texture[] = [];
		const usedArray = [];
		for (let i = 0; i < 8; ++i) {
			//let inputName = 'uInput' + i;
			//this.material.uniforms['uInput' + i] = await this.getInput('input' + i).value;
			const texture = await this.getInput('input' + i)?.value;
			textureArray.push(texture);
			usedArray.push(texture != undefined);
		}

		//this.material.uniforms['uInput[0]'] = await this.getInput('input').value;
		this.material.setTextureArray('uInput[0]', textureArray);
		this.material.uniforms['uUsed[0]'] = usedArray;
		//this.material.uniforms['uInput1'] = await this.getInput('input1').value;

		if (!this.#renderTarget) {
			this.#renderTarget = new RenderTarget({ width: this.#textureSize, height: this.#textureSize, depthBuffer: false, stencilBuffer: false });
		}

		Graphics.pushRenderTarget(this.#renderTarget);
		this.editor.render(this.material, this.#textureSize, this.#textureSize);

		//let pixelArray = new Uint8Array(this.#textureSize * this.#textureSize * 4);
		//Graphics.glContext.readPixels(0, 0, this.#textureSize, this.#textureSize, GL_RGBA, GL_UNSIGNED_BYTE, pixelArray);
		Graphics.popRenderTarget();

		this.updatePreview(context);


		const output = this.getOutput('output');
		if (output) {
			output._value = this.#renderTarget.getTexture();
		}
		//this.getOutput('output')._pixelArray = pixelArray;
		if (false && DEBUG) {
			console.log('Multiply end operate');
		}
	}

	async #operateWebGPU(context: NodeContext): Promise<void> {
		if (!this.material) {
			return;
		}

		//const textureArray: Texture[] = [];
		//const usedArray = new Uint32Array(8);
		let inputCount = 0;
		for (let i = 0; i < 8; ++i) {
			const texture = await this.getInput('input' + i)?.value;
			//textureArray.push(texture);
			//usedArray[i] = texture != undefined ? 1 : 0;//.push(texture != undefined);

			//this.material.setTexture(`inputTexture${i}`, texture);
			if (texture) {
				this.material.uniforms[`input${inputCount}Texture`] = texture;
				++inputCount;

			}

		}

		//this.material.uniforms['used'] = new Int32Array(usedArray);

		if (!this.#outputTexture) {
			this.#outputTexture = TextureManager.createTexture({
				webgpuDescriptor: {
					size: {
						width: this.#textureSize,
						height: this.#textureSize,
					},
					format: 'rgba8unorm',
					visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
					usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING,
				},
				minFilter: GL_LINEAR,
			});
		}

		this.material.uniforms['outTexture'] = this.#outputTexture;
		this.material.setDefine('INPUT_COUNT', String(inputCount));

		//Graphics.compute(this.material, {}, this.#textureSize, this.#textureSize);
		this.editor.render(this.material, this.#textureSize, this.#textureSize);

		const output = this.getOutput('output');
		if (output) {
			output._value = this.#outputTexture;
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
