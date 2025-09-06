import { mat3, vec2, vec4 } from 'gl-matrix';
import { IO_TYPE_TEXTURE_2D } from '../inputoutput';
import { Node } from '../node';
import { NodeImageEditorMaterial } from '../nodeimageeditormaterial';
import { RenderTarget } from '../../textures/rendertarget';
import { GL_UNSIGNED_BYTE, GL_RGBA } from '../../webgl/constants';
import { registerOperation } from '../operations';
import { Graphics } from '../../graphics/graphics';
import { NodeImageEditor } from '../nodeimageeditor';
import { Texture } from '../../textures/texture';
import { NodeParam, NodeParamType } from '../nodeparam';

const tempVec2 = vec2.create();

export class TextureLookup extends Node {
	#renderTarget?: RenderTarget;
	#textureSize: number;
	inputTexture?: Texture;
	constructor(editor: NodeImageEditor, params?: any) {
		super(editor, params);
		this.hasPreview = true;
		this.addOutput('output', IO_TYPE_TEXTURE_2D);
		this.material = new NodeImageEditorMaterial({ shaderName: 'texturelookup' });
		this.material.setDefine('TRANSFORM_TEX_COORD');
		this.material.addUser(this);
		this.#textureSize = params.textureSize;

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

	async operate(context: any = {}) {
		this.material.setTexture('uInput', this.inputTexture);
		this.material.uniforms['uAdjustLevels'] = vec4.fromValues(this.getValue('adjust black'), this.getValue('adjust white'), this.getValue('adjust gamma'), 0.0);

		const texTransform = mat3.create();
		mat3.rotate(texTransform, texTransform, this.getValue('rotation'));
		mat3.scale(texTransform, texTransform, vec2.set(tempVec2, this.getValue('scale u'), this.getValue('scale v')));
		mat3.translate(texTransform, texTransform, vec2.set(tempVec2, this.getValue('translate u'), this.getValue('translate v')));
		this.material.uniforms['uTransformTexCoord0'] = texTransform;

		//console.error(this.params, this.testing);

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
