import { BufferGeometry } from './buffergeometry';

export class InstancedBufferGeometry extends BufferGeometry {
	instanceCount: number;
	constructor(count = 0) {
		super();
		this.instanceCount = count;
		return this;
	}
}
