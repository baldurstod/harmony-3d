import { mat3, vec2, vec4 } from 'gl-matrix';
import { Graphics } from '../../graphics/graphics2';
import { RenderTarget } from '../../textures/rendertarget';
import { Texture } from '../../textures/texture';
import { TextureManager } from '../../textures/texturemanager';
import { GL_LINEAR } from '../../webgl/constants';
import { IO_TYPE_TEXTURE_2D } from '../inputoutput';
import { Node, NodeContext } from '../node';
import { NodeImageEditor } from '../nodeimageeditor';
import { NodeImageEditorMaterial } from '../nodeimageeditormaterial';
import { NodeParam, NodeParamType } from '../nodeparam';
import { registerOperation } from '../operations';

const tempVec2 = vec2.create();

export class TextureLookup extends Node {
	#renderTarget?: RenderTarget;
	#textureSize: number;
	inputTexture: Texture | null = null;
	#outputTexture?: Texture;

	constructor(editor: NodeImageEditor, params?: any) {
		super(editor, params);
		this.hasPreview = true;
		this.addOutput('output', IO_TYPE_TEXTURE_2D);
		this.material = new NodeImageEditorMaterial({ shaderName: 'texturelookup' });
		this.material.setDefine('TRANSFORM_TEX_COORD');
		this.material.addUser(this);
		this.#textureSize = params.textureSize ?? this.editor.textureSize;

		/*this.params.adjustBlack = 0;
		this.params.adjustWhite = 1.0;
		this.params.adjustGamma = 1.0;
		this.params.rotation = 0.0;
		this.params.translateU = 0.0;
		this.params.translateV = 0.0;
		this.params.scaleU = 1.0;
		this.params.scaleV = 1.0;*/

		this.addParam(new NodeParam('adjust black', NodeParamType.Float, 0.0));
		this.addParam(new NodeParam('adjust white', NodeParamType.Float, 1.0));
		this.addParam(new NodeParam('adjust gamma', NodeParamType.Float, 1.0));
		this.addParam(new NodeParam('rotation', NodeParamType.Radian, 0.0));
		this.addParam(new NodeParam('translate u', NodeParamType.Float, 0.0));
		this.addParam(new NodeParam('translate v', NodeParamType.Float, 0.0));
		this.addParam(new NodeParam('scale u', NodeParamType.Float, 1.0));
		this.addParam(new NodeParam('scale v', NodeParamType.Float, 1.0));
		this.addParam(new NodeParam('path', NodeParamType.String, ''));
	}

	async operate(context: NodeContext = {}): Promise<void> {
		if (Graphics.isWebGLAny) {
			await this.#operateWebGL(context);
		} else {
			await this.#operateWebGPU(context);
		}
	}

	async #operateWebGL(context: NodeContext): Promise<void> {
		if (!this.material) {
			return;
		}
		this.material.setTexture('uInput', this.inputTexture);
		this.material.uniforms['uAdjustLevels'] = vec4.fromValues(this.getValue('adjust black') as number, this.getValue('adjust white') as number, this.getValue('adjust gamma') as number, 0.0);

		const texTransform = mat3.create();
		mat3.rotate(texTransform, texTransform, this.getValue('rotation') as number);
		mat3.scale(texTransform, texTransform, vec2.set(tempVec2, this.getValue('scale u') as number, this.getValue('scale v') as number));
		mat3.translate(texTransform, texTransform, vec2.set(tempVec2, this.getValue('translate u') as number, this.getValue('translate v') as number));
		this.material.uniforms['uTransformTexCoord0'] = texTransform;

		//console.error(this.params, this.testing);

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
	}

	async #operateWebGPU(context: NodeContext): Promise<void> {
		if (!this.material) {
			return;
		}
		this.material.setTexture('inputTexture', this.inputTexture);
		this.material.uniforms['adjustLevels'] = vec4.fromValues(this.getValue('adjust black') as number, this.getValue('adjust white') as number, this.getValue('adjust gamma') as number, 0.0);

		const texTransform = mat3.create();
		mat3.rotate(texTransform, texTransform, this.getValue('rotation') as number);
		mat3.scale(texTransform, texTransform, vec2.set(tempVec2, this.getValue('scale u') as number, this.getValue('scale v') as number));
		mat3.translate(texTransform, texTransform, vec2.set(tempVec2, this.getValue('translate u') as number, this.getValue('translate v') as number));
		this.material.uniforms['transformTexCoord0'] = texTransform;

		if (!this.#outputTexture) {
			this.#outputTexture = TextureManager.createTexture({
				webgpuDescriptor: {
					size: {
						width: this.#textureSize,
						height: this.#textureSize,
					},
					format: 'rgba8unorm',
					visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.COMPUTE,
					usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.STORAGE_BINDING,
				},
				minFilter: GL_LINEAR,
			});
		}

		this.material.uniforms['outTexture'] = this.#outputTexture;

		this.editor.render(this.material, this.#textureSize, this.#textureSize);

		const output = this.getOutput('output');
		if (output) {
			output._value = this.#outputTexture;
		}
	}

	get title() {
		return 'texture lookup';
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
		ret.push(tabs1 + `black : ${this.getValue('adjust black')}, white : ${this.getValue('adjust white')}, gamma : ${this.getValue('adjust gamma')}`);
		return ret.join('\n');
	}

	dispose() {
		super.dispose();
		if (this.#renderTarget) {
			this.#renderTarget.dispose();
		}
	}
}
registerOperation('texture lookup', TextureLookup);
