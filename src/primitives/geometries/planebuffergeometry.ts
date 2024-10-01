import { Float32BufferAttribute, Uint16BufferAttribute } from '../../geometry/bufferattribute'
import { BufferGeometry } from '../../geometry/buffergeometry';

export class PlaneBufferGeometry extends BufferGeometry {
	constructor() {
		super();
	}

	updateGeometry(width, height, widthSegments, heightSegments) {

		///width = width || 1;
		//height = height || 1;

		var width_half = width / 2;
		var height_half = height / 2;

		var gridX = Math.floor(widthSegments);
		var gridY = Math.floor(heightSegments);

		var gridX1 = gridX + 1;
		var gridY1 = gridY + 1;

		var segment_width = width / gridX;
		var segment_height = height / gridY;

		var ix, iy;

		// buffers

		var indices = [];
		var vertices = [];
		var normals = [];
		var uvs = [];

		// generate vertices, normals and uvs

		for (iy = 0; iy < gridY1; iy ++) {

			var y = iy * segment_height - height_half;

			for (ix = 0; ix < gridX1; ix ++) {

				var x = ix * segment_width - width_half;

				vertices.push(x, - y, 0);

				normals.push(0, 0, 1);

				uvs.push(ix / gridX);
				uvs.push(1 - (iy / gridY));

			}

		}

		// indices

		for (iy = 0; iy < gridY; iy ++) {

			for (ix = 0; ix < gridX; ix ++) {

				var a = ix + gridX1 * iy;
				var b = ix + gridX1 * (iy + 1);
				var c = (ix + 1) + gridX1 * (iy + 1);
				var d = (ix + 1) + gridX1 * iy;

				// faces

				indices.push(a, b, d);
				indices.push(b, c, d);

			}

		}

		// build geometry

		this.setIndex(new Uint16BufferAttribute(indices, 1));
		this.setAttribute('aVertexPosition', new Float32BufferAttribute(vertices, 3));
		this.setAttribute('aVertexNormal', new Float32BufferAttribute(normals, 3));
		this.setAttribute('aTextureCoord', new Float32BufferAttribute(uvs, 2));
		this.count = indices.length;
	}
}
