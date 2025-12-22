import { vec3 } from 'gl-matrix';

import { Float32BufferAttribute, Uint16BufferAttribute } from '../../geometry/bufferattribute'
import { BufferGeometry } from '../../geometry/buffergeometry';
import { TWO_PI } from '../../math/constants';

export class CylinderBufferGeometry extends BufferGeometry {
	#indices!: number[];
	#vertices!: number[];
	#normals!: number[];
	#uvs!: number[];

	updateGeometry(radius: number, height: number, segments: number, hasCap: boolean): void {
		segments = Math.max(Math.floor(segments), 3);
		// buffers

		this.#indices = [];
		this.#vertices = [];
		this.#normals = [];
		this.#uvs = [];

		this.#generateCylinder(radius, height, segments);
		if (hasCap) {
			this.#generateCap(radius, -height / 2, segments);
			this.#generateCap(radius, +height / 2, segments);
		}

		// build geometry
		this.setIndex(new Uint16BufferAttribute(this.#indices, 1, 'index'));
		this.setAttribute('aVertexPosition', new Float32BufferAttribute(this.#vertices, 3, 'position'));
		this.setAttribute('aVertexNormal', new Float32BufferAttribute(this.#normals, 3, 'normal'));
		this.setAttribute('aTextureCoord', new Float32BufferAttribute(this.#uvs, 2, 'texCoord'));
		this.count = this.#indices.length;
	}

	#generateCylinder(radius: number, height: number, segments: number) {
		const normal = vec3.create();
		const vertex = vec3.create();

		const thetaPerSegment = TWO_PI / segments;
		const vPerSegment = 1 / segments;
		const halfHeight = height / 2.0;

		for (let segmentId = 0; segmentId <= segments; ++segmentId) {
			const theta = thetaPerSegment * segmentId;
			const sinTheta = Math.sin(theta);
			const cosTheta = Math.cos(theta);
			vertex[0] = radius * cosTheta;
			vertex[1] = radius * sinTheta;
			const u = segmentId / segments;

			normal[0] = cosTheta;
			normal[1] = sinTheta;
			//No need to normalize the normal

			// Bottom vertex
			vertex[2] = -halfHeight;
			this.#vertices.push(...vertex);
			this.#normals.push(...normal);
			this.#uvs.push(u, 0);

			// Top vertex
			vertex[2] = halfHeight;
			this.#vertices.push(...vertex);
			this.#normals.push(...normal);
			this.#uvs.push(u, 1);

			const indexStart = segmentId * 2;
			this.#indices.push(indexStart, indexStart + 2, indexStart + 1);
			this.#indices.push(indexStart + 1, indexStart + 2, indexStart + 3);
		}
	}

	#generateCap(radius: number, z: number, segments: number) {
		const middlePointIndex = this.#vertices.length / 3;

		const sign = Math.sign(z);
		// Push middle vertex
		this.#vertices.push(0, 0, z);
		this.#normals.push(0, 0, sign);
		this.#uvs.push(0.5, 0.5);

		// Note: we use vertices generated in generateCylinder for the caps.
		// This uses less memory but limits uv / normals usage
		let indexStart = z < 0 ? 0 : 1;
		for (let segmentId = 0; segmentId <= segments; ++segmentId) {
			if (sign < 0) {
				this.#indices.push(indexStart, middlePointIndex, indexStart + 2);
			} else {
				this.#indices.push(middlePointIndex, indexStart, indexStart + 2);
			}
			indexStart += 2;
		}
	}
}
