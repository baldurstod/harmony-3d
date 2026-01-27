import { mat3, vec2, vec4 } from 'gl-matrix';
import { Graphics } from '../../graphics/graphics2';
import { RenderTarget } from '../../textures/rendertarget';
import { Texture } from '../../textures/texture';
import { TextureManager } from '../../textures/texturemanager';
import { GL_LINEAR } from '../../webgl/constants';
import { IO_TYPE_TEXTURE_2D, } from '../inputoutput';
import { Node, NodeContext } from '../node';
import { NodeImageEditor } from '../nodeimageeditor';
import { NodeImageEditorMaterial } from '../nodeimageeditormaterial';
import { NodeParam, NodeParamType } from '../nodeparam';
import { registerOperation } from '../operations';

const tempVec2 = vec2.create();
const texTransform = mat3.create();

export class ApplySticker extends Node {
	#renderTarget?: RenderTarget;
	#textureSize: number;
	inputTexture: Texture | null = null;
	#outputTexture?: Texture;


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
		this.#textureSize = params.textureSize ?? this.editor.textureSize;

		this.addParam(new NodeParam('adjust black', NodeParamType.Float, 0.0));
		this.addParam(new NodeParam('adjust white', NodeParamType.Float, 1.0));
		this.addParam(new NodeParam('adjust gamma', NodeParamType.Float, 1.0));

		this.addParam(new NodeParam('top left', NodeParamType.Vec2, vec2.create()));
		this.addParam(new NodeParam('top right', NodeParamType.Vec2, vec2.create()));
		this.addParam(new NodeParam('bottom left', NodeParamType.Vec2, vec2.create()));
		this.addParam(new NodeParam('path', NodeParamType.String, ''));

		this.addParam(new NodeParam('sticker', NodeParamType.StickerAdjust, vec2.create()));
	}

	async operate(context: NodeContext): Promise<void> {
		if (Graphics.isWebGLAny) {
			await this.#operateWebGL(context);
		} else {
			await this.#operateWebGPU(context);
		}
	}

	async #operateWebGL(context: NodeContext) {
		if (!this.material) {
			return;
		}
		const params = this.params;
		this.material.setTexture('uSticker', this.inputTexture);
		this.material.setTexture('uStickerSpecular', await this.getInput('specular')?.getValue(context));
		this.material.setTexture('uInput', await this.getInput('input')?.getValue(context));
		this.material.uniforms['uAdjustLevels'] = vec4.fromValues(this.getValue('adjust black') as number, this.getValue('adjust white') as number, this.getValue('adjust gamma') as number, 0.0);

		const texTransform = mat3.create();
		ComputeTextureMatrixFromRectangle(texTransform, this.getValue('bottom left') as vec2, this.getValue('top left') as vec2, this.getValue('top right') as vec2);
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
			this.#renderTarget = new RenderTarget({ width: this.#textureSize, height: this.#textureSize, depthBuffer: false, stencilBuffer: false });
		}
		Graphics.pushRenderTarget(this.#renderTarget);
		this.editor.render(this.material, this.#textureSize, this.#textureSize);

		/*let pixelArray = new Uint8Array(this.#textureSize * this.#textureSize * 4);
		Graphics.glContext.readPixels(0, 0, this.#textureSize, this.#textureSize, GL_RGBA, GL_UNSIGNED_BYTE, pixelArray);
		Graphics.popRenderTarget();*/

		Graphics.popRenderTarget();

		this.updatePreview(context);
		const output = this.getOutput('output');
		if (output) {
			output._value = this.#renderTarget.getTexture();
		}
		//this.getOutput('output')._pixelArray = pixelArray;
	}

	async #operateWebGPU(context: NodeContext): Promise<void> {
		if (!this.material) {
			return;
		}

		const params = this.params;
		this.material.setTexture('stickerTexture', this.inputTexture);
		this.material.setTexture('stickerSpecularTexture', await this.getInput('specular')?.getValue(context), 'USE_STICKER_SPECULAR');
		this.material.setTexture('inputTexture', await this.getInput('input')?.getValue(context));
		this.material.uniforms['adjustLevels'] = vec4.fromValues(this.getValue('adjust black') as number, this.getValue('adjust white') as number, this.getValue('adjust gamma') as number, 0.0);

		const texTransform = mat3.create();
		ComputeTextureMatrixFromRectangle(texTransform, this.getValue('bottom left') as vec2, this.getValue('top left') as vec2, this.getValue('top right') as vec2);
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
					usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING,
				},
				minFilter: GL_LINEAR,
			});
		}

		this.material.uniforms['outTexture'] = this.#outputTexture;

		//Graphics.compute(this.material, {}, this.#textureSize, this.#textureSize);
		this.editor.render(this.material, this.#textureSize, this.#textureSize);

		const output = this.getOutput('output');
		if (output) {
			output._value = this.#outputTexture;
		}
	}

	get title() {
		return 'apply sticker';
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
function ComputeTextureMatrixFromRectangle(out: mat3, bl: vec2, tl: vec2, tr: vec2) {
	const tempVec2 = vec2.create();
	const leftEdge = vec2.sub(vec2.create(), bl, tl);
	const topEdge = vec2.sub(vec2.create(), tr, tl);
	const topEdgePerpLeft = vec2.fromValues(-topEdge[1], topEdge[0]);

	const magLeftEdge = vec2.length(leftEdge);
	const magTopEdge = vec2.length(topEdge);

	const xScalar = (vec2.dot(topEdgePerpLeft, leftEdge) > 0) ? 1 : -1;


	// Simplification of acos( ( A . L ) / ( mag( A ) * mag( L ) )
	// Because A is ( 0, 1), which means A . L is just L.y
	// and mag( A ) * mag( L ) is just mag( L )
	const rotationD = Math.acos(leftEdge[1] / magLeftEdge)
		* (leftEdge[0] < 0 ? 1 : -1);

	const texTransform = mat3.create();
	mat3.translate(texTransform, texTransform, tl);
	mat3.rotate(texTransform, texTransform, rotationD);
	mat3.scale(texTransform, texTransform, vec2.set(tempVec2, xScalar * magTopEdge, magLeftEdge));
	mat3.invert(out, texTransform);
}
