import { DEBUG } from '../../buildoptions';
import { Graphics } from '../../graphics/graphics2';
import { RenderTarget } from '../../textures/rendertarget';
import { Texture } from '../../textures/texture';
import { TextureManager } from '../../textures/texturemanager';
import { GL_LINEAR, GL_RGBA, GL_UNSIGNED_BYTE } from '../../webgl/constants';
import { IO_TYPE_TEXTURE_2D } from '../inputoutput';
import { Node, NodeContext } from '../node';
import { NodeImageEditor } from '../nodeimageeditor';
import { NodeImageEditorMaterial } from '../nodeimageeditormaterial';
import { NodeParam, NodeParamType } from '../nodeparam';
import { registerOperation } from '../operations';

export class CombineLerp extends Node {
	#renderTarget?: RenderTarget;
	#textureSize: number;
	#outputTexture?: Texture;

	constructor(editor: NodeImageEditor, params?: any) {
		super(editor, params);
		this.hasPreview = true;
		this.addInput('input0', IO_TYPE_TEXTURE_2D);
		this.addInput('input1', IO_TYPE_TEXTURE_2D);
		this.addInput('weight', IO_TYPE_TEXTURE_2D);
		this.addOutput('output', IO_TYPE_TEXTURE_2D);
		this.material = new NodeImageEditorMaterial({ shaderName: 'combine_lerp' });
		this.material.addUser(this);
		this.#textureSize = params.textureSize ?? this.editor.textureSize;

		this.addParam(new NodeParam('adjust black', NodeParamType.Float, 0.0));
		this.addParam(new NodeParam('adjust white', NodeParamType.Float, 1.0));
		this.addParam(new NodeParam('adjust gamma', NodeParamType.Float, 1.0));
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
		this.material.setTexture('uInput0', await this.getInput('input0')?.value);
		this.material.setTexture('uInput1', await this.getInput('input1')?.value);
		this.material.setTexture('uInputWeight', await this.getInput('weight')?.value);

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
		if (false && DEBUG) {
			console.log('CombineLerp end operate');
		}
	}

	async #operateWebGPU(context: NodeContext): Promise<void> {
		if (!this.material) {
			return;
		}

		this.material.setTexture('input0', await this.getInput('input0')?.value);
		this.material.setTexture('input1', await this.getInput('input1')?.value);
		this.material.setTexture('inputWeight', await this.getInput('weight')?.value);

		if (!this.#outputTexture) {
			this.#outputTexture = TextureManager.createTexture({
				webgpuDescriptor: {
					size: {
						width: this.#textureSize,
						height: this.#textureSize,
					},
					format: 'rgba8unorm',
					visibility: GPUShaderStage.COMPUTE,
					usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING,
				},
				minFilter: GL_LINEAR,
			});
		}

		this.material.uniforms['outTexture'] = this.#outputTexture;

		Graphics.compute(this.material, {}, this.#textureSize, this.#textureSize);

		const output = this.getOutput('output');
		if (output) {
			output._value = this.#outputTexture;
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
