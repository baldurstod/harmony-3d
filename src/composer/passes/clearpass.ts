import { vec4 } from 'gl-matrix';

import { Pass } from './pass';

export class ClearPass extends Pass {
	swapBuffers = false;
	#clearColor = vec4.create();
	#clearDepth = false;
	#clearStencil = false;
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

	render(renderer, readBuffer, writeBuffer, renderToScreen) {
		let clearColor = this.#clearColor != null;
		let clearDepth = this.#clearDepth != null;
		let clearStencil = this.#clearStencil != null;

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
