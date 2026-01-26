import { vec2, vec4 } from 'gl-matrix';
import { Graphics } from '../../graphics/graphics2';
import { RenderTarget } from '../../textures/rendertarget';
import { IO_TYPE_COLOR, IO_TYPE_FLOAT, IO_TYPE_TEXTURE_2D, IO_TYPE_VEC2 } from '../inputoutput';
import { Node, NodeContext } from '../node';
import { NodeImageEditor } from '../nodeimageeditor';
import { NodeImageEditorMaterial } from '../nodeimageeditormaterial';
import { registerOperation } from '../operations';

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
		this.material = new NodeImageEditorMaterial({ shaderName: 'drawcircle' });
		this.material.addUser(this);
		this.#textureSize = params.textureSize;
	}

	async operate(context: NodeContext) {
		if (!this.material) {
			return;
		}
		const center = await this.getInput('center')?.getValue(context);
		const radius = await this.getInput('radius')?.getValue(context);
		const borderColor = await this.getInput('bordercolor')?.getValue(context);
		const fillColor = await this.getInput('fillcolor')?.getValue(context);
		const border = await this.getInput('border')?.getValue(context);

		const perimeter = this.getOutput('perimeter');
		if (perimeter) {
			perimeter._value = Math.PI * radius * 2;
		}
		const area = this.getOutput('area');
		if (area) {
			area._value = Math.PI * radius ** 2;
		}

		this.material.uniforms['uRadius'] = radius;
		this.material.uniforms['uCenter'] = center;
		this.material.uniforms['uBorderColor'] = borderColor;
		this.material.uniforms['uFillColor'] = fillColor;
		this.material.uniforms['uBorder'] = border;

		if (!this.#renderTarget) {
			this.#renderTarget = new RenderTarget({ width: this.#textureSize, height: this.#textureSize, depthBuffer: false, stencilBuffer: false });
		}
		Graphics.pushRenderTarget(this.#renderTarget);
		this.editor.render(this.material, this.#textureSize, this.#textureSize);

		Graphics.popRenderTarget();

		const output = this.getOutput('output');
		if (output) {
			output._value = this.#renderTarget.getTexture();
		}
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
