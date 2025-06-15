import { vec4 } from 'gl-matrix';
import { Pass } from '../pass';
import { Graphics, RenderContext } from '../../graphics/graphics';
import { RenderTarget } from '../../textures/rendertarget';

export class ClearPass extends Pass {
	swapBuffers = false;
	#clearColor = vec4.create();
	#clearDepth: GLclampf = 0;
	#clearStencil: GLclampf = 0;

	constructor(clearColor, clearDepth, clearStencil) {
		super();
		this.clearColor = clearColor;
		this.clearDepth = clearDepth;
		this.clearStencil = clearStencil;
	}

	set clearColor(clearColor: vec4) {
		vec4.copy(this.#clearColor, clearColor);
	}

	set clearDepth(clearDepth) {
		this.#clearDepth = clearDepth ?? null;
	}

	set clearStencil(clearStencil) {
		this.#clearStencil = clearStencil ?? null;
	}

	render(renderer: Graphics, readBuffer: RenderTarget, writeBuffer: RenderTarget, renderToScreen: boolean, delta: number, context: RenderContext) {
		const clearColor = this.#clearColor != null;
		const clearDepth = this.#clearDepth != null;
		const clearStencil = this.#clearStencil != null;

		if (clearColor) {
			renderer.clearColor(this.#clearColor);
		}

		if (clearDepth) {
			renderer.clearDepth(this.#clearDepth);
		}

		if (clearStencil) {
			renderer.clearStencil(this.#clearStencil);
		}

		renderer.pushRenderTarget(renderToScreen ? null : writeBuffer);
		renderer.clear(clearColor, clearDepth, clearStencil);
		renderer.popRenderTarget();
	}
}
