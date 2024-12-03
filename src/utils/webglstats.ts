import { createElement } from 'harmony-ui';

import { TextureFactoryEventTarget } from '../textures/texturefactory';
import { USE_STATS } from '../buildoptions';
import { GL_POINTS, GL_LINE_STRIP, GL_LINE_LOOP, GL_LINES, GL_TRIANGLE_STRIP, GL_TRIANGLE_FAN, GL_TRIANGLES } from '../webgl/constants';

export class WebGLStats {
	static #frames: number = 0;
	static #totalFrames: number = 0;
	static #fps: number = 0;
	static #drawElements: number = 0;
	static #renderTime: number = 0;
	static #renderTimeMean: number = 0;
	static #textures: number = 0;
	static #startTime: number = 0;
	static #endTime: number = 0;
	static #startRender: number = 0;
	static #primitivePerMode: Map<GLenum, number> = new Map();
	static #htmlElement: HTMLElement;
	static {
		this.#initHtml();
		this.#reset();

		if (USE_STATS) {
			TextureFactoryEventTarget.addEventListener('textureCreated', (event: Event) => this.#textures = (event as CustomEvent).detail.count);
			TextureFactoryEventTarget.addEventListener('textureDeleted', (event: Event) => this.#textures = (event as CustomEvent).detail.count);
		}
	}

	static start() {
		this.#startTime = performance.now();
	}

	static beginRender() {
		this.#startRender = performance.now();
	}

	static endRender() {
		this.#renderTime += performance.now() - this.#startRender;
	}

	static #reset() {
		this.#drawElements = 0;
		this.#primitivePerMode.set(GL_POINTS, 0);
		this.#primitivePerMode.set(GL_LINE_STRIP, 0);
		this.#primitivePerMode.set(GL_LINE_LOOP, 0);
		this.#primitivePerMode.set(GL_LINES, 0);
		this.#primitivePerMode.set(GL_TRIANGLE_STRIP, 0);
		this.#primitivePerMode.set(GL_TRIANGLE_FAN, 0);
		this.#primitivePerMode.set(GL_TRIANGLES, 0);
	}

	static tick() {
		this.#endTime = performance.now();
		++this.#frames;

		let timeSinceReset = this.#endTime - this.#startTime;
		this.#updateHtml();

		if (timeSinceReset > 1000) {
			this.#fps = Math.round(this.#frames / timeSinceReset * 1000);
			this.#renderTimeMean = this.#renderTime / this.#frames;
			this.#frames = 0;
			this.#startTime = this.#endTime;
			this.#renderTime = 0;
		}
		this.#reset();
	}

	static drawElements(mode: GLenum, count: number) {
		this.#primitivePerMode.set(mode, count + (this.#primitivePerMode.get(mode) ?? 0));
		++this.#drawElements;
	}

	static #initHtml() {
		this.#htmlElement = createElement('div');
	}

	static #updateHtml() {
		this.#htmlElement.innerText = '';
		this.#htmlElement.append(String(this.#fps));
		this.#htmlElement.append(createElement('br'), `drawElements : ${this.#drawElements}`);
		this.#htmlElement.append(createElement('br'), `renderTime : ${this.#renderTimeMean.toPrecision(3)}`);
		this.#htmlElement.append(createElement('br'), `textures : ${this.#textures}`);

		for (const [mode, count] of this.#primitivePerMode) {
			//let count = this.primitivePerMode[mode];
			if (count > 0) {
				this.#htmlElement.append(createElement('br'), `${mode} : ${count}`);
			}

		}
	}

	static get htmlElement() {
		return this.#htmlElement;
	}

	static getFps() {
		return this.#fps;
	}
}
