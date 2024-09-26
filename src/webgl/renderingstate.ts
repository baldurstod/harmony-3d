import { vec4 } from 'gl-matrix';

import { GL_BACK, GL_CCW, GL_FUNC_ADD, GL_LESS, GL_MAX_VERTEX_ATTRIBS, GL_ONE, GL_POLYGON_OFFSET_FILL, GL_ZERO } from './constants';
import { GL_COLOR_BUFFER_BIT, GL_DEPTH_BUFFER_BIT, GL_STENCIL_BUFFER_BIT } from './constants';
import { Graphics } from '../graphics/graphics';
import { WebGLAnyRenderingContext } from '../types';

export class WebGLRenderingState {
	static #viewport = vec4.create();
	static #scissor = vec4.create();
	static #enabledCapabilities: boolean[] = [];
	// clear values
	static #clearColor = vec4.create();
	static #clearDepth = 1.0;
	static #clearStencil = 0;
	// Masking
	static #colorMask = vec4.create();
	static #depthMask = true;
	static #stencilMask: GLuint;
	// Depth
	static #depthFunc: GLenum = GL_LESS;

	// Blend
	static #sourceFactor: GLenum = GL_ONE;
	static #destinationFactor: GLenum = GL_ZERO;
	static #srcRGB: GLenum = GL_ONE;
	static #dstRGB: GLenum = GL_ZERO;
	static #srcAlpha: GLenum = GL_ONE;
	static #dstAlpha: GLenum = GL_ZERO;
	static #modeRGB: GLenum = GL_FUNC_ADD;
	static #modeAlpha: GLenum = GL_FUNC_ADD;

	// Cull
	static #cullFace: GLenum = GL_BACK;
	static #frontFace: GLenum = GL_CCW;

	//polygonOffset
	static #polygonOffsetFactor = 0;
	static #polygonOffsetUnits = 0;

	static #lineWidth: GLfloat = 1;

	static #program: WebGLProgram;
	static #graphics: typeof Graphics;
	static #glContext: WebGLAnyRenderingContext;

	static #enabledVertexAttribArray: Uint8Array;
	static #usedVertexAttribArray: Uint8Array;
	static #vertexAttribDivisor: Uint8Array;

	static setGraphics(graphics: typeof Graphics) {
		this.#graphics = graphics;
		this.#glContext = graphics.glContext;

		const maxVertexAttribs = this.#glContext.getParameter(GL_MAX_VERTEX_ATTRIBS);
		this.#enabledVertexAttribArray = new Uint8Array(maxVertexAttribs);
		this.#usedVertexAttribArray = new Uint8Array(maxVertexAttribs);
		this.#vertexAttribDivisor = new Uint8Array(maxVertexAttribs);
	}

