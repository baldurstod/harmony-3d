import { vec3 } from 'gl-matrix';
import { Float32BufferAttribute, Uint16BufferAttribute } from '../../geometry/bufferattribute'
import { BufferGeometry } from '../../geometry/buffergeometry';

const a = vec3.create();
const b = vec3.create();

export class TrianglesBufferGeometry extends BufferGeometry {
	constructor(triangles?: vec3[][]) {
		super();
		this.updateGeometry(triangles);
	}

	updateGeometry(triangles: vec3[][] = []) {
		const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];

		let vertexIndex;
		const normal = vec3.create();
		for (let triangleIndex = 0; triangleIndex < triangles.length; ++triangleIndex) {
			vertexIndex = triangleIndex * 3;
			indices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2);

			vertices.push(...triangles[triangleIndex]![0]!);
			vertices.push(...triangles[triangleIndex]![1]!);
			vertices.push(...triangles[triangleIndex]![2]!);

			vec3.sub(a, triangles[triangleIndex]![1]!, triangles[triangleIndex]![0]!);
			vec3.sub(b, triangles[triangleIndex]![2]!, triangles[triangleIndex]![0]!);
			vec3.cross(normal, a, b);
			vec3.normalize(normal, normal);
			normals.push(...normal);
			normals.push(...normal);
			normals.push(...normal);
		}
		// build geometry

		this.setIndex(new Uint16BufferAttribute(indices, 1));
		this.setAttribute('aVertexPosition', new Float32BufferAttribute(vertices, 3));
		this.setAttribute('aVertexNormal', new Float32BufferAttribute(normals, 3));
		//this.setAttribute('aTextureCoord', new Float32BufferAttribute(uvs, 2));
		this.count = indices.length;
	}
}
