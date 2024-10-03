import { BufferGeometry } from './buffergeometry.js';

export class InstancedBufferGeometry extends BufferGeometry {
	instanceCount: number;
	constructor(count = 0) {
		super();
		this.instanceCount = count;
		return this;
	}
}
