import { quat, vec3, vec4 } from 'gl-matrix';

import { Float32BufferAttribute, Uint16BufferAttribute } from '../../geometry/bufferattribute.js'
import { BufferGeometry } from '../../geometry/buffergeometry.js';

const DEFAULT_SEGMENT_COLOR = vec4.fromValues(1.0, 1.0, 1.0, 1.0);

const tempVec3 = vec3.create();
const tempQuat = quat.create();
const tempQuat2 = quat.create();
const UNIT_VEC3_X = vec3.fromValues(1, 0, 0);
const UNIT_VEC3_MINUS_Y = vec3.fromValues(0, -1, 0);

export class BeamSegment {
	pos = vec3.create();
	normal = vec3.create();
	color = vec4.create();
	texCoordY: number;
	width: number;
	constructor(pos, color = DEFAULT_SEGMENT_COLOR, texCoordY = 0.0, width = 1.0) {
		vec3.copy(this.pos, pos);
		vec3.copy(this.normal, UNIT_VEC3_MINUS_Y);
		vec4.copy(this.color, color);
		this.texCoordY = texCoordY;
		this.width = width;
	}

	distanceTo(other) {
		return vec3.distance(this.pos, other.pos);
	}
}

export class BeamBufferGeometry extends BufferGeometry {
	constructor(segments?) {
		super();

		if (segments) {
			this.segments = segments;
		}
	}

	set segments(segments) {
		let previousSegment = null;

		let indiceBase = 0;
		let indices = [];
		let vertices = [];
		let normals = [];
		let uvs = [];
		let colors = [];
		let widths = [];

		for (let segment of segments) {
			if (previousSegment) {
				indices.push(indiceBase, indiceBase + 2, indiceBase + 1, indiceBase + 2, indiceBase + 3, indiceBase + 1);

				vec3.sub(tempVec3, segment.pos, previousSegment.pos);
				vec3.normalize(tempVec3, tempVec3);
				quat.rotationTo(tempQuat, UNIT_VEC3_X, tempVec3);
				quat.rotationTo(tempQuat2, UNIT_VEC3_MINUS_Y, previousSegment.normal);

				vec3.set(tempVec3, 0, 0, -previousSegment.width / 2.0);
				vec3.transformQuat(tempVec3, tempVec3, tempQuat);
				vec3.transformQuat(tempVec3, tempVec3, tempQuat2);
				vec3.add(tempVec3, tempVec3, previousSegment.pos);
				vertices.push(...tempVec3);

				vec3.set(tempVec3, 0, 0, previousSegment.width / 2.0);
				vec3.transformQuat(tempVec3, tempVec3, tempQuat);
				vec3.transformQuat(tempVec3, tempVec3, tempQuat2);
				vec3.add(tempVec3, tempVec3, previousSegment.pos);
				vertices.push(...tempVec3);


				quat.rotationTo(tempQuat2, UNIT_VEC3_MINUS_Y, segment.normal);

				vec3.set(tempVec3, 0, 0, -segment.width / 2.0);
				vec3.transformQuat(tempVec3, tempVec3, tempQuat);
				vec3.transformQuat(tempVec3, tempVec3, tempQuat2);
				vec3.add(tempVec3, tempVec3, segment.pos);
				vertices.push(...tempVec3);

				vec3.set(tempVec3, 0, 0, segment.width / 2.0);
				vec3.transformQuat(tempVec3, tempVec3, tempQuat);
				vec3.transformQuat(tempVec3, tempVec3, tempQuat2);
				vec3.add(tempVec3, tempVec3, segment.pos);
				vertices.push(...tempVec3);

				uvs.push(0, previousSegment.texCoordY,
					1, previousSegment.texCoordY,
					0, segment.texCoordY,
					1, segment.texCoordY);

				colors.push(...previousSegment.color, ...previousSegment.color, ...segment.color, ...segment.color);
				indiceBase += 4;
			}
			previousSegment = segment;
		}


		this.setIndex(new Uint16BufferAttribute(indices, 1));
		this.setAttribute('aVertexPosition', new Float32BufferAttribute(vertices, 3));
		this.setAttribute('aTextureCoord', new Float32BufferAttribute(uvs, 2));
		this.setAttribute('aVertexColor', new Float32BufferAttribute(colors, 4));
		//this.setAttribute('aVertexWidth', new Float32BufferAttribute(this.widths, 1));
		this.count = indices.length;
	}
}
