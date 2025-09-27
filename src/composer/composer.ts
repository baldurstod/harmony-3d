import { vec2 } from 'gl-matrix';
import { Graphics } from '../graphics/graphics2';
import { RenderContext } from '../interfaces/rendercontext';
import { RenderTarget } from '../textures/rendertarget';
import { Pass } from './pass';

const tempVec2 = vec2.create();

export class Composer {
	#width = 0;
	#height = 0;
	enabled = true;
	#passes: Pass[] = [];
	#renderTarget1?: RenderTarget;
	#renderTarget2?: RenderTarget;
	#readBuffer?: RenderTarget;
	#writeBuffer?: RenderTarget;

	constructor(renderTarget?: RenderTarget) {
		if (renderTarget) {
			this.#setRenderTarget(renderTarget);
			return;
		}

		(async () => {
			await Graphics.isReady();
			if (!renderTarget) {
				const rendererSize = Graphics.getSize();
				renderTarget = new RenderTarget({ width: rendererSize[0], height: rendererSize[1], depthBuffer: true, stencilBuffer: true });
				this.#setRenderTarget(renderTarget);
			}
		})();
	}

	render(delta: number, context: RenderContext) {
		let pass: Pass;
		let swapBuffer;

		//Graphics.getSize(tempVec2);
		//this.setSize(tempVec2[0], tempVec2[1]);

		let lastPass = -1;
		for (let i = this.#passes.length - 1; i >= 0; --i) {
			if (this.#passes[i]!.enabled) {
				lastPass = i;
				break;
			}
		}

		for (let i = 0, l = this.#passes.length; i < l; ++i) {
			pass = this.#passes[i]!;
			if (!pass.enabled) {
				continue;
			}

			if (pass.swapBuffers) {
				swapBuffer = this.#readBuffer;
				this.#readBuffer = this.#writeBuffer;
				this.#writeBuffer = swapBuffer;
			}

			if (this.#readBuffer && this.#writeBuffer) {
				pass.render(this.#readBuffer, this.#writeBuffer, i == lastPass, delta, context);
			}
		}
	}

	savePicture(filename: string, width: number, height: number) {
		this.setSize(width, height);
		this.render(0, { DisableToolRendering: true });
		Graphics._savePicture(filename);
	}

	addPass(pass: Pass) {
		this.#passes.push(pass);
		Graphics.getSize(tempVec2);
		pass.setSize(tempVec2[0], tempVec2[1]);
	}

	#setRenderTarget(renderTarget: RenderTarget) {
		this.#renderTarget1 = renderTarget;
		this.#renderTarget2 = renderTarget.clone();

		this.#writeBuffer = this.#renderTarget1;
		this.#readBuffer = this.#renderTarget2;
	}

	setSize(width: number, height: number) {
		if (this.#width != width || this.#height != height) {
			this.#width = width;
			this.#height = height;
			this.#renderTarget1?.resize(width, height);
			this.#renderTarget2?.resize(width, height);

			for (let i = 0, l = this.#passes.length; i < l; ++i) {
				this.#passes[i]!.setSize(width, height);
			}
		}
	}
}
