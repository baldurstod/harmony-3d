import { mat3, vec2, vec4 } from 'gl-matrix';
import { IO_TYPE_TEXTURE_2D, } from '../inputoutput';
import { Node, NODE_PARAM_TYPE_FLOAT, NODE_PARAM_TYPE_VEC2, NODE_PARAM_TYPE_STICKER_ADJUST } from '../node';
import { NodeImageEditorMaterial } from '../nodeimageeditormaterial';
import { RenderTarget } from '../../textures/rendertarget';
import { registerOperation } from '../operations';
import { Graphics } from '../../graphics/graphics';
import { Texture } from '../../textures/texture';
import { NodeImageEditor } from '../nodeimageeditor';

const tempVec2 = vec2.create();
const texTransform = mat3.create();

export class ApplySticker extends Node {
	#renderTarget?: RenderTarget;
	#textureSize: number;
	inputTexture?: Texture;
	constructor(editor: NodeImageEditor, params?: any) {
		super(editor, params);
		this.hasPreview = true;

		this.addInput('input', IO_TYPE_TEXTURE_2D);
		this.addInput('sticker', IO_TYPE_TEXTURE_2D);
		this.addInput('specular', IO_TYPE_TEXTURE_2D);

		this.addOutput('output', IO_TYPE_TEXTURE_2D);
		this.material = new NodeImageEditorMaterial({ shaderName: 'applysticker' });
		this.material.setDefine('TRANSFORM_TEX_COORD');
		this.material.setDefine('NEED_TWO_TEX_COORDS');
		this.material.addUser(this);
		this.#textureSize = params.textureSize;

		this.addParam('adjust black', NODE_PARAM_TYPE_FLOAT, 0.0);
		this.addParam('adjust white', NODE_PARAM_TYPE_FLOAT, 1.0);
		this.addParam('adjust gamma', NODE_PARAM_TYPE_FLOAT, 1.0);

		this.addParam('bottom left', NODE_PARAM_TYPE_VEC2, vec2.create());
		this.addParam('top left', NODE_PARAM_TYPE_VEC2, vec2.create());
		this.addParam('top right', NODE_PARAM_TYPE_VEC2, vec2.create());

		this.addParam('sticker', NODE_PARAM_TYPE_STICKER_ADJUST, vec2.create());
	}

	async operate() {
		let params = this.params;
		this.material.setTexture('uSticker', this.inputTexture);
		this.material.setTexture('uStickerSpecular', await this.getInput('specular').value);
		this.material.setTexture('uInput', await this.getInput('input').value);
		this.material.uniforms['uAdjustLevels'] = vec4.fromValues(this.getParam('adjust black'), this.getParam('adjust white'), this.getParam('adjust gamma'), 0.0);

		let texTransform = mat3.create();
		ComputeTextureMatrixFromRectangle(texTransform, this.getParam('bottom left'), this.getParam('top left'), this.getParam('top right'));
		this.material.uniforms['uTransformTexCoord0'] = texTransform;

		/*texTransform = mat3.identity(texTransform);
		mat3.rotate(texTransform, texTransform, this.params.rotation);
		mat3.translate(texTransform, texTransform, vec2.set(tempVec2, this.params.translateU, this.params.translateV));
		mat3.scale(texTransform, texTransform, vec2.set(tempVec2, this.params.scaleUV, this.params.scaleUV));
		this.material.uniforms['uTransformTexCoord0'] = texTransform;*/

		/*let textureArray = [];
		let usedArray = [];
		for (let i = 0; i < 8; ++i) {
			//let inputName = 'uInput' + i;
			//this.material.uniforms['uInput' + i] = await this.getInput('input' + i).value;
			let texture = await this.getInput('input' + i).value;
			textureArray.push(texture);
			usedArray.push(texture != undefined);
		}

		//this.material.uniforms['uInput[0]'] = await this.getInput('input').value;
		this.material.uniforms['uInput[0]'] = textureArray;
		this.material.uniforms['uUsed[0]'] = usedArray;*/

		//this.material.uniforms['uInput'] = this.inputTexture;

		if (!this.#renderTarget) {
			this.#renderTarget = new RenderTarget({ width: this.#textureSize, height: this.#textureSize, depthBuffer: false, stencilBuffer: false, texture: this.getOutput('output')._value });
		}
		Graphics.pushRenderTarget(this.#renderTarget);
		this.editor.render(this.material);

		/*let pixelArray = new Uint8Array(this.#textureSize * this.#textureSize * 4);
		Graphics.glContext.readPixels(0, 0, this.#textureSize, this.#textureSize, GL_RGBA, GL_UNSIGNED_BYTE, pixelArray);
		Graphics.popRenderTarget();*/

		Graphics.popRenderTarget();

		this.updatePreview();
		this.getOutput('output')._value = this.#renderTarget.getTexture();
		//this.getOutput('output')._pixelArray = pixelArray;
	}

	get title() {
		return 'apply sticker';
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
registerOperation('apply_sticker', ApplySticker);


//void ComputeTextureMatrixFromRectangle( VMatrix* pOutMat, const Vector2D& bl, const Vector2D& tl, const Vector2D& tr )
function ComputeTextureMatrixFromRectangle(out, bl, tl, tr) {
	const tempVec2 = vec2.create();
	let leftEdge = vec2.sub(vec2.create(), bl, tl);
	let topEdge = vec2.sub(vec2.create(), tr, tl);
	let topEdgePerpLeft = vec2.fromValues(-topEdge[1], topEdge[0]);

	let magLeftEdge = vec2.length(leftEdge);
	let magTopEdge = vec2.length(topEdge);

	let xScalar = (vec2.dot(topEdgePerpLeft, leftEdge) > 0) ? 1 : -1;


	// Simplification of acos( ( A . L ) / ( mag( A ) * mag( L ) )
	// Because A is ( 0, 1), which means A . L is just L.y
	// and mag( A ) * mag( L ) is just mag( L )
	let rotationD = Math.acos(leftEdge[1] / magLeftEdge)
		* (leftEdge[0] < 0 ? 1 : -1);

	let texTransform = mat3.create();
	mat3.translate(texTransform, texTransform, tl);
	mat3.rotate(texTransform, texTransform, rotationD);
	mat3.scale(texTransform, texTransform, vec2.set(tempVec2, xScalar * magTopEdge, magLeftEdge));
	mat3.invert(out, texTransform);
}
