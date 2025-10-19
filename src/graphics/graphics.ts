import { ReadonlyVec4, vec2, vec4 } from 'gl-matrix';
import { saveFile, ShortcutHandler } from 'harmony-browser-utils';
import { createElement } from 'harmony-ui';
import { DEBUG, DISABLE_WEBGL2, ENABLE_GET_ERROR, MEASURE_PERFORMANCE, TESTING, USE_STATS, VERBOSE } from '../buildoptions';
import { Camera } from '../cameras/camera';
import { Composer } from '../composer/composer';
import { MAX_HARDWARE_BONES, RECORDER_DEFAULT_FILENAME, RECORDER_MIME_TYPE } from '../constants';
import { Entity } from '../entities/entity';
import { pickList } from '../entities/picklist';
import { RenderContext } from '../interfaces/rendercontext';
import { Material } from '../materials/material';
import { isNumeric } from '../math/functions';
import { ForwardRenderer } from '../renderers/forwardrenderer';
import { Scene } from '../scenes/scene';
import { RenderTarget } from '../textures/rendertarget';
import { setTextureFactoryContext } from '../textures/texturefactory';
import { WebGLAnyRenderingContext } from '../types';
import { WebGLStats } from '../utils/webglstats';
import { GL_COLOR_BUFFER_BIT, GL_CULL_FACE, GL_DEPTH_BUFFER_BIT, GL_FRAMEBUFFER, GL_RGBA, GL_SCISSOR_TEST, GL_STENCIL_BUFFER_BIT, GL_UNSIGNED_BYTE } from '../webgl/constants';
import { WebGLRenderingState } from '../webgl/renderingstate';
import { WebGLShaderSource } from '../webgl/shadersource';
import { setGraphics } from './graphics2';
import { GraphicsEvents } from './graphicsevents';
import { Viewport } from './viewport';

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

interface GraphicsInitOptions {
	/**
	 * The canvas to render into. Method getContext() must not have been called on the canvas.
	 * If no canvas is provided, one will be created.
	 * If useOffscreenCanvas is true, the canvas will be ignored.
	*/
	canvas?: HTMLCanvasElement,
	/** Render using an OffscreenCanvas. Allow rendering to several canvas on a page. Default to false. */
	useOffscreenCanvas?: boolean,
	/** Auto resize the canvas to fit its parent. Default to false. */
	autoResize?: boolean,

	/** WebGL attributes passed to getContext() */
	webGL?: WebGLContextAttributes
}

interface AddCanvasOptions {
	/** Canvas name. Default to an empty string. */
	name?: string;
	/** Set the canvas state to enabled. A disabled canvas will not render. Default to true. */
	enabled?: boolean;
	/** Auto resize the canvas to fit its parent. Default to false. */
	autoResize?: boolean;
	/** Add a single scene to the canvas. A scene can be part of several canvases. If scenes is provided, this property will be ignored. */
	scene?: Scene | CanvasScene;
	/** Add several scenes to the canvas. */
	scenes?: CanvasScene[];
}

/**
 * Definition of a single scene rendered into a Canvas.
 * initCanvas must be called with useOffscreenCanvas = true to take effect
 */
export type CanvasScene = {
	/** Rendered scene. Ignored if composer exist and is enabled */
	scene?: Scene,
	/** Camera. If none provided, scene activeCamera will be used. */
	camera?: Camera,
	/** Viewport. If none provided, The whole canvas will be used. */
	viewport?: Viewport,
	/** Render a composer instead of a scene. */
	composer?: Composer,
}

/**
 * Definition of a single canvas on the page.
 * initCanvas must be called with useOffscreenCanvas = true to take effect
 */
export type Canvas = {
	/** Canvas name. Default to an empty string. */
	name: string;
	/** Enable rendering. */
	enabled: boolean;
	/** Html canvas. */
	canvas: HTMLCanvasElement;
	/** Rendering context associated with the canvas. */
	context: ImageBitmapRenderingContext;
	/** List of scenes rendered to this canvas. Several scenes can be rendered to a single Canvas using Viewports */
	scenes: CanvasScene[];
	/** Auto resize this canvas to fit it's container */
	autoResize: boolean;
}

