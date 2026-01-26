import { DEBUG } from '../../buildoptions';
import { Graphics } from '../../graphics/graphics2';
import { RenderTarget } from '../../textures/rendertarget';
import { Texture } from '../../textures/texture';
import { TextureManager } from '../../textures/texturemanager';
import { GL_LINEAR } from '../../webgl/constants';
import { IO_TYPE_FLOAT, IO_TYPE_TEXTURE_2D } from '../inputoutput';
import { Node, NodeContext } from '../node';
import { NodeImageEditor } from '../nodeimageeditor';
import { NodeImageEditorMaterial } from '../nodeimageeditormaterial';
import { registerOperation } from '../operations';

const MAX_SELECTORS = 16

export class Select extends Node {
	#renderTarget?: RenderTarget;
	#textureSize: number;
	#outputTexture?: Texture;

	constructor(editor: NodeImageEditor, params?: any) {
		super(editor, params);
		this.hasPreview = true;
		this.addInput('input', IO_TYPE_TEXTURE_2D);
		this.addInput('selectvalues', IO_TYPE_FLOAT, MAX_SELECTORS);
		this.addOutput('output', IO_TYPE_TEXTURE_2D);
		this.material = new NodeImageEditorMaterial({ shaderName: 'select' });
		this.material.setDefine('MAX_SELECTORS', String(MAX_SELECTORS));
		this.material.addUser(this);
		this.#textureSize = params.textureSize ?? this.editor.textureSize;
	}

	async operate(context: NodeContext): Promise<void> {
		if (Graphics.isWebGLAny) {
			await this.#operateWebGL(context);
		} else {
			await this.#operateWebGPU(context);
		}
	}

	async #operateWebGL(context: NodeContext) {
		if (false && DEBUG) {
			console.log('Select operate');
		}
		if (!this.material) {
			return;
		}
		this.material.setTexture('uInputTexture', await this.getInput('input')?.getValue(context));
		this.material.uniforms['uSelect[0]'] = await this.getInput('selectvalues')?.getValue(context);

		if (!this.#renderTarget) {
			this.#renderTarget = new RenderTarget({ width: this.#textureSize, height: this.#textureSize, depthBuffer: false, stencilBuffer: false });
		}
		Graphics.pushRenderTarget(this.#renderTarget);
		this.editor.render(this.material, this.#textureSize, this.#textureSize);

		Graphics.popRenderTarget();

		this.updatePreview(context);

		const output = this.getOutput('output');
		if (output) {
			output._value = this.#renderTarget.getTexture();
		}
		if (false && DEBUG) {
			console.log('Select end operate');
		}
	}

	async #operateWebGPU(context: NodeContext): Promise<void> {
		if (!this.material) {
			return;
		}
		this.material.setTexture('inputTexture', await this.getInput('input')?.getValue(context));
		this.material.uniforms['select'] = new Float32Array(await this.getInput('selectvalues')?.getValue(context));

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

		//this.editor.render(this.material, this.#textureSize, this.#textureSize);
		Graphics.compute(this.material, {}, this.#textureSize, this.#textureSize);

		const output = this.getOutput('output');
		if (output) {
			output._value = this.#outputTexture;
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

		const selectvalues = await this.getInput('selectvalues')?.getValue({});
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
