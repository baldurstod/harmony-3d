import { vec3 } from 'gl-matrix';

import { Float32BufferAttribute, Uint16BufferAttribute } from '../../geometry/bufferattribute'
import { BufferGeometry } from '../../geometry/buffergeometry';

export class BoxBufferGeometry extends BufferGeometry {
	#indices: number[];
	#vertices: number[];
	#normals: number[];
	#uvs: number[];
	#numberOfVertices: number;

	updateGeometry(width?: number, height?: number, depth?: number, widthSegments?: number, heightSegments?: number, depthSegments?: number) {
		widthSegments = Math.floor(widthSegments);
		heightSegments = Math.floor(heightSegments);
		depthSegments = Math.floor(depthSegments);

		// buffers
		this.#indices = [];
		this.#vertices = [];
		this.#normals = [];
		this.#uvs = [];

		// helper variables
		this.#numberOfVertices = 0;

		// build each side of the box geometry
		this.#buildPlane(2, 1, 0, - 1, - 1, depth, height, width, depthSegments, heightSegments); // px
		this.#buildPlane(2, 1, 0, 1, - 1, depth, height, - width, depthSegments, heightSegments); // nx
		this.#buildPlane(0, 2, 1, 1, 1, width, depth, height, widthSegments, depthSegments); // py
		this.#buildPlane(0, 2, 1, 1, - 1, width, depth, - height, widthSegments, depthSegments); // ny
		this.#buildPlane(0, 1, 2, 1, - 1, width, height, depth, widthSegments, heightSegments); // pz
		this.#buildPlane(0, 1, 2, - 1, - 1, width, height, - depth, widthSegments, heightSegments); // nz

		// build geometry
		this.setIndex(new Uint16BufferAttribute(this.#indices, 1));
		this.setAttribute('aVertexPosition', new Float32BufferAttribute(this.#vertices, 3));
		this.setAttribute('aVertexNormal', new Float32BufferAttribute(this.#normals, 3));
		this.setAttribute('aTextureCoord', new Float32BufferAttribute(this.#uvs, 2));
		this.count = this.#indices.length;
	}

	#buildPlane(u, v, w, udir, vdir, width, height, depth, gridX, gridY) {
		const segmentWidth = width / gridX;
		const segmentHeight = height / gridY;

		const widthHalf = width / 2;
		const heightHalf = height / 2;
		const depthHalf = depth / 2;

		const gridX1 = gridX + 1;
		const gridY1 = gridY + 1;

		let vertexCounter = 0;

		let ix, iy;

		const vector = vec3.create();

		// generate vertices, normals and uvs

		for (iy = 0; iy < gridY1; iy++) {
			const y = iy * segmentHeight - heightHalf;

			for (ix = 0; ix < gridX1; ix++) {

				const x = ix * segmentWidth - widthHalf;

				// set values to correct vector component

				vector[u] = x * udir;
				vector[v] = y * vdir;
				vector[w] = depthHalf;

				// now apply vector to vertex buffer

				this.#vertices.push(...vector);

				// set values to correct vector component

				vector[u] = 0;
				vector[v] = 0;
				vector[w] = depth > 0 ? 1 : - 1;

				// now apply vector to normal buffer

				this.#normals.push(...vector);

				// uvs

				this.#uvs.push(ix / gridX);
				this.#uvs.push(1 - (iy / gridY));

				// counters

				vertexCounter += 1;
			}
		}

		// indices

		// 1. you need three indices to draw a single face
		// 2. a single segment consists of two faces
		// 3. so we need to generate six (2*3) indices per segment
		for (iy = 0; iy < gridY; iy++) {
			for (ix = 0; ix < gridX; ix++) {
				const a = this.#numberOfVertices + ix + gridX1 * iy;
				const b = this.#numberOfVertices + ix + gridX1 * (iy + 1);
				const c = this.#numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
				const d = this.#numberOfVertices + (ix + 1) + gridX1 * iy;

				// faces
				this.#indices.push(a, b, d);
				this.#indices.push(b, c, d);
			}
		}

		// add a group to the geometry. this will ensure multi material support

		// calculate new start value for groups

		// update total number of vertices

		this.#numberOfVertices += vertexCounter;
	}
}
