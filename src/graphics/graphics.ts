import { vec2, vec4 } from 'gl-matrix';
import { saveFile } from 'harmony-browser-utils';
import { ShortcutHandler } from 'harmony-browser-utils';

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
import { createElement } from 'harmony-ui';

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

let graphics: Graphics | null = null;
export function getGraphics() {
	if (!graphics) {
		graphics = new Graphics();
	}
	return graphics;
}

export type RenderContext = {
	DisableToolRendering?: boolean;
}

type GraphicsInitOptions = {
	canvas?: HTMLCanvasElement,
	autoResize?: boolean,

	webGL?: {
		alpha?: boolean,
		depth?: boolean,
		stencil?: boolean,
		desynchronized?: boolean,
		antialias?: boolean,
		failIfMajorPerformanceCaveat?: boolean,
		powerPreference?: string,
		premultipliedAlpha?: boolean,
		preserveDrawingBuffer?: boolean,
	}
}

export class Graphics {
	static #instance: Graphics;
	#pixelRatio = /*window.devicePixelRatio ?? */1.0;
	#viewport = vec4.create();
	#scissor = vec4.create();
	#extensions = new Map<string, any>();
	#autoResize = false;
	isWebGL = false;
	isWebGL2 = false;
	autoClear = true;
	autoClearColor = false;
	autoClearDepth = true;
	autoClearStencil = true;
	#includeCode = new Map<string, string>();
	#globalIncludeCode = '';
	speed = 1.0;
	#timeOrigin = performance.now();
	#time = 0;
	#running = false;
	#lastTick = performance.now();
	currentTick = 0;
	#renderBuffers = new Set<WebGLRenderbuffer>();
	#renderTargetStack: Array<RenderTarget> = [];
	#readyPromiseResolve!: (value: boolean) => void;
	#readyPromise = new Promise<boolean>((resolve) => this.#readyPromiseResolve = resolve);
	#canvas?: HTMLCanvasElement;
	#width: number = 0;
	#height: number = 0;
	#offscreenCanvas?: OffscreenCanvas;
	#forwardRenderer?: ForwardRenderer;
	glContext!: WebGLAnyRenderingContext;
	#bipmapContext?: ImageBitmapRenderingContext | null;
	#pickedEntity: Entity | null = null;
	#animationFrame: number = 0;
	ANGLE_instanced_arrays: any;
	OES_texture_float_linear: any;
	#mediaRecorder?: MediaRecorder;
	dragging = false;

	constructor() {
		if (Graphics.#instance) {
			return Graphics.#instance;
		}
		Graphics.#instance = this;
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
	}

