import { vec2, vec4 } from 'gl-matrix';

import { IO_TYPE_COLOR, IO_TYPE_FLOAT, IO_TYPE_TEXTURE_2D, IO_TYPE_VEC2 } from '../inputoutput';
import { Node } from '../node';
import { NodeImageEditorMaterial } from '../nodeimageeditormaterial';
import { RenderTarget } from '../../textures/rendertarget';
import { GL_UNSIGNED_BYTE, GL_RGBA } from '../../webgl/constants';
import { registerOperation } from '../operations';
import { Graphics } from '../../graphics/graphics';
import { NodeImageEditor } from '../nodeimageeditor';

export class DrawCircle extends Node {
	#renderTarget?: RenderTarget;
	#textureSize: number;
	constructor(editor: NodeImageEditor, params?: any) {
		super(editor, params);
		this.hasPreview = true;
		this.addInput('center', IO_TYPE_VEC2)._value = vec2.create();
		this.addInput('radius', IO_TYPE_FLOAT)._value = 10.0;
		this.addInput('border', IO_TYPE_FLOAT)._value = 1.0;
		this.addInput('bordercolor', IO_TYPE_COLOR)._value = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
		this.addInput('fillcolor', IO_TYPE_COLOR)._value = vec4.fromValues(1.0, 1.0, 1.0, 1.0);
		this.addOutput('output', IO_TYPE_TEXTURE_2D);
		this.addOutput('perimeter', IO_TYPE_FLOAT);
		this.addOutput('area', IO_TYPE_FLOAT);
		this.material = new NodeImageEditorMaterial({shaderName:'drawcircle'});
		this.material.addUser(this);
		this.#textureSize = params.textureSize;
	}

	async operate() {
		let center = await this.getInput('center').value;
		let radius = await this.getInput('radius').value;
		let borderColor = await this.getInput('bordercolor').value;
		let fillColor = await this.getInput('fillcolor').value;
		let border = await this.getInput('border').value;

		this.getOutput('perimeter')._value = Math.PI * radius * 2;
		this.getOutput('area')._value = Math.PI * radius ** 2;

		this.material.uniforms['uRadius'] = radius;
		this.material.uniforms['uCenter'] = center;
		this.material.uniforms['uBorderColor'] = borderColor;
		this.material.uniforms['uFillColor'] = fillColor;
		this.material.uniforms['uBorder'] = border;

		if (!this.#renderTarget) {
			this.#renderTarget = new RenderTarget({width: this.#textureSize, height: this.#textureSize,depthBuffer:false, stencilBuffer:false});
		}
		Graphics.pushRenderTarget(this.#renderTarget);
		this.editor.render(this.material);

		let pixelArray = new Uint8Array(this.#textureSize * this.#textureSize * 4);
		Graphics.glContext.readPixels(0, 0, this.#textureSize, this.#textureSize, GL_RGBA, GL_UNSIGNED_BYTE, pixelArray);
		Graphics.popRenderTarget();

		this.getOutput('output')._value = this.#renderTarget.getTexture();
		this.getOutput('output')._pixelArray = pixelArray;
	}

	get title() {
		return 'draw circle';
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
registerOperation('draw_circle', DrawCircle);
