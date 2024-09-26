import { mat4, vec2, vec4 } from 'gl-matrix';
import { SaveFile } from 'harmony-browser-utils';
import { ShortcutHandler } from 'harmony-browser-utils/src/shortcuthandler';

import { GraphicsEvents } from './graphicsevents';
import { MAX_HARDWARE_BONES, RECORDER_DEFAULT_FILENAME, RECORDER_MIME_TYPE } from '../constants';
import { pickList } from '../entities/picklist';
import { GL_COLOR_BUFFER_BIT, GL_CULL_FACE, GL_DEPTH_BUFFER_BIT, GL_STENCIL_BUFFER_BIT, GL_FRAMEBUFFER, GL_UNSIGNED_BYTE, GL_RGBA } from '../webgl/constants';
import { GL_SCISSOR_TEST } from '../webgl/constants';
import { WebGLRenderingState } from '../webgl/renderingstate';
import { WebGLShaderSource } from '../webgl/shadersource';
import { WebGLStats } from '../utils/webglstats';
import { setTextureFactoryContext } from '../textures/texturefactory';
import { ForwardRenderer } from '../renderers/forwardrenderer';

import { isNumeric } from '../math/functions';

import { DISABLE_WEBGL2, MEASURE_PERFORMANCE, USE_STATS, TESTING, DEBUG, VERBOSE, USE_OFF_SCREEN_CANVAS, ENABLE_GET_ERROR } from '../buildoptions';
import { RenderTarget } from '../textures/rendertarget';
import { WebGLAnyRenderingContext } from '../types';
import { Entity } from '../entities/entity';
import { Material } from '../materials/material';
import { Scene } from '../scenes/scene';
import { Camera } from '../cameras/camera';

const FULL_PATATE = false;

const VEC4_ALL_1 = vec4.fromValues(1.0, 1.0, 1.0, 1.0);

export enum ShaderPrecision {
	Low = 0,
	Medium,
	High,
}

export enum ShaderQuality {
	Low = 0,
	Medium,
	High,
}

export enum ShaderDebugMode {
	None = 0,
}

export class Graphics {
	static #pixelRatio = /*window.devicePixelRatio ?? */1.0;
	static #viewport = vec4.create();
	static #scissor = vec4.create();
	static #extensions = new Map<string, any>();
	static #autoResize = false;
	static isWebGL = false;
	static isWebGL2 = false;
	static autoClear = true;
	static autoClearColor = false;
	static autoClearDepth = true;
	static autoClearStencil = true;
	static #includeCode = new Map<string, string>();
	static #globalIncludeCode = '';
	static speed = 1.0;
	static #timeOrigin = performance.now();
	static #time = 0;
	static #running = false;
	static #lastTick = performance.now();
	static currentTick = 0;
	static #renderBuffers = new Set<WebGLRenderbuffer>();
	static #renderTargetStack: Array<RenderTarget> = [];
	static #readyPromise: Promise<void>;
	static #readyPromiseResolve: (value: any) => void;
	static #canvas: HTMLCanvasElement;
	static #width: number;
	static #height: number;
	static #offscreenCanvas: OffscreenCanvas;
	static #forwardRenderer: ForwardRenderer;
	static glContext: WebGLAnyRenderingContext;
	static #bipmapContext: ImageBitmapRenderingContext | null;
	static #pickedEntity: Entity | null;
	static #animationFrame: number;
	static ANGLE_instanced_arrays: any;
	static OES_texture_float_linear: any;
	static #mediaRecorder: MediaRecorder;

