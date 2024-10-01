import { vec3 } from 'gl-matrix';

import { Float32BufferAttribute, Uint16BufferAttribute } from '../../geometry/bufferattribute'
import { BufferGeometry } from '../../geometry/buffergeometry';

export class SphereBufferGeometry extends BufferGeometry {
	updateGeometry(radius, segments, rings, phiStart, phiLength, thetaStart, thetaLength) {
		segments = Math.max(3, Math.floor(segments));
		rings = Math.max(2, Math.floor(rings));

		//phiStart = phiStart !== undefined ? phiStart : 0;
		//phiLength = phiLength !== undefined ? phiLength : Math.PI * 2;

		//thetaStart = thetaStart !== undefined ? thetaStart : 0;
		//thetaLength = thetaLength !== undefined ? thetaLength : Math.PI;

		var thetaEnd = Math.min(thetaStart + thetaLength, Math.PI);

		var ix, iy;

		var index = 0;
		var grid = [];

		var vertex = vec3.create();
		var normal = vec3.create();

		// buffers

		var indices = [];
		var vertices = [];
		var normals = [];
		var uvs = [];

		// generate vertices, normals and uvs

		for (iy = 0; iy <= rings; iy ++) {

			var verticesRow = [];

			var v = iy / rings;

			// special case for the poles

			var uOffset = 0;

			if (iy == 0 && thetaStart == 0) {

				uOffset = 0.5 / segments;

			} else if (iy == rings && thetaEnd == Math.PI) {

				uOffset = - 0.5 / segments;

			}

			for (ix = 0; ix <= segments; ix ++) {

				var u = ix / segments;

				// vertex

				vertex[0] = - radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
				vertex[2] = radius * Math.cos(thetaStart + v * thetaLength);
				vertex[1] = -radius * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);

				vertices.push(...vertex);

				// normal
				vec3.normalize(normal, vertex);
				normals.push(...normal);

				// uv

				uvs.push(u + uOffset, 1 - v);

				verticesRow.push(index ++);

			}

			grid.push(verticesRow);

		}

		// indices

		for (iy = 0; iy < rings; iy ++) {

			for (ix = 0; ix < segments; ix ++) {

				var a = grid[ iy ][ ix + 1 ];
				var b = grid[ iy ][ ix ];
				var c = grid[ iy + 1 ][ ix ];
				var d = grid[ iy + 1 ][ ix + 1 ];

				if (iy !== 0 || thetaStart > 0) indices.push(a, b, d);
				if (iy !== rings - 1 || thetaEnd < Math.PI) indices.push(b, c, d);

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
