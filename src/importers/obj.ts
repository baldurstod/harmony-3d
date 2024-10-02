import { vec2, vec3, vec4 } from 'gl-matrix';

export class ObjFace {
	v: number[] = [];
	n: number[] = [];
	t: number[] = [];
}

export class Obj {
	#vertices: vec3[] = [];
	#normals: vec3[] = [];
	#uvs: vec2[] = [];
	#faces: ObjFace[] = [];

	addVertex(v: vec3) {
		this.#vertices.push(v);
	}

	addNormal(n: vec3) {
		this.#normals.push(n);
	}

	addUv(t: vec2) {
		this.#uvs.push(t);
	}

	addFace(f: ObjFace) {
		this.#faces.push(f);
	}

	toMesh() {
		//TODO: handle polygons and commons vertices
		const indices: number[] = [];
		const vertices: number[] = [];
		const normals: number[] = [];
		const uvs: number[] = [];

		const hasNormals = this.#normals.length > 0;
		const hasUv = this.#uvs.length > 0;
		let i = 0;
		for (const f of this.#faces) {
			indices.push(i, i + 1, i + 2);
			i += 3;

			vertices.push(...this.#vertices[f.v[0]])
			vertices.push(...this.#vertices[f.v[1]])
			vertices.push(...this.#vertices[f.v[2]])

			if (hasNormals) {
				normals.push(...this.#normals[f.n[0]])
				normals.push(...this.#normals[f.n[1]])
				normals.push(...this.#normals[f.n[2]])
			}

			if (hasUv) {
				uvs.push(...this.#uvs[f.t[0]])
				uvs.push(...this.#uvs[f.t[1]])
				uvs.push(...this.#uvs[f.t[2]])
			}
		}
		return {i: indices, v: vertices, n: normals, t: uvs};
	}
}