	static {
		this.setShaderPrecision(ShaderPrecision.Medium);
		this.setShaderQuality(ShaderQuality.Medium);
		this.setShaderDebugMode(ShaderDebugMode.None);


		// old stuff

		// Internal use only

		//this.frameBuffers = new Set();


		if (TESTING) {
			this.setIncludeCode('TESTING', '#define TESTING');
		}

		this.setIncludeCode('MAX_HARDWARE_BONES', '#define MAX_HARDWARE_BONES ' + MAX_HARDWARE_BONES);

		this.#readyPromise = new Promise((resolve, reject) => {
			this.#readyPromiseResolve = resolve;
		});
	}

	static initCanvas(contextAttributes: any = {}) {
		this.#canvas = contextAttributes.canvas ?? document.createElement('canvas');
		this.#canvas.setAttribute('tabindex', '1');
		ShortcutHandler.addContext('3dview', this.#canvas);

		this.#width = this.#canvas.width;
		this.#height = this.#canvas.height;
		if (USE_OFF_SCREEN_CANVAS) {
			this.#offscreenCanvas = new OffscreenCanvas(this.#width, this.#height);
		}

		this.#initContext(contextAttributes);
		this.#initObserver();

		WebGLRenderingState.setGraphics(Graphics);

		// init state
		WebGLRenderingState.enable(GL_CULL_FACE);
		// init state end
		//this.clearColor = vec4.fromValues(0, 0, 0, 255);
		this.#forwardRenderer = new ForwardRenderer(this);

		let autoResize = contextAttributes['autoResize'];
		if (autoResize !== undefined) {
			this.autoResize = autoResize;
		}

		this.#canvas.addEventListener('mousedown', (event) => this.mouseDown(event));
		this.#canvas.addEventListener('mousemove', (event) => this.mouseMove(event));
		this.#canvas.addEventListener('mouseup', (event) => this.mouseUp(event));
		this.#readyPromiseResolve(true);
		return this;
	}

	static pickEntity(x: number, y: number) {
		this.setIncludeCode('pickingMode', '#define PICKING_MODE');
		GraphicsEvents.tick(0, performance.now());
		this.setIncludeCode('pickingMode', '#undef PICKING_MODE');

		const gl = this.glContext;
		let pixels = new Uint8Array(4);
		this.glContext?.readPixels(x, this.#canvas.height - y, 1, 1, GL_RGBA, GL_UNSIGNED_BYTE, pixels);

		let pickedEntityIndex = (pixels[0] << 16) + (pixels[1] << 8) + (pixels[2]);
		return pickList.get(pickedEntityIndex) ?? null;
	}

	static mouseDown(event) {
		this.#canvas.focus();
		let x = event.offsetX;
		let y = event.offsetY;
		this.#pickedEntity = this.pickEntity(x, y);
		if (this.#pickedEntity) {
			GraphicsEvents.pick(x, y, this.#pickedEntity);
			event.stopPropagation();
		}
		GraphicsEvents.mouseDown(x, y, this.#pickedEntity, event);
	}

	static mouseMove(event) {
		let x = event.offsetX;
		let y = event.offsetY;
		GraphicsEvents.mouseMove(x, y, this.#pickedEntity, event);
	}

	static mouseUp(event) {
		let x = event.offsetX;
		let y = event.offsetY;
		GraphicsEvents.mouseUp(x, y, this.#pickedEntity, event);
		this.#pickedEntity = null;
	}

	static getDefinesAsString(material: Material) {//TODOv3 rename var material
		let defines: string[] = [];
		for (let [name, value] of Object.entries(material.defines)) {
			if (value === false) {
				defines.push('#undef ' + name + ' ' + value);
			} else {
				defines.push('#define ' + name + ' ' + value);
			}
		}
		return defines.join('\n') + '\n';
	}

	static render(scene: Scene, camera: Camera, delta: number) {
		if (MEASURE_PERFORMANCE) {
			WebGLStats.beginRender();
		}
		this.renderBackground();//TODOv3 put in rendering pipeline
		this.#forwardRenderer.render(scene, camera, delta);

		if (USE_OFF_SCREEN_CANVAS) {
			let bitmap = this.#offscreenCanvas.transferToImageBitmap();
			this.#bipmapContext?.transferFromImageBitmap(bitmap);
		}

		if (MEASURE_PERFORMANCE) {
			var t1 = performance.now();
			if (USE_STATS) {
				WebGLStats.endRender();
			}
		}
	}

	static renderBackground() {
		if (this.autoClear) {
			this.clear(this.autoClearColor, this.autoClearDepth, this.autoClearStencil);
		}
	}

	static clear(color, depth, stencil) {
		let bits = 0;
		if (color) bits |= GL_COLOR_BUFFER_BIT;
		if (depth) bits |= GL_DEPTH_BUFFER_BIT;
		if (stencil) bits |= GL_STENCIL_BUFFER_BIT;

		//TODO check if doing a complete state reinitilisation is better ?
		WebGLRenderingState.colorMask(VEC4_ALL_1);
		WebGLRenderingState.depthMask(true);
		WebGLRenderingState.stencilMask(Number.MAX_SAFE_INTEGER);

		this.glContext?.clear(bits);
	}

	static _tick() {
		cancelAnimationFrame(this.#animationFrame);
		let queueTask;
		if (FULL_PATATE && TESTING) {
			queueTask = (task) => {
				const mc = new MessageChannel();
				const args = [].slice.call(arguments, 1);
				mc.port1.onmessage = function () { task.apply(task, args); };
				mc.port2.postMessage(null);
			}
		} else {
			this.#animationFrame = requestAnimationFrame(() => this._tick());
		}

		const tick = performance.now();
		this.#time = (tick - this.#timeOrigin) * 0.001;
		let delta = (tick - this.#lastTick) * this.speed * 0.001;
		if (this.#running) {
			++this.currentTick;
			GraphicsEvents.tick(delta, tick);
		}
		this.#lastTick = tick;
		if (FULL_PATATE && TESTING) {
			queueTask(() => this._tick());
		}
	}

	static #initContext(contextAttributes) {
		const canvas = USE_OFF_SCREEN_CANVAS ? this.#offscreenCanvas : this.#canvas;
		if (USE_OFF_SCREEN_CANVAS) {
			this.#bipmapContext = this.#canvas.getContext('bitmaprenderer');
		}
		if (!canvas) {
			return;
		}

		// we may want to cleanup the contextAttributes here
		try {
			try { // first try to create a webgl2 context
				if (DISABLE_WEBGL2) {
					throw 'webgl2 disabled';
				}
				this.glContext = (canvas.getContext('webgl2', contextAttributes) as WebGL2RenderingContext);
				if (this.glContext instanceof WebGL2RenderingContext) {
					this.isWebGL2 = true;
					WebGLShaderSource.isWebGL2 = true;
					this.setIncludeCode('WEBGL2', '#define WEBGL2');
				} else {
					throw 'no webgl2';
				}
			} catch (e) {
				this.glContext = (canvas.getContext('webgl', contextAttributes) as WebGLRenderingContext);
				if (this.glContext instanceof WebGLRenderingContext) {
					this.isWebGL = true;
					this.setIncludeCode('WEBGL1', '#define WEBGL1');

					//TODO: put this in a separate function and alert the user in case of failure
					//these extensions are important
					// activate UNSIGNED_INT indices in drawElements
					this.getExtension('OES_element_index_uint');
					// activate floating point textures
					this.getExtension('OES_texture_float');
					// activate derivatives functions
					this.getExtension('OES_standard_derivatives');
					//activate writing in gl_FragDepth
					this.getExtension('EXT_frag_depth');
					// get access to drawElementsInstancedANGLE
					this.ANGLE_instanced_arrays = this.getExtension('ANGLE_instanced_arrays');
					// add MIN_EXT and MAX_EXT for blendEquation in webgl1 context. MIN_EXT and MAX_EXT have the same value as MIN and MAX
					this.getExtension('EXT_blend_minmax');
					//Depth texture https://developer.mozilla.org/en-US/docs/Web/API/WEBGL_depth_texture
					this.getExtension('WEBGL_depth_texture');
					//https://developer.mozilla.org/en-US/docs/Web/API/EXT_sRGB
					this.getExtension('EXT_sRGB');

					//TODO: see https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/getExtension
				}
			}
			// WEBGL1 / WEBGL2 extensions

			// https://developer.mozilla.org/en-US/docs/Web/API/OES_texture_float_linear
			this.OES_texture_float_linear = this.getExtension('OES_texture_float_linear');

		} catch (error) {
			console.error(error);
			throw error;
		}
		if (this.glContext) {
			setTextureFactoryContext(this.glContext);
		}
	}

	static set shaderPrecision(shaderPrecision: ShaderPrecision) {
		this.setShaderPrecision(shaderPrecision);
	}

	static setShaderPrecision(shaderPrecision: ShaderPrecision) {
		switch (shaderPrecision) {
			case ShaderPrecision.Low:
				this.setIncludeCode('SHADER_PRECISION', '#define LOW_PRECISION');
				break;
			case ShaderPrecision.Medium:
				this.setIncludeCode('SHADER_PRECISION', '#define MEDIUM_PRECISION');
				break;
			case ShaderPrecision.High:
				this.setIncludeCode('SHADER_PRECISION', '#define HIGH_PRECISION');
				break;
		}
	}

	static setShaderQuality(shaderQuality: ShaderQuality) {
		this.setIncludeCode('SHADER_QUALITY', `#define SHADER_QUALITY ${shaderQuality}`);
	}

	static setShaderDebugMode(shaderDebugMode: ShaderDebugMode) {
		this.setIncludeCode('SHADER_DEBUG_MODE', `#define SHADER_DEBUG_MODE ${shaderDebugMode}`);
	}

	static setIncludeCode(key: string, code: string) {
		this.#includeCode.set(key, code);
		this.#refreshIncludeCode();
	}

	static removeIncludeCode(key: string) {
		this.#includeCode.delete(key);
		this.#refreshIncludeCode();
	}

	static #refreshIncludeCode() {
		this.#globalIncludeCode = '';
		for (let code of this.#includeCode.values()) {
			this.#globalIncludeCode += code + '\n';
		}
	}

	static getIncludeCode() {
		return this.#globalIncludeCode;
	}

	/**
	 * Invalidate all shader (force recompile)
	 */
	static invalidateShaders() {
		if (this.#forwardRenderer) {
			this.#forwardRenderer.invalidateShaders();
		}

		/*for (let shader of this._materialsProgram) {
			shader.invalidate();
		}*/
	}

	static clearColor(clearColor) {
		WebGLRenderingState.clearColor(clearColor);
	}

	static getClearColor(clearColor) {
		return WebGLRenderingState.getClearColor(clearColor);
	}

	static clearDepth(clearDepth) {
		WebGLRenderingState.clearDepth(clearDepth);
	}

	static clearStencil(clearStencil) {
		WebGLRenderingState.clearStencil(clearStencil);
	}

	static set autoResize(autoResize) {
		this.#autoResize = autoResize;
		if (autoResize) {
			this.checkCanvasSize();
		}
	}

	static get autoResize() {
		return this.#autoResize;
	}

	static getExtension(name) {
		if (this.glContext) {
			if (this.#extensions.has(name)) {
				return this.#extensions.get(name);
			} else {
				let extension = this.glContext.getExtension(name);
				this.#extensions.set(name, extension);
				return extension;
			}
		}
		return null;
	}

	static set pixelRatio(pixelRatio) {
		this.#pixelRatio = pixelRatio;
		this._updateSize();
	}

	static get pixelRatio() {
		return this.#pixelRatio;
	}

	static setSize(width, height) {
		width = Math.max(width, 1);
		height = Math.max(height, 1);
		let previousWidth = this.#width;
		let previousHeight = this.#height;
		if (isNumeric(width)) {
			this.#width = width;
		}
		if (isNumeric(height)) {
			this.#height = height;
		}
		this._updateSize();
		GraphicsEvents.resize(width, height);
		return [previousWidth, previousHeight];
	}

	static getSize(ret = vec2.create()) {
		ret[0] = this.#width;
		ret[1] = this.#height;
		return ret;
	}

	static _updateSize() {
		this.#canvas.width = this.#width * this.#pixelRatio;
		this.#canvas.height = this.#height * this.#pixelRatio;
		if (USE_OFF_SCREEN_CANVAS) {
			this.#offscreenCanvas.width = this.#canvas.width;
			this.#offscreenCanvas.height = this.#canvas.height;
		}

		this.viewport = vec4.fromValues(0, 0, this.#width, this.#height);
	}

	static set viewport(viewport) {
		vec4.copy(this.#viewport, viewport);
		WebGLRenderingState.viewport(viewport);
	}

	static get viewport() {
		return vec4.clone(this.#viewport);
	}

	static set scissor(scissor) {
		vec4.copy(this.#scissor, scissor);
		WebGLRenderingState.scissor(scissor);
	}

	static set scissorTest(scissorTest) {
		if (scissorTest) {
			WebGLRenderingState.enable(GL_SCISSOR_TEST);
		} else {
			WebGLRenderingState.disable(GL_SCISSOR_TEST);
		}
	}

	static checkCanvasSize() {
		if (!this.#autoResize) {
			return;
		}
		const canvas = this.#canvas;
		if (!canvas.parentElement) {
			return;
		}
		const width = canvas.parentElement.clientWidth;
		const height = canvas.parentElement.clientHeight;

		if (width !== this.#width
			|| height !== this.#height) {
			this.setSize(width, height);
			if (VERBOSE) {
				console.log('Resizing canvas ', width, height);
			}
		}
	}

	static #initObserver() {
		const callback = (entries, observer) => {
			entries.forEach(entry => {
				this.checkCanvasSize();
			});
		};
		const resizeObserver = new ResizeObserver(callback);
		if (this.#canvas.parentElement) {
			resizeObserver.observe(this.#canvas.parentElement);
		}
	}

	static play() {
		this.#running = true;
		this._tick();
	}

	static pause() {
		this.#running = false;
	}

	static isRunning() {
		return this.#running;
	}

	static createFramebuffer() {
		if (ENABLE_GET_ERROR && DEBUG) {
			this.cleanupGLError();
		}
		let frameBuffer = this.glContext.createFramebuffer();
		if (ENABLE_GET_ERROR && DEBUG) {
			this.getGLError('createFramebuffer');
		}
		//this.frameBuffers.add(frameBuffer);
		return frameBuffer;
	}

	static deleteFramebuffer(frameBuffer) {
		this.glContext.deleteFramebuffer(frameBuffer);
	}

	static createRenderbuffer() {
		if (ENABLE_GET_ERROR && DEBUG) {
			this.cleanupGLError();
		}
		let renderBuffer = this.glContext.createRenderbuffer();
		if (ENABLE_GET_ERROR && DEBUG) {
			this.getGLError('createRenderbuffer');
		}
		if (renderBuffer) {
			this.#renderBuffers.add(renderBuffer);
		}
		return renderBuffer;
	}

	static setFramebuffer(framebuffer) {
		framebuffer.bind();
		//this.glContext.bindFramebuffer(_gl.FRAMEBUFFER, framebuffer);
	}

	static pushRenderTarget(renderTarget: RenderTarget) {
		this.#renderTargetStack.push(renderTarget);
		this.#setRenderTarget(renderTarget);
	}

	static popRenderTarget(): RenderTarget {
		this.#renderTargetStack.pop();
		const renderTarget = this.#renderTargetStack[this.#renderTargetStack.length - 1];
		this.#setRenderTarget(renderTarget);
		return renderTarget;
	}

	static #setRenderTarget(renderTarget?: RenderTarget) {
		if (renderTarget == undefined) {
			if (ENABLE_GET_ERROR && DEBUG) {
				this.cleanupGLError();
			}
			this.glContext.bindFramebuffer(GL_FRAMEBUFFER, null);
			if (ENABLE_GET_ERROR && DEBUG) {
				this.getGLError('bindFramebuffer');
			}
			this.viewport = vec4.fromValues(0, 0, this.#width, this.#height);
		} else {
			renderTarget.bind();
		}
	}

	static savePicture(scene, camera, filename, width, height) {
		let previousWidth = this.#width;
		let previousHeight = this.#height;
		let previousAutoResize = this.autoResize;
		try {
			this.autoResize = false;
			this.setSize(width, height);
			this.render(scene, camera, 0);
			this._savePicture(filename);
		} finally {
			this.autoResize = previousAutoResize;
			this.setSize(previousWidth, previousHeight);
		}
	}

	static async savePictureAsFile(filename: string) {
		return new File([await this.toBlob()], filename)
	}

	static async toBlob(): Promise<Blob> {
		let promiseResolve: (value: Blob) => void;
		const promise = new Promise<Blob>((resolve) => {
			promiseResolve = resolve;
		});
		const callback = function (blob) {
			promiseResolve(blob);
		};
		this.#canvas.toBlob(callback);
		return promise;
	}

	static _savePicture(filename) {
		const callback = function (blob) {
			//SaveFile(filename, blob);
			SaveFile(new File([blob], filename));
		};
		this.#canvas.toBlob(callback);
	}

	static startRecording(frameRate = 60, bitsPerSecond) {
		const stream = this.#canvas.captureStream(frameRate);
		this.#mediaRecorder = new MediaRecorder(stream, { mimeType: RECORDER_MIME_TYPE, bitsPerSecond: bitsPerSecond });
		this.#mediaRecorder.start();
	}

	static stopRecording(fileName = RECORDER_DEFAULT_FILENAME) {
		this.#mediaRecorder.ondataavailable = (event) => {
			const blob = new Blob([event.data], { 'type': RECORDER_MIME_TYPE });
			SaveFile(new File([blob], fileName));
		}
		this.#mediaRecorder.stop();
		//Stop the canvas stream
		this.#mediaRecorder.stream.getVideoTracks()[0].stop();
	}

	static get ready() {
		return this.#readyPromise;
	}

	static async isReady() {
		await this.#readyPromise;
	}

	static getParameter(parameterName) {
		return this.glContext?.getParameter(parameterName);
	}

	static cleanupGLError() {
		this.glContext.getError();//empty the error
	}

	static getGLError(reason) {
		let glError = this.glContext.getError();
		if (glError) {
			console.error(`GL Error in ${reason} : `, glError);
		}
	}

	static useLogDepth(use) {
		this.setIncludeCode('LOG_DEPTH', use ? '#define USE_LOG_DEPTH' : '');
	}

	static getTime() {
		return this.#time;
	}

	static getWidth() {
		return this.#width;
	}

	static getHeight() {
		return this.#height;
	}

	static getCanvas() {
		return this.#canvas;
	}
}