	initCanvas(contextAttributes: GraphicsInitOptions = {}) {
		this.#canvas = contextAttributes.canvas ?? createElement('canvas') as HTMLCanvasElement;
		if (!this.#canvas.hasAttribute('tabindex')) {
			this.#canvas.setAttribute('tabindex', "1");
		}
		ShortcutHandler.addContext('3dview', this.#canvas!);

		this.#width = this.#canvas!.width;
		this.#height = this.#canvas!.height;
		if (USE_OFF_SCREEN_CANVAS) {
			this.#offscreenCanvas = new OffscreenCanvas(this.#width, this.#height);
		}

		this.#initContext(contextAttributes);
		this.#initObserver();

		WebGLRenderingState.setGraphics(this);

		// init state
		WebGLRenderingState.enable(GL_CULL_FACE);
		// init state end
		//this.clearColor = vec4.fromValues(0, 0, 0, 255);
		this.#forwardRenderer = new ForwardRenderer(this);

		let autoResize = contextAttributes.autoResize;
		if (autoResize !== undefined) {
			this.autoResize = autoResize;
		}

		this.#canvas!.addEventListener('mousedown', (event: MouseEvent) => this.#mouseDown(event));
		this.#canvas!.addEventListener('mousemove', (event: MouseEvent) => this.#mouseMove(event));
		this.#canvas!.addEventListener('mouseup', (event: MouseEvent) => this.#mouseUp(event));
		this.#canvas!.addEventListener('keydown', (event: KeyboardEvent) => GraphicsEvents.keyDown(event));
		this.#canvas!.addEventListener('keyup', (event: KeyboardEvent) => GraphicsEvents.keyUp(event));
		this.#canvas!.addEventListener('wheel', (event: WheelEvent) => this.#wheel(event));
		this.#canvas!.addEventListener('touchstart', (event: TouchEvent) => GraphicsEvents.touchStart(this.#pickedEntity, event));
		this.#canvas!.addEventListener('touchmove', (event: TouchEvent) => GraphicsEvents.touchMove(this.#pickedEntity, event));
		this.#canvas!.addEventListener('touchcancel', (event: TouchEvent) => GraphicsEvents.touchCancel(this.#pickedEntity, event));

		this.#readyPromiseResolve(true);
		return this;
	}

	pickEntity(x: number, y: number) {
		if (!this.#canvas) {
			return null;
		}
		this.setIncludeCode('pickingMode', '#define PICKING_MODE');
		GraphicsEvents.tick(0, performance.now(), 0);
		this.setIncludeCode('pickingMode', '#undef PICKING_MODE');

		const gl = this.glContext;
		let pixels = new Uint8Array(4);
		this.glContext?.readPixels(x, this.#canvas.height - y, 1, 1, GL_RGBA, GL_UNSIGNED_BYTE, pixels);

		let pickedEntityIndex = (pixels[0] << 16) + (pixels[1] << 8) + (pixels[2]);
		return pickList.get(pickedEntityIndex) ?? null;
	}

	#mouseDown(event: MouseEvent) {
		this.#canvas!.focus();
		let x = event.offsetX;
		let y = event.offsetY;
		this.#pickedEntity = this.pickEntity(x, y);
		GraphicsEvents.mouseDown(x, y, this.#pickedEntity, event);
	}

	#mouseMove(event: MouseEvent) {
		let x = event.offsetX;
		let y = event.offsetY;
		GraphicsEvents.mouseMove(x, y, this.#pickedEntity, event);
	}

	#mouseUp(event: MouseEvent) {
		let x = event.offsetX;
		let y = event.offsetY;
		GraphicsEvents.mouseUp(x, y, this.#pickedEntity, event);
		this.#pickedEntity = null;
	}

	#wheel(event: WheelEvent) {
		let x = event.offsetX;
		let y = event.offsetY;
		GraphicsEvents.wheel(x, y, this.#pickedEntity, event);
		this.#pickedEntity = null;
	}

	getDefinesAsString(material: Material) {//TODOv3 rename var material
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

	render(scene: Scene, camera: Camera, delta: number, context: RenderContext) {
		if (MEASURE_PERFORMANCE) {
			WebGLStats.beginRender();
		}
		this.renderBackground();//TODOv3 put in rendering pipeline
		this.#forwardRenderer!.render(scene, camera, delta, context);

		if (USE_OFF_SCREEN_CANVAS) {
			let bitmap = this.#offscreenCanvas!.transferToImageBitmap();
			this.#bipmapContext?.transferFromImageBitmap(bitmap);
		}

		if (MEASURE_PERFORMANCE) {
			var t1 = performance.now();
			if (USE_STATS) {
				WebGLStats.endRender();
			}
		}
	}

	renderBackground() {
		if (this.autoClear) {
			this.clear(this.autoClearColor, this.autoClearDepth, this.autoClearStencil);
		}
	}

	clear(color: boolean, depth: boolean, stencil: boolean) {
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

	_tick() {
		cancelAnimationFrame(this.#animationFrame);
		let queueTask;
		if (FULL_PATATE && TESTING) {
			queueTask = (task: () => void) => {
				const mc = new MessageChannel();
				mc.port1.onmessage = () => task.apply(task);
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
			GraphicsEvents.tick(delta, tick, this.speed);
		}
		this.#lastTick = tick;
		if (FULL_PATATE && TESTING) {
			queueTask!(() => this._tick());
		}
	}

	#initContext(contextAttributes: GraphicsInitOptions) {
		const canvas = USE_OFF_SCREEN_CANVAS ? this.#offscreenCanvas : this.#canvas;
		if (USE_OFF_SCREEN_CANVAS) {
			this.#bipmapContext = this.#canvas!.getContext('bitmaprenderer');
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

	set shaderPrecision(shaderPrecision: ShaderPrecision) {
		this.setShaderPrecision(shaderPrecision);
	}

	setShaderPrecision(shaderPrecision: ShaderPrecision) {
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

	setShaderQuality(shaderQuality: ShaderQuality) {
		this.setIncludeCode('SHADER_QUALITY', `#define SHADER_QUALITY ${shaderQuality}`);
	}

	setShaderDebugMode(shaderDebugMode: ShaderDebugMode) {
		this.setIncludeCode('SHADER_DEBUG_MODE', `#define SHADER_DEBUG_MODE ${shaderDebugMode}`);
	}

	setIncludeCode(key: string, code: string) {
		this.#includeCode.set(key, code);
		this.#refreshIncludeCode();
	}

	removeIncludeCode(key: string) {
		this.#includeCode.delete(key);
		this.#refreshIncludeCode();
	}

	#refreshIncludeCode() {
		this.#globalIncludeCode = '';
		for (let code of this.#includeCode.values()) {
			this.#globalIncludeCode += code + '\n';
		}
	}

	getIncludeCode() {
		return this.#globalIncludeCode;
	}

	/**
	 * Invalidate all shader (force recompile)
	 */
	invalidateShaders() {
		if (this.#forwardRenderer) {
			this.#forwardRenderer.invalidateShaders();
		}

		/*for (let shader of this._materialsProgram) {
			shader.invalidate();
		}*/
	}

	clearColor(clearColor: vec4) {
		WebGLRenderingState.clearColor(clearColor);
	}

	getClearColor(clearColor?: vec4) {
		return WebGLRenderingState.getClearColor(clearColor);
	}

	clearDepth(clearDepth: GLclampf) {
		WebGLRenderingState.clearDepth(clearDepth);
	}

	clearStencil(clearStencil: GLint) {
		WebGLRenderingState.clearStencil(clearStencil);
	}

	setColorMask(mask: vec4) {
		WebGLRenderingState.colorMask(mask);
	}

	set autoResize(autoResize) {
		this.#autoResize = autoResize;
		if (autoResize) {
			this.checkCanvasSize();
		}
	}

	get autoResize() {
		return this.#autoResize;
	}

	getExtension(name: string) {
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

	set pixelRatio(pixelRatio) {
		this.#pixelRatio = pixelRatio;
		this.#updateSize();
	}

	get pixelRatio() {
		return this.#pixelRatio;
	}

	setSize(width: number, height: number) {
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
		this.#updateSize();
		GraphicsEvents.resize(width, height);
		return [previousWidth, previousHeight];
	}

	getSize(ret = vec2.create()) {
		ret[0] = this.#width;
		ret[1] = this.#height;
		return ret;
	}

	#updateSize() {
		if (!this.#canvas) {
			return;
		}
		this.#canvas.width = this.#width * this.#pixelRatio;
		this.#canvas.height = this.#height * this.#pixelRatio;
		if (USE_OFF_SCREEN_CANVAS) {
			this.#offscreenCanvas!.width = this.#canvas.width;
			this.#offscreenCanvas!.height = this.#canvas.height;
		}

		this.viewport = vec4.fromValues(0, 0, this.#width, this.#height);
	}

	set viewport(viewport) {
		vec4.copy(this.#viewport, viewport);
		WebGLRenderingState.viewport(viewport);
	}

	get viewport() {
		return vec4.clone(this.#viewport);
	}

	set scissor(scissor: vec4) {
		vec4.copy(this.#scissor, scissor);
		WebGLRenderingState.scissor(scissor);
	}

	set scissorTest(scissorTest: boolean) {
		if (scissorTest) {
			WebGLRenderingState.enable(GL_SCISSOR_TEST);
		} else {
			WebGLRenderingState.disable(GL_SCISSOR_TEST);
		}
	}

	checkCanvasSize() {
		if (!this.#autoResize) {
			return;
		}
		const canvas = this.#canvas;
		if (!canvas?.parentElement) {
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

	#initObserver() {
		const callback: ResizeObserverCallback = (entries, observer) => {
			entries.forEach(entry => {
				this.checkCanvasSize();
			});
		};
		const resizeObserver = new ResizeObserver(callback);
		if (this.#canvas?.parentElement) {
			resizeObserver.observe(this.#canvas.parentElement);
		}
	}

	play() {
		this.#running = true;
		this._tick();
	}

	pause() {
		this.#running = false;
	}

	isRunning() {
		return this.#running;
	}

	createFramebuffer() {
		if (ENABLE_GET_ERROR && DEBUG) {
			this.cleanupGLError();
		}
		let frameBuffer = this.glContext!.createFramebuffer();
		if (ENABLE_GET_ERROR && DEBUG) {
			this.getGLError('createFramebuffer');
		}
		//this.frameBuffers.add(frameBuffer);
		return frameBuffer;
	}

	deleteFramebuffer(frameBuffer: WebGLFramebuffer) {
		this.glContext!.deleteFramebuffer(frameBuffer);
	}

	createRenderbuffer() {
		if (ENABLE_GET_ERROR && DEBUG) {
			this.cleanupGLError();
		}
		let renderBuffer = this.glContext!.createRenderbuffer();
		if (ENABLE_GET_ERROR && DEBUG) {
			this.getGLError('createRenderbuffer');
		}
		if (renderBuffer) {
			this.#renderBuffers.add(renderBuffer);
		}
		return renderBuffer;
	}

	deleteRenderbuffer(renderBuffer: WebGLRenderbuffer) {
		this.glContext!.deleteRenderbuffer(renderBuffer);
	}

	/*
	setFramebuffer(framebuffer: WebGLFramebuffer) {
		framebuffer.bind();
		//this.glContext.bindFramebuffer(_gl.FRAMEBUFFER, framebuffer);
	}
	*/

	pushRenderTarget(renderTarget: RenderTarget) {
		this.#renderTargetStack.push(renderTarget);
		this.#setRenderTarget(renderTarget);
	}

	popRenderTarget(): RenderTarget {
		this.#renderTargetStack.pop();
		const renderTarget = this.#renderTargetStack[this.#renderTargetStack.length - 1];
		this.#setRenderTarget(renderTarget);
		return renderTarget;
	}

	#setRenderTarget(renderTarget?: RenderTarget) {
		if (renderTarget == undefined) {
			if (ENABLE_GET_ERROR && DEBUG) {
				this.cleanupGLError();
			}
			this.glContext!.bindFramebuffer(GL_FRAMEBUFFER, null);
			if (ENABLE_GET_ERROR && DEBUG) {
				this.getGLError('bindFramebuffer');
			}
			this.viewport = vec4.fromValues(0, 0, this.#width, this.#height);
		} else {
			renderTarget.bind();
		}
	}

	savePicture(scene: Scene, camera: Camera, filename: string, width: number, height: number) {
		let previousWidth = this.#width;
		let previousHeight = this.#height;
		let previousAutoResize = this.autoResize;
		try {
			this.autoResize = false;
			this.setSize(width, height);
			this.render(scene, camera, 0, { DisableToolRendering: true });
			this._savePicture(filename);
		} finally {
			this.autoResize = previousAutoResize;
			this.setSize(previousWidth, previousHeight);
		}
	}

	async savePictureAsFile(filename: string) {
		return new File([await this.toBlob() ?? new Blob()], filename)
	}

	async toBlob(): Promise<Blob | null> {
		let promiseResolve: (value: Blob | null) => void;
		const promise = new Promise<Blob | null>((resolve) => {
			promiseResolve = resolve;
		});
		const callback = function (blob: Blob | null) {
			promiseResolve(blob);
		};
		this.#canvas!.toBlob(callback);
		return promise;
	}

	async _savePicture(filename: string) {
		/*
		const callback = function (blob) {
			//saveFile(filename, blob);
		};
		this.#canvas.toBlob(callback);*/
		saveFile(await this.savePictureAsFile(filename));
	}

	startRecording(frameRate = 60, bitsPerSecond: number) {
		const stream = this.#canvas!.captureStream(frameRate);
		this.#mediaRecorder = new MediaRecorder(stream, { mimeType: RECORDER_MIME_TYPE, bitsPerSecond: bitsPerSecond });
		this.#mediaRecorder.start();
	}

	stopRecording(fileName = RECORDER_DEFAULT_FILENAME) {
		if (!this.#mediaRecorder) {
			return;
		}
		this.#mediaRecorder.ondataavailable = (event) => {
			const blob = new Blob([event.data], { 'type': RECORDER_MIME_TYPE });
			saveFile(new File([blob], fileName));
		}
		this.#mediaRecorder.stop();
		//Stop the canvas stream
		this.#mediaRecorder.stream.getVideoTracks()[0].stop();
	}

	get ready() {
		return this.#readyPromise;
	}

	async isReady() {
		await this.#readyPromise;
	}

	getParameter(param: GLenum) {
		return this.glContext?.getParameter(param);
	}

	cleanupGLError() {
		this.glContext?.getError();//empty the error
	}

	getGLError(context: string) {
		let glError = this.glContext?.getError() ?? 0;
		if (glError) {
			console.error(`GL Error in ${context} : `, glError);
		}
	}

	useLogDepth(use: boolean) {
		this.setIncludeCode('LOG_DEPTH', use ? '#define USE_LOG_DEPTH' : '');
	}

	getTime() {
		return this.#time;
	}

	getWidth() {
		return this.#width;
	}

	getHeight() {
		return this.#height;
	}

	getCanvas() {
		return this.#canvas;
	}

	getForwardRenderer() {
		return this.#forwardRenderer;
	}
}
