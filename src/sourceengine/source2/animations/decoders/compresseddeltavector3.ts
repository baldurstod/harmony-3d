import { vec3 } from 'gl-matrix';

const BASE_BYTES_PER_BONE = 4 * 3
const DELTA_BYTES_PER_BONE = 2 * 3;

let baseX, baseY, baseZ, deltaX, deltaY, deltaZ;

export function decodeCCompressedDeltaVector3(reader, elementCount, elementIndex, frame) {
	baseX = reader.getFloat32(8+elementCount*2+elementIndex*BASE_BYTES_PER_BONE);
	baseY = reader.getFloat32();
	baseZ = reader.getFloat32();

	deltaX = reader.getFloat16(8+elementCount*(2+BASE_BYTES_PER_BONE)+elementCount*frame*DELTA_BYTES_PER_BONE+elementIndex*DELTA_BYTES_PER_BONE);
	deltaY = reader.getFloat16();
	deltaZ = reader.getFloat16()

	return vec3.fromValues(baseX + deltaX, baseY + deltaY, baseZ + deltaZ);
}
