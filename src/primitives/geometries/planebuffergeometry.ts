import { Float32BufferAttribute, Uint16BufferAttribute } from '../../geometry/bufferattribute'
import { BufferGeometry } from '../../geometry/buffergeometry';

export class PlaneBufferGeometry extends BufferGeometry {

	updateGeometry(width: number, height: number, widthSegments: number, heightSegments: number) {

		///width = width || 1;
		//height = height || 1;

		const width_half = width / 2;
		const height_half = height / 2;

		const gridX = Math.floor(widthSegments);
		const gridY = Math.floor(heightSegments);

		const gridX1 = gridX + 1;
		const gridY1 = gridY + 1;

		const segment_width = width / gridX;
		const segment_height = height / gridY;

		let ix, iy;

		// buffers

		const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];

		// generate vertices, normals and uvs

		for (iy = 0; iy < gridY1; iy++) {

			const y = iy * segment_height - height_half;

			for (ix = 0; ix < gridX1; ix++) {

				const x = ix * segment_width - width_half;

				vertices.push(x, - y, 0);

				normals.push(0, 0, 1);

				uvs.push(ix / gridX);
				uvs.push(1 - (iy / gridY));

			}

		}

		// indices

		for (iy = 0; iy < gridY; iy++) {

			for (ix = 0; ix < gridX; ix++) {

				const a = ix + gridX1 * iy;
				const b = ix + gridX1 * (iy + 1);
				const c = (ix + 1) + gridX1 * (iy + 1);
				const d = (ix + 1) + gridX1 * iy;

				// faces

				indices.push(a, b, d);
				indices.push(b, c, d);

			}

		}

		// build geometry

		this.setIndex(new Uint16BufferAttribute(indices, 1, 'index'));
		this.setAttribute('aVertexPosition', new Float32BufferAttribute(vertices, 3, 'position'));
		this.setAttribute('aVertexNormal', new Float32BufferAttribute(normals, 3, 'normal'));
		this.setAttribute('aTextureCoord', new Float32BufferAttribute(uvs, 2, 'texCoord'));
		this.count = indices.length;
	}
}