type RenderTargetEntry = {
	renderTarget: RenderTarget | null;
	viewport: ReadonlyVec4;
}

class Graphics {
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
	static #renderTargetStack: RenderTargetEntry[] = [];
	static #readyPromiseResolve: (value: boolean) => void;
	static #readyPromise = new Promise<boolean>((resolve) => this.#readyPromiseResolve = resolve);
	static #canvas?: HTMLCanvasElement;
	static #canvases = new Map<HTMLCanvasElement, Canvas>();
	static #width = 300;
	static #height = 150;
	static #offscreenCanvas?: OffscreenCanvas;
	static #forwardRenderer?: ForwardRenderer;
	static glContext: WebGLAnyRenderingContext;
	static #bipmapContext?: ImageBitmapRenderingContext | null;
	static #pickedEntity: Entity | null = null;
	static #animationFrame = 0;
	static ANGLE_instanced_arrays: ANGLE_instanced_arrays;
	static OES_texture_float_linear: any;
	static #mediaRecorder?: MediaRecorder;
	static dragging = false;
	static #allowTransfertBitmap = true;// TODO: find a better way to do that
	static #mouseDownFunc = (event: MouseEvent) => this.#mouseDown(event);
	static #mouseMoveFunc = (event: MouseEvent) => this.#mouseMove(event);
	static #mouseUpFunc = (event: MouseEvent) => this.#mouseUp(event);
	static #keyDownFunc = (event: KeyboardEvent) => GraphicsEvents.keyDown(event);
	static #keyUpFunc = (event: KeyboardEvent) => GraphicsEvents.keyUp(event);
	static #wheelFunc = (event: WheelEvent) => this.#wheel(event);
	static #touchStartFunc = (event: TouchEvent) => GraphicsEvents.touchStart(this.#pickedEntity, event);
	static #touchMoveFunc = (event: TouchEvent) => GraphicsEvents.touchMove(this.#pickedEntity, event);
	static #touchCancelFunc = (event: TouchEvent) => GraphicsEvents.touchCancel(this.#pickedEntity, event);

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
	}

	static initCanvas(contextAttributes: GraphicsInitOptions = {}) {
		if (contextAttributes.useOffscreenCanvas) {
			this.#offscreenCanvas = new OffscreenCanvas(0, 0);
		} else {
			this.#canvas = contextAttributes.canvas ?? createElement('canvas') as HTMLCanvasElement;
			ShortcutHandler.addContext('3dview', this.#canvas);
			this.#width = this.#canvas.width;
			this.#height = this.#canvas.height;
			this.listenCanvas(this.#canvas);
		}
		/*
		if (!this.#canvas.hasAttribute('tabindex')) {
			this.#canvas.setAttribute('tabindex', "1");
		}
		*/

		this.#initContext(contextAttributes);
		this.#initObserver();

		WebGLRenderingState.setGraphics();

		// init state
		WebGLRenderingState.enable(GL_CULL_FACE);
		// init state end
		//this.clearColor = vec4.fromValues(0, 0, 0, 255);
		this.#forwardRenderer = new ForwardRenderer();

		const autoResize = contextAttributes.autoResize;
		if (autoResize !== undefined) {
			this.autoResize = autoResize;
		}

		this.#readyPromiseResolve(true);
		return this;
	}

	static addCanvas(canvas: HTMLCanvasElement | undefined, options: AddCanvasOptions): HTMLCanvasElement {
		canvas = canvas ?? createElement('canvas') as HTMLCanvasElement;
		if (this.#canvases.has(canvas)) {
			return canvas;
		}

		this.listenCanvas(canvas);

		try {
			const bipmapContext = canvas.getContext('bitmaprenderer');
			if (!bipmapContext) {
				return canvas;
			}

			let scenes: CanvasScene[];
			if (options.scenes) {
				scenes = options.scenes;
			} else {
				const scene = options.scene;
				if (scene) {
					if (scene instanceof Scene) {
						scenes = [{ scene: scene, viewport: { x: 0, y: 0, width: 1, height: 1 } }];
					} else {
						scenes = [scene];
					}
				} else {
					scenes = [];
				}
			}

			this.#canvases.set(canvas, {
				name: options.name ?? ' ',
				enabled: true,
				canvas: canvas,
				context: bipmapContext,
				scenes: scenes,
				autoResize: options.autoResize ?? false,
			});
		} catch (e) { }

		return canvas;
	}


	static removeCanvas(canvas: HTMLCanvasElement): void {
		if (this.#canvases.has(canvas)) {
			this.unlistenCanvas(canvas);
			this.#canvases.delete(canvas);
		}
	}

	static enableCanvas(canvas: HTMLCanvasElement, enable: boolean): void {
		const c = this.#canvases.get(canvas)
		if (c) {
			c.enabled = enable;
		}
	}

	static listenCanvas(canvas: HTMLCanvasElement): void {
		canvas.addEventListener('mousedown', this.#mouseDownFunc);
		canvas.addEventListener('mousemove', this.#mouseMoveFunc);
		canvas.addEventListener('mouseup', this.#mouseUpFunc);
		canvas.addEventListener('keydown', this.#keyDownFunc);
		canvas.addEventListener('keyup', this.#keyUpFunc);
		canvas.addEventListener('wheel', this.#wheelFunc);
		canvas.addEventListener('touchstart', this.#touchStartFunc);
		canvas.addEventListener('touchmove', this.#touchMoveFunc);
		canvas.addEventListener('touchcancel', this.#touchCancelFunc);
		if (!canvas.hasAttribute('tabindex')) {
			canvas.setAttribute('tabindex', "1");
		}
	}

	static unlistenCanvas(canvas: HTMLCanvasElement): void {
		canvas.removeEventListener('mousedown', this.#mouseDownFunc);
		canvas.removeEventListener('mousemove', this.#mouseMoveFunc);
		canvas.removeEventListener('mouseup', this.#mouseUpFunc);
		canvas.removeEventListener('keydown', this.#keyDownFunc);
		canvas.removeEventListener('keyup', this.#keyUpFunc);
		canvas.removeEventListener('wheel', this.#wheelFunc);
		canvas.removeEventListener('touchstart', this.#touchStartFunc);
		canvas.removeEventListener('touchmove', this.#touchMoveFunc);
		canvas.removeEventListener('touchcancel', this.#touchCancelFunc);
	}

	static pickEntity(htmlCanvas: HTMLCanvasElement, x: number, y: number) {
		this.setIncludeCode('pickingMode', '#define PICKING_MODE');
		this.#allowTransfertBitmap = false;
		GraphicsEvents.tick(0, performance.now(), 0);
		this.#allowTransfertBitmap = true;
		this.setIncludeCode('pickingMode', '#undef PICKING_MODE');

		const gl = this.glContext;
		const pixels = new Uint8Array(4);
		this.glContext?.readPixels(x, htmlCanvas.height - y, 1, 1, GL_RGBA, GL_UNSIGNED_BYTE, pixels);

		const pickedEntityIndex = (pixels[0]! << 16) + (pixels[1]! << 8) + (pixels[2]!);
		return pickList.get(pickedEntityIndex) ?? null;
	}

	static #mouseDown(event: MouseEvent) {
		const htmlCanvas = event.target as HTMLCanvasElement;
		htmlCanvas.focus();
		const x = event.offsetX;
		const y = event.offsetY;
		this.#pickedEntity = this.pickEntity(htmlCanvas, x, y);
		GraphicsEvents.mouseDown(x, y, htmlCanvas.width, htmlCanvas.height, this.#pickedEntity, event);
	}

	static #mouseMove(event: MouseEvent) {
		const htmlCanvas = event.target as HTMLCanvasElement;
		const x = event.offsetX;
		const y = event.offsetY;
		GraphicsEvents.mouseMove(x, y, htmlCanvas.width, htmlCanvas.height, this.#pickedEntity, event);
	}

	static #mouseUp(event: MouseEvent) {
		const htmlCanvas = event.target as HTMLCanvasElement;
		const x = event.offsetX;
		const y = event.offsetY;
		GraphicsEvents.mouseUp(x, y, htmlCanvas.width, htmlCanvas.height, this.#pickedEntity, event);
		this.#pickedEntity = null;
	}

	static #wheel(event: WheelEvent) {
		const x = event.offsetX;
		const y = event.offsetY;
		GraphicsEvents.wheel(x, y, this.#pickedEntity, event);
		this.#pickedEntity = null;
		event.preventDefault();
	}

	static getDefinesAsString(material: Material) {//TODOv3 rename var material
		const defines: string[] = [];
		for (const [name, value] of Object.entries(material.defines)) {
			if (value === false) {
				defines.push('#undef ' + name + ' ' + value);
			} else {
				defines.push('#define ' + name + ' ' + value);
			}
		}
		return defines.join('\n') + '\n';
	}

	static render(scene: Scene, camera: Camera, delta: number, context: RenderContext) {
		if (MEASURE_PERFORMANCE) {
			WebGLStats.beginRender();
		}

		if (this.#offscreenCanvas) {
			let width = context.width ?? this.#offscreenCanvas.width;
			let height = context.height ?? this.#offscreenCanvas.height;
			this.#offscreenCanvas.width = width;
			this.#offscreenCanvas.height = height;
			this.setViewport(vec4.fromValues(0, 0, width, height));
		} else {
			const htmlCanvas = this.#canvas!;
			const parentElement = htmlCanvas.parentElement ?? (htmlCanvas.parentNode as ShadowRoot).host;
			if (this.autoResize && parentElement) {
				const width = context.width ?? parentElement.clientWidth;
				const height = context.height ?? parentElement.clientHeight;

				htmlCanvas.width = width * this.#pixelRatio;
				htmlCanvas.height = height * this.#pixelRatio;
				this.setViewport(vec4.fromValues(0, 0, width, height));
			}
		}

		this.renderBackground();//TODOv3 put in rendering pipeline


		const width = this.#canvas?.width ?? this.#offscreenCanvas?.width ?? 0;
		const height = this.#canvas?.height ?? this.#offscreenCanvas?.height ?? 0;

		if (camera.autoResize) {
			camera.left = -width;
			camera.right = width;
			camera.bottom = -height;
			camera.top = height;
			camera.aspectRatio = width / height;
		}

		this.#forwardRenderer!.render(scene, camera, delta, {
			renderContext: context,
			width: width,
			height: height,
		});

		//const bipmapContext = context.imageBitmap?.context ?? this.#bipmapContext;
		if (this.#offscreenCanvas && context.transferBitmap !== false && this.#bipmapContext && this.#allowTransfertBitmap) {
			const bitmap = this.#offscreenCanvas!.transferToImageBitmap();
			this.#bipmapContext.transferFromImageBitmap(bitmap);
		}

		if (MEASURE_PERFORMANCE) {
			const t1 = performance.now();
			if (USE_STATS) {
				WebGLStats.endRender();
			}
		}
	}

	static renderMultiCanvas(delta: number, context: RenderContext = {}) {
		// TODO: mutualize with the method render()
		for (const [_, canvas] of this.#canvases) {
			if (canvas.enabled) {
				this.#renderMultiCanvas(canvas, delta, context);
			}
		}
	}

	static #renderMultiCanvas(canvas: Canvas, delta: number, context: RenderContext) {
		// TODO: mutualize with the method render()
		if (MEASURE_PERFORMANCE) {
			WebGLStats.beginRender();
		}

		if (!canvas.canvas.checkVisibility()) {
			return;
		}

		if (this.#offscreenCanvas) {
			const htmlCanvas = canvas.canvas;
			const parentElement = htmlCanvas.parentElement ?? (htmlCanvas.parentNode as ShadowRoot).host;
			if (canvas.autoResize && parentElement) {
				const width = context.width ?? parentElement.clientWidth;
				const height = context.height ?? parentElement.clientHeight;
				this.#offscreenCanvas.width = width;
				this.#offscreenCanvas.height = height;

				canvas.canvas.width = width * this.#pixelRatio;
				canvas.canvas.height = height * this.#pixelRatio;
			} else {
				this.#offscreenCanvas.width = context.width ?? canvas.canvas.width;
				this.#offscreenCanvas.height = context.height ?? canvas.canvas.height;
			}
			this.setViewport(vec4.fromValues(0, 0, this.#offscreenCanvas.width, this.#offscreenCanvas.height));
		}

		this.renderBackground();//TODOv3 put in rendering pipeline

		for (const canvasScene of canvas.scenes) {
			// TODO: setup viewport
			const composer = canvasScene.composer;
			if (composer?.enabled) {
				composer.setSize(canvas.canvas.width, canvas.canvas.height);
				composer.render(delta, context);
				break;
			}

			const scene = canvasScene.scene;
			const camera = canvasScene.camera ?? scene?.activeCamera;
			if (scene && camera) {
				const w = canvas.canvas.width;
				const h = canvas.canvas.height;
				if (camera.autoResize) {
					camera.left = -w;
					camera.right = w;
					camera.bottom = -h;
					camera.top = h;
					camera.aspectRatio = w / h;
				}
				this.#forwardRenderer!.render(scene, camera, delta, { renderContext: context, width: w, height: h });
			}
		}

		if (this.#allowTransfertBitmap && context.transferBitmap !== false) {
			const bitmap = this.#offscreenCanvas!.transferToImageBitmap();
			canvas.context.transferFromImageBitmap(bitmap);
		}

		if (MEASURE_PERFORMANCE) {
			const t1 = performance.now();
			if (USE_STATS) {
				WebGLStats.endRender();
			}
		}
	}

	/**
	 * Transfers the content of the offscreen canvas to a bitmap an return the newly allocated bitmap.
	 *
	 * @remarks
	 *
	 * The caller is responsible to either consume or close the bitmap.
	 *
	 * @returns The transfered bitmap. If an error occur or Graphics was initialized with useOffscreenCanvas = false, null is returned.
	 */
	static transferOffscreenToImageBitmap(): ImageBitmap | null {
		try {
			const bitmap = this.#offscreenCanvas?.transferToImageBitmap()
			if (bitmap) {
				return bitmap;
			}
		} catch { }
		return null;
	}

	static renderBackground() {
		if (this.autoClear) {
			this.clear(this.autoClearColor, this.autoClearDepth, this.autoClearStencil);
		}
	}

	static clear(color: boolean, depth: boolean, stencil: boolean) {
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
		const delta = (tick - this.#lastTick) * this.speed * 0.001;
		if (this.#running) {
			++this.currentTick;
			GraphicsEvents.tick(delta, tick, this.speed);
		}
		this.#lastTick = tick;
		if (FULL_PATATE && TESTING) {
			queueTask!(() => this._tick());
		}
	}

	static #initContext(contextAttributes: GraphicsInitOptions) {
		const canvas = this.#offscreenCanvas ?? this.#canvas;
		if (this.#offscreenCanvas) {
			//this.#bipmapContext = this.#canvas.getContext('bitmaprenderer');
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

	/**
	 * @deprecated Please use `setShaderPrecision` instead.
	 */
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
		for (const code of this.#includeCode.values()) {
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

	static clearColor(clearColor: vec4) {
		WebGLRenderingState.clearColor(clearColor);
	}

	static getClearColor(clearColor?: vec4) {
		return WebGLRenderingState.getClearColor(clearColor);
	}

	static clearDepth(clearDepth: GLclampf) {
		WebGLRenderingState.clearDepth(clearDepth);
	}

	static clearStencil(clearStencil: GLint) {
		WebGLRenderingState.clearStencil(clearStencil);
	}

	static setColorMask(mask: vec4) {
		WebGLRenderingState.colorMask(mask);
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

	static getExtension(name: string) {
		if (this.glContext) {
			if (this.#extensions.has(name)) {
				return this.#extensions.get(name);
			} else {
				const extension = this.glContext.getExtension(name);
				this.#extensions.set(name, extension);
				return extension;
			}
		}
		return null;
	}

	static set pixelRatio(pixelRatio) {
		this.#pixelRatio = pixelRatio;
		this.#updateSize();
	}

	static get pixelRatio() {
		return this.#pixelRatio;
	}

	static setSize(width: number | undefined, height: number | undefined): [number, number] {
		width = width ?? this.#width;
		height = height ?? this.#height;
		const previousWidth = this.#width;
		const previousHeight = this.#height;
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

	static getSize(ret = vec2.create()) {
		ret[0] = this.#width;
		ret[1] = this.#height;
		return ret;
	}

	static #updateSize() {
		if (!this.#canvas) {
			return;
		}
		this.#canvas.width = this.#width * this.#pixelRatio;
		this.#canvas.height = this.#height * this.#pixelRatio;
		if (this.#offscreenCanvas) {
			this.#offscreenCanvas!.width = this.#canvas.width;
			this.#offscreenCanvas!.height = this.#canvas.height;
		}

		this.setViewport(vec4.fromValues(0, 0, this.#width, this.#height));///ODO: optimize
	}

	static setViewport(viewport: ReadonlyVec4): void {
		vec4.copy(this.#viewport, viewport);
		WebGLRenderingState.viewport(viewport);
	}

	/**
	 * @deprecated Please use `setViewport` instead.
	 */
	static set viewport(viewport: ReadonlyVec4) {
		this.setViewport(viewport);
	}

	static getViewport(out: vec4): vec4 {
		return vec4.copy(out, this.#viewport);
	}

	/**
	 * @deprecated Please use `getViewport` instead.
	 */
	static get viewport() {
		return this.getViewport(vec4.create());
	}

	static set scissor(scissor: ReadonlyVec4) {
		vec4.copy(this.#scissor, scissor);
		WebGLRenderingState.scissor(scissor);
	}

	static set scissorTest(scissorTest: boolean) {
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

	static #initObserver() {
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
		const frameBuffer = this.glContext!.createFramebuffer();
		if (ENABLE_GET_ERROR && DEBUG) {
			this.getGLError('createFramebuffer');
		}
		//this.frameBuffers.add(frameBuffer);
		return frameBuffer;
	}

	static deleteFramebuffer(frameBuffer: WebGLFramebuffer) {
		this.glContext!.deleteFramebuffer(frameBuffer);
	}

	static createRenderbuffer() {
		if (ENABLE_GET_ERROR && DEBUG) {
			this.cleanupGLError();
		}
		const renderBuffer = this.glContext!.createRenderbuffer();
		if (ENABLE_GET_ERROR && DEBUG) {
			this.getGLError('createRenderbuffer');
		}
		if (renderBuffer) {
			this.#renderBuffers.add(renderBuffer);
		}
		return renderBuffer;
	}

	static deleteRenderbuffer(renderBuffer: WebGLRenderbuffer) {
		this.glContext!.deleteRenderbuffer(renderBuffer);
	}

	/*
	setFramebuffer(framebuffer: WebGLFramebuffer) {
		framebuffer.bind();
		//this.glContext.bindFramebuffer(_gl.FRAMEBUFFER, framebuffer);
	}
	*/

	static pushRenderTarget(renderTarget: RenderTarget | null) {
		const viewport = this.getViewport(vec4.create());
		this.#renderTargetStack.push({ renderTarget: renderTarget, viewport: viewport });
		this.#setRenderTarget(renderTarget, viewport);
	}

	static popRenderTarget(): void {
		const popResult = this.#renderTargetStack.pop();
		const target = this.#renderTargetStack[this.#renderTargetStack.length - 1];
		if (target) {
			this.#setRenderTarget(target.renderTarget, target.viewport);
		} else {
			if (popResult) {
				this.#setRenderTarget(null, popResult?.viewport);
			}
		}
	}

	static #setRenderTarget(renderTarget: RenderTarget | null, viewport: ReadonlyVec4) {
		if (!renderTarget) {
			if (ENABLE_GET_ERROR && DEBUG) {
				this.cleanupGLError();
			}
			this.glContext!.bindFramebuffer(GL_FRAMEBUFFER, null);
			if (ENABLE_GET_ERROR && DEBUG) {
				this.getGLError('bindFramebuffer');
			}
			this.setViewport(viewport);
		} else {
			renderTarget.bind();
		}
	}

	static savePicture(scene: Scene, camera: Camera, filename: string, width: number | undefined, height: number | undefined, type?: string, quality?: number) {
		const previousWidth = this.#width;
		const previousHeight = this.#height;
		const previousAutoResize = this.autoResize;
		try {
			this.autoResize = false;
			this.setSize(width, height);
			this.render(scene, camera, 0, { DisableToolRendering: true });
			this._savePicture(filename, type, quality);
		} finally {
			this.autoResize = previousAutoResize;
			this.setSize(previousWidth, previousHeight);
		}
	}

	static async exportCanvas(canvas: HTMLCanvasElement, filename: string, width: number | undefined, height: number | undefined, type?: string, quality?: number): Promise<boolean> {
		const canvasDefinition = this.#canvases.get(canvas);
		if (!canvasDefinition) {
			return false;
		}

		try {
			this.#allowTransfertBitmap = false;
			this.#renderMultiCanvas(canvasDefinition, 0, { DisableToolRendering: true, width: width, height: height });
			this._savePicture(filename, type, quality);
			this.#allowTransfertBitmap = true;
		} catch { }

		return true;
	}

	static async savePictureAsFile(filename: string, type?: string, quality?: number) {
		return new File([await this.toBlob(type, quality) ?? new Blob()], filename)
	}

	static async toBlob(type?: string, quality?: number): Promise<Blob | null> {
		let promiseResolve: (value: Blob | null) => void;
		const promise = new Promise<Blob | null>((resolve) => {
			promiseResolve = resolve;
		});
		const callback = function (blob: Blob | null) {
			promiseResolve(blob);
		};
		if (this.#canvas) {
			this.#canvas.toBlob(callback, type, quality);
		} else {
			const blob = await this.#offscreenCanvas?.convertToBlob({ type: type, quality: quality });
			promiseResolve!(blob ?? null);
		}
		return promise;
	}

	static async _savePicture(filename: string, type?: string, quality?: number) {
		/*
		const callback = function (blob) {
			//saveFile(filename, blob);
		};
		this.#canvas.toBlob(callback);*/
		saveFile(await this.savePictureAsFile(filename, type, quality));
	}

	static startRecording(frameRate = 60, bitsPerSecond: number, canvas?: HTMLCanvasElement): void {
		const recordCanvas = canvas ?? this.#canvas;
		if (recordCanvas) {
			const stream = recordCanvas.captureStream(frameRate);
			this.#mediaRecorder = new MediaRecorder(stream, { mimeType: RECORDER_MIME_TYPE, bitsPerSecond: bitsPerSecond });
			this.#mediaRecorder.start();
		}
	}

	static stopRecording(fileName = RECORDER_DEFAULT_FILENAME) {
		if (!this.#mediaRecorder) {
			return;
		}
		this.#mediaRecorder.ondataavailable = (event) => {
			const blob = new Blob([event.data], { 'type': RECORDER_MIME_TYPE });
			saveFile(new File([blob], fileName));
		}
		this.#mediaRecorder.stop();
		//Stop the canvas stream
		this.#mediaRecorder?.stream.getVideoTracks()?.[0]?.stop();
	}

	static get ready() {
		return this.#readyPromise;
	}

	static async isReady() {
		await this.#readyPromise;
	}

	static getParameter(param: GLenum) {
		return this.glContext?.getParameter(param);
	}

	static cleanupGLError() {
		this.glContext?.getError();//empty the error
	}

	static getGLError(context: string) {
		const glError = this.glContext?.getError() ?? 0;
		if (glError) {
			console.error(`GL Error in ${context} : `, glError);
		}
	}

	static useLogDepth(use: boolean) {
		this.setIncludeCode('LOG_DEPTH', use ? '#define USE_LOG_DEPTH' : '');
	}

	static getTime() {
		return this.#time;
	}
	/*
	static getWidth() {
		return this.#width;
	}

	static getHeight() {
		return this.#height;
	}
	*/

	static getCanvas() {
		return this.#canvas;
	}

	static getForwardRenderer() {
		return this.#forwardRenderer;
	}
}

setGraphics(Graphics);

export type GraphicsType = typeof Graphics;