	static clearColor(clearColor: vec4) {
		if (!vec4.exactEquals(clearColor, this.#clearColor)) {
			this.#glContext.clearColor(clearColor[0], clearColor[1], clearColor[2], clearColor[3]);
			vec4.copy(this.#clearColor, clearColor);
		}
	}

	static getClearColor(out = vec4.create()) {
		return vec4.copy(out, this.#clearColor);
	}

	static clearDepth(clearDepth: GLclampf) {
		if (clearDepth !== this.#clearDepth) {
			this.#glContext.clearDepth(clearDepth);
			this.#clearDepth = clearDepth;
		}
	}

	static clearStencil(clearStencil: GLint) {
		if (clearStencil !== this.#clearStencil) {
			this.#glContext.clearStencil(clearStencil);
			this.#clearStencil = clearStencil;
		}
	}

	static clear(color: boolean, depth: boolean, stencil: boolean) {
		let bits = 0;
		if (color) bits |= GL_COLOR_BUFFER_BIT;
		if (depth) bits |= GL_DEPTH_BUFFER_BIT;
		if (stencil) bits |= GL_STENCIL_BUFFER_BIT;
		this.#glContext.clear(bits);
	}

	static colorMask(colorMask: vec4) {
		if (!vec4.exactEquals(colorMask, this.#colorMask)) {
			this.#glContext.colorMask(Boolean(colorMask[0]), Boolean(colorMask[1]), Boolean(colorMask[2]), Boolean(colorMask[3]));
			vec4.copy(this.#colorMask, colorMask);
		}
	}

	static depthMask(flag: boolean) {
		if (flag !== this.#depthMask) {
			this.#glContext.depthMask(flag);
			this.#depthMask = flag;
		}
	}

	static stencilMask(stencilMask: GLuint) {
		if (stencilMask !== this.#stencilMask) {
			this.#glContext.stencilMask(stencilMask);
			this.#stencilMask = stencilMask;
		}
	}

	static lineWidth(width: GLfloat) {
		if (width !== this.#lineWidth) {
			this.#glContext.lineWidth(width);
			this.#lineWidth = width;
		}
	}

	static viewport(viewport: vec4) {
		if (!vec4.exactEquals(viewport, this.#viewport)) {
			this.#glContext.viewport(viewport[0], viewport[1], viewport[2], viewport[3]);
			vec4.copy(this.#viewport, viewport);
		}
	}

	static scissor(scissor: vec4) {
		if (!vec4.exactEquals(scissor, this.#scissor)) {
			this.#glContext.scissor(scissor[0], scissor[1], scissor[2], scissor[3]);
			vec4.copy(this.#scissor, scissor);
		}
	}

	static enable(cap: GLenum) {
		if (this.#enabledCapabilities[cap] !== true) {
			this.#glContext.enable(cap);
			this.#enabledCapabilities[cap] = true;
		}
	}

	static disable(cap: GLenum) {
		if (this.#enabledCapabilities[cap] !== false) {
			this.#glContext.disable(cap);
			this.#enabledCapabilities[cap] = false;
		}
	}

	static isEnabled(cap: GLenum) {
		return this.#enabledCapabilities[cap] ?? this.#glContext.isEnabled(cap);
	}

	static useProgram(program: WebGLProgram) {
		if (this.#program !== program) {
			this.#glContext.useProgram(program);
			this.#program = program;
		}
	}

	static enableVertexAttribArray(index: GLuint, divisor = 0) {
		if (this.#enabledVertexAttribArray[index] === 0) {
			this.#glContext.enableVertexAttribArray(index);
			this.#enabledVertexAttribArray[index] = 1;
		}
		this.#usedVertexAttribArray[index] = 1;

		if (this.#vertexAttribDivisor[index] !== divisor) {
			this.#vertexAttribDivisor[index] = divisor;
			if (this.#graphics.isWebGL2) {
				(this.#glContext as WebGL2RenderingContext).vertexAttribDivisor(index, divisor);
			} else {
				this.#graphics.ANGLE_instanced_arrays?.vertexAttribDivisorANGLE(index, divisor);
			}
		}
	}

	static initUsedAttributes() {
		let usedAttributes = this.#usedVertexAttribArray;
		for (let i = 0, l = usedAttributes.length; i < l; i++) {
			usedAttributes[i] = 0;
		}
	}

	static disableUnusedAttributes() {
		let usedAttributes = this.#usedVertexAttribArray;
		let enabledAttributes = this.#enabledVertexAttribArray;
		for (let i = 0, l = usedAttributes.length; i < l; i++) {
			if (usedAttributes[i] !== enabledAttributes[i]) {
				this.#glContext.disableVertexAttribArray(i);
				enabledAttributes[i] = 0;
			}
		}
	}

	static depthFunc(func: GLenum) {
		if (this.#depthFunc !== func) {
			this.#glContext.depthFunc(func);
			this.#depthFunc = func;
		}
	}

	static blendFunc(sourceFactor: GLenum, destinationFactor: GLenum) {
		if ((this.#sourceFactor !== sourceFactor) || (this.#destinationFactor !== destinationFactor)) {
			this.#glContext.blendFunc(sourceFactor, destinationFactor);
			this.#sourceFactor = sourceFactor;
			this.#destinationFactor = destinationFactor;
		}
	}

	static blendFuncSeparate(srcRGB: GLenum, dstRGB: GLenum, srcAlpha: GLenum, dstAlpha: GLenum) {
		if ((this.#srcRGB !== srcRGB) || (this.#dstRGB !== dstRGB) || (this.#srcAlpha !== srcAlpha) || (this.#dstAlpha !== dstAlpha)) {
			this.#glContext.blendFuncSeparate(srcRGB, dstRGB, srcAlpha, dstAlpha);
			this.#srcRGB = srcRGB;
			this.#dstRGB = dstRGB;
			this.#srcAlpha = srcAlpha;
			this.#dstAlpha = dstAlpha;
		}
	}

	static blendEquationSeparate(modeRGB: GLenum, modeAlpha: GLenum) {
		if ((this.#modeRGB !== modeRGB) || (this.#modeAlpha !== modeAlpha)) {
			this.#glContext.blendEquationSeparate(modeRGB, modeAlpha);
			this.#modeRGB = modeRGB;
			this.#modeAlpha = modeAlpha;
		}
	}

	static cullFace(mode: GLenum) {
		if (this.#cullFace !== mode) {
			this.#glContext.cullFace(mode);
			this.#cullFace = mode;
		}
	}

	static frontFace(mode: GLenum) {
		if (this.#frontFace !== mode) {
			this.#glContext.frontFace(mode);
			this.#frontFace = mode;
		}
	}

	static polygonOffset(enable: boolean, factor: GLfloat, units: GLfloat) {
		if (enable) {
			this.enable(GL_POLYGON_OFFSET_FILL);
			if (this.#polygonOffsetFactor !== factor && this.#polygonOffsetUnits !== units) {
				this.#glContext.polygonOffset(factor, units);
				this.#polygonOffsetFactor = factor;
				this.#polygonOffsetUnits = units;
			}
		} else {
			this.disable(GL_POLYGON_OFFSET_FILL);
		}
	}
}
