// TODO: remove when WebGPU is a baseline feature
export function initWebGPUConst(): void {
	if (!window.GPUTextureUsage) {
		window.GPUTextureUsage = {
			'COPY_SRC': 1,
			'COPY_DST': 2,
			'TEXTURE_BINDING': 4,
			'STORAGE_BINDING': 8,
			'RENDER_ATTACHMENT': 16
		}
	}
}
initWebGPUConst();
