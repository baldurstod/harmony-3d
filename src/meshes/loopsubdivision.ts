import { TESTING } from '../buildoptions';
import loopSubdivision from './loop_subdivision.wasm';

export class LoopSubdivision {
	static #instance;
	#webAssembly;
	#heap;
	#heapBuffer;
	constructor() {
		if (LoopSubdivision.#instance) {
			return LoopSubdivision.#instance;
		}
		LoopSubdivision.#instance = this;
	}

	async subdivide(indices, vertices, subdivideCount = 1, tolerance = 0.001) {
		await this.#initWebAssembly();
		const api = this.#webAssembly.instance.exports;

		//const meshPointer = api.create_mesh();
		//console.log(meshPointer);

		const indicesCount = indices.length;
		const verticesCount = vertices.length;

		const indicesPointer = api.create_buffer(indicesCount * 4);
		const verticesPointer = api.create_buffer(verticesCount * 4);

		const indicesView = new Uint32Array(this.#heapBuffer, indicesPointer, indicesCount);
		indicesView.set(indices);
		const verticesView = new Float32Array(this.#heapBuffer, verticesPointer, verticesCount);
		verticesView.set(vertices);
		//console.log(indices.join(', '));
		//console.log(vertices.join(', '));

		const subdivideResult = api.subdivide(indicesPointer, indicesCount, verticesPointer, verticesCount, subdivideCount, tolerance);

		api.delete_buffer(indicesPointer);
		api.delete_buffer(verticesPointer);

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

		api.cleanup();
		if (TESTING) {
			console.log(newIndicesView, newVerticesView);
		}
		return {
			indices: newIndicesView,
			vertices: newVerticesView,
		}
	}

	async #initWebAssembly() {
		if (this.#webAssembly) {
			return this.#webAssembly;
		}

		const env = {
			'abortStackOverflow': _ => { throw new Error('overflow'); },
			'emscripten_notify_memory_growth': _ => {
				if (TESTING) {
					console.error('growth ', this.#webAssembly.instance.exports.memory.buffer.byteLength);
				}
				this.#initHeap();
			},
			'table': new WebAssembly.Table({initial: 0, maximum: 0, element: 'anyfunc'}),
			'tableBase': 0,
			'memoryBase': 1024,
			'STACKTOP': 0,
			console_log: (ptr, size) => {
				const stringContent = new Uint8Array(this.#heapBuffer, ptr, size);
				console.log(new TextDecoder().decode(stringContent));
			},
		};
		//this.#webAssembly = await loopSubdivision({ env });

		const imports = {
			env: env,
			wasi_snapshot_preview1: {
				fd_write: (fd, iovsPtr, iovsLength, bytesWrittenPtr) => {
					const iovs = new Uint32Array(this.#heapBuffer, iovsPtr, iovsLength * 2);
					if(fd === 1 || fd === 2) { //stdout
						let text = '';
						let totalBytesWritten = 0;
						const decoder = new TextDecoder();
						for(let i =0; i < iovsLength * 2; i += 2){
							const offset = iovs[i];
							const length = iovs[i+1];
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
				fd_seek: (p1, p2, p3, p4) => {
					if (TESTING) {
						console.log(p1, p2, p3, p4);
					}
				},
				fd_read: (p1, p2, p3, p4) => {
					if (TESTING) {
						console.log(p1, p2, p3, p4);
					}
				},
				fd_close: (p1, p2, p3, p4) => {
					if (TESTING) {
						console.log(p1, p2, p3, p4);
					}
				},
				proc_exit: (p1) => { console.log('Exit code:', p1) },
			},
		}


		//this.#webAssembly = await WebAssembly.instantiateStreaming(fetch('loop_subdivision.wasm'), imports);
		this.#webAssembly = await (loopSubdivision as unknown as (any) => any)(imports);
		this.#initHeap();

		if (TESTING) {
			console.log(this.#webAssembly);
		}
		return this.#webAssembly;
	}

	#initHeap() {
		//this.HEAPU8 = new Uint8Array(this.webAssembly.instance.exports.memory.buffer);
		this.#heap = new Uint8Array(this.#webAssembly.instance.exports.memory.buffer);
		this.#heapBuffer = this.#heap.buffer;
	}
}
