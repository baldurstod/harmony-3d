import { BufferGeometry, BufferGeometryParameters } from './buffergeometry';

export type InstancedBufferGeometryParameters = BufferGeometryParameters & {
	instanceCount?: number,
};

export class InstancedBufferGeometry extends BufferGeometry {
	instanceCount: number;

	constructor(params: InstancedBufferGeometryParameters = {}) {
		super(params);
		this.instanceCount = params.instanceCount ?? 1;
	}
}
