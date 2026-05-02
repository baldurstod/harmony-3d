let webGLTextures: Set<WebGLTexture>;

export function trackWebGLTextures(): Set<WebGLTexture> {
	if (webGLTextures) {
		return webGLTextures;
	}

	webGLTextures = new Set<GPUBuffer>();

	const webGLOriginals = {
		WebGLRenderingContext_createTexture: WebGLRenderingContext.prototype.createTexture,
		WebGLRenderingContext_deleteTexture: WebGLRenderingContext.prototype.deleteTexture,
		WebGL2RenderingContext_createTexture: WebGL2RenderingContext.prototype.createTexture,
		WebGL2RenderingContext_deleteTexture: WebGL2RenderingContext.prototype.deleteTexture,
	};

	WebGLRenderingContext.prototype.createTexture = function (): WebGLTexture {
		const texture = webGLOriginals.WebGLRenderingContext_createTexture.call(this);
		webGLTextures.add(texture);
		return texture;
	}

	WebGL2RenderingContext.prototype.createTexture = function (): WebGLTexture {
		const texture = webGLOriginals.WebGL2RenderingContext_createTexture.call(this);
		webGLTextures.add(texture);
		return texture;
	}

	WebGLRenderingContext.prototype.deleteTexture = function (texture: WebGLTexture): undefined {
		webGLTextures.delete(this);
		webGLOriginals.WebGLRenderingContext_deleteTexture.call(this, texture);
	}

	WebGL2RenderingContext.prototype.deleteTexture = function (texture: WebGLTexture): undefined {
		webGLTextures.delete(this);
		webGLOriginals.WebGL2RenderingContext_deleteTexture.call(this, texture);
	}

	return webGLTextures;
}
