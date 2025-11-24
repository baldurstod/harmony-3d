import zstd from './zstd.wasm';

export class Zstd {
	static #webAssembly?: WebAssembly.WebAssemblyInstantiatedSource;
	static #HEAPU8?: Uint8Array;

	static async decompress(compressedDatas: Uint8Array): Promise<Uint8Array | null> {
		const wa = await this.#getWebAssembly();
		if (!wa) {
			return null;
		}
		if (!this.#HEAPU8) {
			return null;
		}
		const api = wa.instance.exports;

		const srcSize = compressedDatas.length;

		const src = (api.create_buffer as (arg0: number) => number)(srcSize);

		this.#HEAPU8.set(compressedDatas, src);

		const result = (api.decompress as (arg0: number, arg1: number) => number)(src, srcSize);

		(api.destroy_buffer as (arg0: number) => void)(src);
		if (result >= 0) {
			const resultPointer = (api.get_result_pointer as () => number)();
			const temp = new Uint8Array(new Uint8Array(this.#HEAPU8.buffer, resultPointer, (api.get_result_size as () => number)()));
			(api.destroy_buffer as (arg0: number) => void)(resultPointer);
			return temp;
		}

		return null;
	}

	static async #getWebAssembly(): Promise<WebAssembly.WebAssemblyInstantiatedSource> {
		if (this.#webAssembly) {
			return this.#webAssembly;
		}

		const env = {
			'abortStackOverflow': (): void => { throw new Error('overflow'); },
			'emscripten_notify_memory_growth': (): void => { this.#initHeap(); },
			'table': new WebAssembly.Table({ initial: 0, maximum: 0, element: 'anyfunc' }),
			'tableBase': 0,
			'memoryBase': 1024,
			'STACKTOP': 0,
		};
		this.#webAssembly = await (zstd as unknown as (_: any) => any)({ env });//await WebAssembly.instantiateStreaming(fetch('zstd.wasm'), {env});
		this.#initHeap();
		return this.#webAssembly!;
	}

	static #initHeap(): void {
		this.#HEAPU8 = new Uint8Array((this.#webAssembly!.instance.exports.memory as WebAssembly.Memory).buffer);
	}
}
