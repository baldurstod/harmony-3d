import detex from './detex.wasm';


export class Detex {
	static #webAssembly;
	static #HEAPU8;

	static async decodeBC1(width, height, input, output) {
		const wa = await this.getWebAssembly();
		const api = wa.instance.exports;
		const p = api.create_buffer(width * height * 0.5);
		this.#HEAPU8.set(input, p);
		const result = api.decode_BC1(p, width, height);

		const resultPointer = api.get_result_pointer();
		const resultSize = api.get_result_size();
		const resultView = new Uint8ClampedArray(this.#HEAPU8.buffer, resultPointer, resultSize);
		output.set(resultView);


		api.destroy_buffer(p);
		api.destroy_buffer(resultPointer);
	}

	static async decodeBC2(width, height, input, output) {
		const wa = await this.getWebAssembly();
		const api = wa.instance.exports;
		const p = api.create_buffer(width * height * 4);
		this.#HEAPU8.set(input, p);
		const result = api.decode_BC2(p, width, height);

		const resultPointer = api.get_result_pointer();
		const resultSize = api.get_result_size();
		const resultView = new Uint8ClampedArray(this.#HEAPU8.buffer, resultPointer, resultSize);
		output.set(resultView);


		api.destroy_buffer(p);
		api.destroy_buffer(resultPointer);
	}

	static async decodeBC3(width, height, input, output) {
		const wa = await this.getWebAssembly();
		const api = wa.instance.exports;
		const p = api.create_buffer(width * height * 4);
		this.#HEAPU8.set(input, p);
		const result = api.decode_BC3(p, width, height);

		const resultPointer = api.get_result_pointer();
		const resultSize = api.get_result_size();
		const resultView = new Uint8ClampedArray(this.#HEAPU8.buffer, resultPointer, resultSize);
		output.set(resultView);


		api.destroy_buffer(p);
		api.destroy_buffer(resultPointer);
	}

	static async decodeBC4(width, height, input, output) {
		const wa = await this.getWebAssembly();
		const api = wa.instance.exports;
		const p = api.create_buffer(width * height * 0.5);
		this.#HEAPU8.set(input, p);
		const result = api.decode_BC4(p, width, height);

		const resultPointer = api.get_result_pointer();
		const resultSize = api.get_result_size();
		//console.error('decodeBC7', width, height, resultSize);
		const resultView = new Uint8ClampedArray(this.#HEAPU8.buffer, resultPointer, resultSize);
		//const result = new Uint8ClampedArray(resultView);
		output.set(resultView);


		api.destroy_buffer(p);
		api.destroy_buffer(resultPointer);
	}

	static async decodeBC7(width, height, input, output) {
		const wa = await this.getWebAssembly();
		const api = wa.instance.exports;
		const p = api.create_buffer(width * height * 4);
		this.#HEAPU8.set(input, p);
		const result = api.decode_BC7(p, width, height);

		const resultPointer = api.get_result_pointer();
		const resultSize = api.get_result_size();
		//console.error('decodeBC7', width, height, resultSize);
		const resultView = new Uint8ClampedArray(this.#HEAPU8.buffer, resultPointer, resultSize);
		//const result = new Uint8ClampedArray(resultView);
		output.set(resultView);


		api.destroy_buffer(p);
		api.destroy_buffer(resultPointer);
	}

	static async getWebAssembly() {
		if (this.#webAssembly) {
			return this.#webAssembly;
		}

		const env = {
			'abortStackOverflow': _ => { throw new Error('overflow'); },
			'emscripten_notify_memory_growth': _ => {/*console.error('growth ', this.#webAssembly.instance.exports.memory.buffer.byteLength);*/this.#initHeap(); },
			'table': new WebAssembly.Table({ initial: 0, maximum: 0, element: 'anyfunc' }),
			'tableBase': 0,
			'memoryBase': 1024,
			'STACKTOP': 0,
		};
		this.#webAssembly = await (detex as unknown as (any) => any)({ env });//WebAssembly.instantiateStreaming(fetch('detex.wasm'), {env});
		this.#initHeap();
		return this.#webAssembly;
	}

	static #initHeap() {
		this.#HEAPU8 = new Uint8Array(this.#webAssembly.instance.exports.memory.buffer);
	}
}
