import zstd from './zstd.wasm';

export const Zstd = new (function () {
	class Zstd {
		#webAssembly = null;
		#HEAPU8: Uint8Array;

		async decompress(compressedDatas) {
			const wa = await this.getWebAssembly();
			const api = wa.instance.exports;

			let srcSize = compressedDatas.length;

			const src = api.create_buffer(srcSize);

			this.#HEAPU8.set(compressedDatas, src);

			let result = api.decompress(src, srcSize);

			api.destroy_buffer(src);
			if (result >= 0) {
				const resultPointer = api.get_result_pointer();
				let temp = new Uint8Array(new Uint8Array(this.#HEAPU8.buffer, resultPointer, api.get_result_size()));
				api.destroy_buffer(resultPointer);
				return temp;
			}

			return null;
		}

		async decompress_ZSTD(compressedDatas, uncompressedDatas) {
			const wa = await this.getWebAssembly();
			const api = wa.instance.exports;

			let srcSize = compressedDatas.length;
			let dstSize = uncompressedDatas.length;

			const src = api.create_buffer(srcSize);
			const dst = api.create_buffer(dstSize);

			this.#HEAPU8.set(compressedDatas, src);

			let result = api.decompress_ZSTD(dst, dstSize, src, srcSize);
			console.error(result);

			const resultView = new Uint8ClampedArray(this.#HEAPU8.buffer, dst, dstSize);
			uncompressedDatas.set(resultView);

			api.destroy_buffer(src);
			api.destroy_buffer(dst);
			return result;
		}

		async getWebAssembly() {
			if (this.#webAssembly) {
				return this.#webAssembly;
			}

			const env = {
				'abortStackOverflow': _ => { throw new Error('overflow'); },
				'emscripten_notify_memory_growth': _ => { this.#initHeap(); },
				'table': new WebAssembly.Table({ initial: 0, maximum: 0, element: 'anyfunc' }),
				'tableBase': 0,
				'memoryBase': 1024,
				'STACKTOP': 0,
			};
			this.#webAssembly = await (zstd as unknown as (any) => any)({ env });//await WebAssembly.instantiateStreaming(fetch('zstd.wasm'), {env});
			this.#initHeap();
			return this.#webAssembly;
		}

		#initHeap() {
			this.#HEAPU8 = new Uint8Array(this.#webAssembly.instance.exports.memory.buffer);
		}
	}
	return Zstd;
}());
