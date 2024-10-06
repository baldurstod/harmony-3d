import { mat3, vec2, vec4 } from 'gl-matrix';
import { IO_TYPE_COLOR, IO_TYPE_FLOAT, IO_TYPE_TEXTURE_2D, IO_TYPE_VEC2 } from '../inputoutput';
import { Node, NODE_PARAM_TYPE_FLOAT, NODE_PARAM_TYPE_RADIAN, NODE_PARAM_TYPE_STRING } from '../node';
import { NodeImageEditorMaterial } from '../nodeimageeditormaterial';
import { RenderTarget } from '../../textures/rendertarget';
import { GL_UNSIGNED_BYTE, GL_RGBA } from '../../webgl/constants';
import { registerOperation } from '../operations';
import { Graphics } from '../../graphics/graphics';
import { NodeImageEditor } from '../nodeimageeditor';
import { Texture } from '../../textures/texture';

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

		this.addParam('adjust black', NODE_PARAM_TYPE_FLOAT, 0.0);
		this.addParam('adjust white', NODE_PARAM_TYPE_FLOAT, 1.0);
		this.addParam('adjust gamma', NODE_PARAM_TYPE_FLOAT, 1.0);
		this.addParam('rotation', NODE_PARAM_TYPE_RADIAN, 0.0);
		this.addParam('translate u', NODE_PARAM_TYPE_FLOAT, 0.0);
		this.addParam('translate v', NODE_PARAM_TYPE_FLOAT, 0.0);
		this.addParam('scale u', NODE_PARAM_TYPE_FLOAT, 1.0);
		this.addParam('scale v', NODE_PARAM_TYPE_FLOAT, 1.0);
		this.addParam('path', NODE_PARAM_TYPE_STRING, '');
	}

	async operate() {
		this.material.setTexture('uInput', this.inputTexture);
		this.material.uniforms['uAdjustLevels'] = vec4.fromValues(this.getParam('adjust black'), this.getParam('adjust white'), this.getParam('adjust gamma'), 0.0);

		let texTransform = mat3.create();
		mat3.rotate(texTransform, texTransform, this.getParam('rotation'));
		mat3.scale(texTransform, texTransform, vec2.set(tempVec2, this.getParam('scale u'), this.getParam('scale v')));
		mat3.translate(texTransform, texTransform, vec2.set(tempVec2, this.getParam('translate u'), this.getParam('translate v')));
		this.material.uniforms['uTransformTexCoord0'] = texTransform;

		//console.error(this.params, this.testing);

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
	}

	get title() {
		return 'texture lookup';
	}

	async toString(tabs = '') {
		let ret = [];
		let tabs1 = tabs + '\t';
		ret.push(tabs + this.constructor.name);
		for (let input of this.inputs.values()) {
			if (input.predecessor) {
				ret.push(await input.toString(tabs1));
			}
		}
		ret.push(tabs1 + `black : ${this.getParam('adjust black')}, white : ${this.getParam('adjust white')}, gamma : ${this.getParam('adjust gamma')}`);
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
