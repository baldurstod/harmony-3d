// TODO: remove when WebGPU is a baseline feature
export function initWebGPUConst(): void {
	if (!window.GPUTextureUsage) {
		window.GPUTextureUsage = {} as GPUTextureUsage;
	}

	if (!window.GPUShaderStage) {
		window.GPUShaderStage = {} as GPUShaderStage;
	}
}
initWebGPUConst();
