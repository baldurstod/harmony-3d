import { vec3 } from 'gl-matrix';
import { Float32BufferAttribute, Uint16BufferAttribute } from '../../geometry/bufferattribute';
import { BufferGeometry } from '../../geometry/buffergeometry';

export class SphereBufferGeometry extends BufferGeometry {
	updateGeometry(radius: number, segments: number, rings: number, phiStart: number, phiLength: number, thetaStart: number, thetaLength: number) {
		segments = Math.max(3, Math.floor(segments));
		rings = Math.max(2, Math.floor(rings));

		//phiStart = phiStart !== undefined ? phiStart : 0;
		//phiLength = phiLength !== undefined ? phiLength : Math.PI * 2;

		//thetaStart = thetaStart !== undefined ? thetaStart : 0;
		//thetaLength = thetaLength !== undefined ? thetaLength : Math.PI;

		const thetaEnd = Math.min(thetaStart + thetaLength, Math.PI);

		let ix, iy;

		let index = 0;
		const grid = [];

		const vertex = vec3.create();
		const normal = vec3.create();

		// buffers

		const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];

		// generate vertices, normals and uvs

		for (iy = 0; iy <= rings; iy++) {

			const verticesRow = [];

			const v = iy / rings;

			// special case for the poles

			let uOffset = 0;

			if (iy == 0 && thetaStart == 0) {

				uOffset = 0.5 / segments;

			} else if (iy == rings && thetaEnd == Math.PI) {

				uOffset = - 0.5 / segments;

			}

			for (ix = 0; ix <= segments; ix++) {

				const u = ix / segments;

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

				verticesRow.push(index++);

			}

			grid.push(verticesRow);

		}

		// indices

		for (iy = 0; iy < rings; iy++) {
			for (ix = 0; ix < segments; ix++) {
				const a: number = grid[iy]![ix + 1]!;
				const b: number = grid[iy]![ix]!;
				const c: number = grid[iy + 1]![ix]!;
				const d: number = grid[iy + 1]![ix + 1]!;

				if (iy !== 0 || thetaStart > 0) indices.push(a, b, d);
				if (iy !== rings - 1 || thetaEnd < Math.PI) indices.push(b, c, d);
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
