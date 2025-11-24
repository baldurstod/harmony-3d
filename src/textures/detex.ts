import detex from './detex.wasm';
import { ImageFormat } from './enums';

export class Detex {
	static #webAssembly?: WebAssembly.WebAssemblyInstantiatedSource;
	static #HEAPU8: Uint8Array;

	static async decode(format: ImageFormat, width: number, height: number, input: Uint8Array, output: Uint8Array): Promise<void> {
		// TODO: return a bool
		switch (format) {
			case ImageFormat.Bc1:
				return this.decodeBC1(width, height, input, output);
			case ImageFormat.Bc2:
				return this.decodeBC2(width, height, input, output);
			case ImageFormat.Bc3:
				return this.decodeBC3(width, height, input, output);
			case ImageFormat.Bc4:
				return this.decodeBC4(width, height, input, output);
			case ImageFormat.Bc7:
				return this.decodeBC7(width, height, input, output);
			default:
				console.error('bad texture format in Detex.decode: ' + format);
		}
	}

	static async decodeBC1(width: number, height: number, input: Uint8Array, output: Uint8Array): Promise<void> {
		const wa = await this.#getWebAssembly();
		const api = wa.instance.exports;
		const p = (api.create_buffer as (arg0: number) => number)(width * height * 0.5);
		this.#HEAPU8.set(input, p);
		(api.decode_BC1 as (arg0: number, arg1: number, arg2: number) => number)(p, width, height);

		const resultPointer = (api.get_result_pointer as () => number)();
		const resultSize = (api.get_result_size as () => number)();
		const resultView = new Uint8ClampedArray(this.#HEAPU8.buffer, resultPointer, resultSize);
		output.set(resultView);


		(api.destroy_buffer as (arg0: number) => void)(p);
		(api.destroy_buffer as (arg0: number) => void)(resultPointer);
	}

	static async decodeBC2(width: number, height: number, input: Uint8Array, output: Uint8Array): Promise<void> {
		const wa = await this.#getWebAssembly();
		const api = wa.instance.exports;
		const p = (api.create_buffer as (arg0: number) => number)(width * height * 4);
		this.#HEAPU8.set(input, p);
		(api.decode_BC2 as (arg0: number, arg1: number, arg2: number) => number)(p, width, height);

		const resultPointer = (api.get_result_pointer as () => number)();
		const resultSize = (api.get_result_size as () => number)();
		const resultView = new Uint8ClampedArray(this.#HEAPU8.buffer, resultPointer, resultSize);
		output.set(resultView);


		(api.destroy_buffer as (arg0: number) => void)(p);
		(api.destroy_buffer as (arg0: number) => void)(resultPointer);
	}

	static async decodeBC3(width: number, height: number, input: Uint8Array, output: Uint8Array): Promise<void> {
		const wa = await this.#getWebAssembly();
		const api = wa.instance.exports;
		const p = (api.create_buffer as (arg0: number) => number)(width * height * 4);
		this.#HEAPU8.set(input, p);
		(api.decode_BC3 as (arg0: number, arg1: number, arg2: number) => number)(p, width, height);

		const resultPointer = (api.get_result_pointer as () => number)();
		const resultSize = (api.get_result_size as () => number)();
		const resultView = new Uint8ClampedArray(this.#HEAPU8.buffer, resultPointer, resultSize);
		output.set(resultView);


		(api.destroy_buffer as (arg0: number) => void)(p);
		(api.destroy_buffer as (arg0: number) => void)(resultPointer);
	}

	static async decodeBC4(width: number, height: number, input: Uint8Array, output: Uint8Array): Promise<void> {
		const wa = await this.#getWebAssembly();
		const api = wa.instance.exports;
		const p = (api.create_buffer as (arg0: number) => number)(width * height * 0.5);
		this.#HEAPU8.set(input, p);
		(api.decode_BC4 as (arg0: number, arg1: number, arg2: number) => number)(p, width, height);

		const resultPointer = (api.get_result_pointer as () => number)();
		const resultSize = (api.get_result_size as () => number)();
		//console.error('decodeBC7', width, height, resultSize);
		const resultView = new Uint8ClampedArray(this.#HEAPU8.buffer, resultPointer, resultSize);
		//const result = new Uint8ClampedArray(resultView);
		output.set(resultView);


		(api.destroy_buffer as (arg0: number) => void)(p);
		(api.destroy_buffer as (arg0: number) => void)(resultPointer);
	}

	static async decodeBC7(width: number, height: number, input: Uint8Array, output: Uint8Array): Promise<void> {
		const wa = await this.#getWebAssembly();
		const api = wa.instance.exports;
		const p = (api.create_buffer as (arg0: number) => number)(width * height * 4);
		this.#HEAPU8.set(input, p);
		(api.decode_BC7 as (arg0: number, arg1: number, arg2: number) => number)(p, width, height);

		const resultPointer = (api.get_result_pointer as () => number)();
		const resultSize = (api.get_result_size as () => number)();
		//console.error('decodeBC7', width, height, resultSize);
		const resultView = new Uint8ClampedArray(this.#HEAPU8.buffer, resultPointer, resultSize);
		//const result = new Uint8ClampedArray(resultView);
		output.set(resultView);


		(api.destroy_buffer as (arg0: number) => void)(p);
		(api.destroy_buffer as (arg0: number) => void)(resultPointer);
	}

	static async #getWebAssembly(): Promise<WebAssembly.WebAssemblyInstantiatedSource> {
		if (this.#webAssembly) {
			return this.#webAssembly;
		}

		const env = {
			'abortStackOverflow': (): void => { throw new Error('overflow'); },
			'emscripten_notify_memory_growth': (): void => {/*console.error('growth ', this.#webAssembly.instance.exports.memory.buffer.byteLength);*/this.#initHeap(); },
			'table': new WebAssembly.Table({ initial: 0, maximum: 0, element: 'anyfunc' }),
			'tableBase': 0,
			'memoryBase': 1024,
			'STACKTOP': 0,
		};
		this.#webAssembly = await (detex as unknown as (_: any) => any)({ env });//WebAssembly.instantiateStreaming(fetch('detex.wasm'), {env});
		this.#initHeap();
		return this.#webAssembly!;
	}

	static #initHeap(): void {
		this.#HEAPU8 = new Uint8Array((this.#webAssembly!.instance.exports.memory as WebAssembly.Memory).buffer);
	}
}
