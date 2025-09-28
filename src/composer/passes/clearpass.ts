import { vec4 } from 'gl-matrix';
import { Graphics } from '../../graphics/graphics2';
import { RenderContext } from '../../interfaces/rendercontext';
import { RenderTarget } from '../../textures/rendertarget';
import { Pass } from '../pass';

export class ClearPass extends Pass {
	swapBuffers = false;
	#clearColor = vec4.create();//TODO change to Color
	#clearDepth: GLclampf = 0;
	#clearStencil: GLint = 0;

	constructor(clearColor: vec4, clearDepth: GLclampf, clearStencil: GLint) {
		super();
		this.clearColor = clearColor;
		this.clearDepth = clearDepth;
		this.clearStencil = clearStencil;
	}

	set clearColor(clearColor: vec4) {
		vec4.copy(this.#clearColor, clearColor);
	}

	set clearDepth(clearDepth: GLclampf) {
		this.#clearDepth = clearDepth ?? null;
	}

	set clearStencil(clearStencil: GLint) {
		this.#clearStencil = clearStencil ?? null;
	}

	render(readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext) {
		const clearColor = this.#clearColor != null;
		const clearDepth = this.#clearDepth != null;
		const clearStencil = this.#clearStencil != null;

		if (clearColor) {
			Graphics.clearColor(this.#clearColor);
		}

		if (clearDepth) {
			Graphics.clearDepth(this.#clearDepth);
		}

		if (clearStencil) {
			Graphics.clearStencil(this.#clearStencil);
		}

		Graphics.pushRenderTarget(renderToScreen ? null : writeBuffer);
		Graphics.clear(clearColor, clearDepth, clearStencil);
		Graphics.popRenderTarget();
	}
}
