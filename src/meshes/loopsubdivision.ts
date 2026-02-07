import { TESTING } from '../buildoptions';
import loopSubdivision from './loop_subdivision.wasm';

export class LoopSubdivision {// TODO: turn into a static class
	static #instance: LoopSubdivision;
	#webAssembly?: WebAssembly.WebAssemblyInstantiatedSource;
	#heap!: Uint8Array;
	#heapBuffer!: ArrayBuffer;

	constructor() {
		if (LoopSubdivision.#instance) {
			return LoopSubdivision.#instance;
		}
		LoopSubdivision.#instance = this;
	}

	async subdivide(indices: Uint8Array | Uint32Array, vertices: Float32Array, subdivideCount = 1, tolerance = 0.001): Promise<{
		indices: Uint32Array,
		vertices: Float32Array,
	}> {
		const webAssembly = await this.#getWebAssembly();
		const api = webAssembly.instance.exports;

		//const meshPointer = api.create_mesh();
		//console.log(meshPointer);

		const indicesCount = indices.length;
		const verticesCount = vertices.length;

		const indicesPointer = (api.create_buffer as (arg0: number) => number)(indicesCount * 4);
		const verticesPointer = (api.create_buffer as (arg0: number) => number)(verticesCount * 4);

		const indicesView = new Uint32Array(this.#heapBuffer, indicesPointer, indicesCount);
		indicesView.set(indices);
		const verticesView = new Float32Array(this.#heapBuffer, verticesPointer, verticesCount);
		verticesView.set(vertices);
		//console.log(indices.join(', '));
		//console.log(vertices.join(', '));

		const subdivideResult = (api.subdivide as (arg0: number, arg1: number, arg2: number, arg3: number, arg4: number, arg5: number,) => number)(indicesPointer, indicesCount, verticesPointer, verticesCount, subdivideCount, tolerance);

		(api.delete_buffer as (arg0: number) => void)(indicesPointer);
		(api.delete_buffer as (arg0: number) => void)(verticesPointer);

		// subdivideResult points to an array of [pointer to indices array, indices length, pointer to vertices array, vertices length];
		if (TESTING) {
			console.log(subdivideResult);
		}

		const resultView = new Uint32Array(this.#heapBuffer, subdivideResult, 4);
		//indicesView.set(indices);
		//const verticesView = new Float32Array(this.#heapBuffer, verticesPointer, verticesCount);*/
		if (TESTING) {
			console.log(resultView);
		}



		const newIndicesView = new Uint32Array(new Uint32Array(this.#heapBuffer, resultView[0], resultView[1]));
		const newVerticesView = new Float32Array(new Float32Array(this.#heapBuffer, resultView[2], resultView[3]));

		(api.cleanup as () => void)();
		if (TESTING) {
			console.log(newIndicesView, newVerticesView);
		}
		return {
			indices: newIndicesView,
			vertices: newVerticesView,
		}
	}

	async #getWebAssembly(): Promise<WebAssembly.WebAssemblyInstantiatedSource> {
		if (this.#webAssembly) {
			return this.#webAssembly;
		}

		const env = {
			'abortStackOverflow': (): void => { throw new Error('overflow'); },
			'emscripten_notify_memory_growth': (): void => {
				if (TESTING) {
					console.error('growth ', (this.#webAssembly!.instance.exports.memory as WebAssembly.Memory).buffer.byteLength);
				}
				this.#initHeap();
			},
			'table': new WebAssembly.Table({ initial: 0, maximum: 0, element: 'anyfunc' }),
			'tableBase': 0,
			'memoryBase': 1024,
			'STACKTOP': 0,
			console_log: (ptr: number, size: number): void => {
				const stringContent = new Uint8Array(this.#heapBuffer, ptr, size);
				console.log(new TextDecoder().decode(stringContent));
			},
		};
		//this.#webAssembly = await loopSubdivision({ env });

		const imports = {
			env: env,
			wasi_snapshot_preview1: {
				fd_write: (fd: number, iovsPtr: number, iovsLength: number, bytesWrittenPtr: number): number => {
					const iovs = new Uint32Array(this.#heapBuffer, iovsPtr, iovsLength * 2);
					if (fd === 1 || fd === 2) { //stdout
						let text = '';
						let totalBytesWritten = 0;
						const decoder = new TextDecoder();
						for (let i = 0; i < iovsLength * 2; i += 2) {
							const offset = iovs[i]!;
							const length = iovs[i + 1]!;
							const textChunk = decoder.decode(new Int8Array(this.#heapBuffer, offset, length));
							text += textChunk;
							totalBytesWritten += length;
						}
						const dataView = new DataView(this.#heapBuffer);
						dataView.setInt32(bytesWrittenPtr, totalBytesWritten, true);
						console.log(text);
					}
					return 0;
				},
				fd_seek: (p1: never, p2: never, p3: never, p4: never): void => {
					if (TESTING) {
						console.log(p1, p2, p3, p4);
					}
				},
				fd_read: (p1: never, p2: never, p3: never, p4: never): void => {
					if (TESTING) {
						console.log(p1, p2, p3, p4);
					}
				},
				fd_close: (p1: never, p2: never, p3: never, p4: never): void => {
					if (TESTING) {
						console.log(p1, p2, p3, p4);
					}
				},
				proc_exit: (p1: number): void => { console.log('Exit code:', p1) },
				args_sizes_get: (): number => { return 0; },
				args_get: (p1: number): void => { },
			},
		}


		//this.#webAssembly = await WebAssembly.instantiateStreaming(fetch('loop_subdivision.wasm'), imports);
		this.#webAssembly = await (loopSubdivision as unknown as (_: any) => any)(imports);
		this.#initHeap();

		if (TESTING) {
			console.log(this.#webAssembly);
		}
		return this.#webAssembly!;
	}

	#initHeap(): void {
		//this.HEAPU8 = new Uint8Array(this.webAssembly.instance.exports.memory.buffer);
		this.#heap = new Uint8Array((this.#webAssembly!.instance.exports.memory as WebAssembly.Memory).buffer);
		this.#heapBuffer = this.#heap.buffer as ArrayBuffer;
	}
}
