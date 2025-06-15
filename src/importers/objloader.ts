import { vec2, vec3 } from 'gl-matrix';

import { Float32BufferAttribute, Uint32BufferAttribute } from '../geometry/bufferattribute'
import { BufferGeometry } from '../geometry/buffergeometry';
import { MeshBasicMaterial } from '../materials/meshbasicmaterial';
import { Mesh } from '../objects/mesh';
import { Obj, ObjFace } from './obj';

function readVertex(line) {
	const arr = line.split(' ');
	return vec3.fromValues(arr[1] ?? 0.0, arr[2] ?? 0.0, arr[3] ?? 0.0/*, arr[4] ?? 1.0*/);
}

function readVertexCoord(line) {
	const arr = line.split(' ');
	return vec2.fromValues(arr[1] ?? 0.0, arr[2] ?? 0);
}

function readVertexNormal(line) {
	const arr = line.split(' ');
	const v = vec3.fromValues(arr[1] ?? 1.0, arr[2] ?? 1, arr[3] ?? 1);
	return vec3.normalize(v, v);
}

function readFace(line) {
	const arr = line.split(' ');
	const face = new ObjFace();
	for (let i = 1; i < arr.length; i++) {
		const v = arr[i];
		///let faceVertex = [];
		if (v) {
			const v2 = v.split('/');
			//faceVertex.push(v2[0] ?? 0, v2[1] ?? 0, v2[2] ?? 0);
			face.v.push((v2[0] ?? 1) - 1);
			face.t.push((v2[1] ?? 1) - 1);
			face.n.push((v2[2] ?? 1) - 1);
		} else {
			//			faceVertex.push(0, 0, 0);
			face.v.push(0);
			face.n.push(0);
			face.t.push(0);
		}
		//face.push(faceVertex);
	}
	return face;
}

function buildMesh(obj) {
	const geometry = new BufferGeometry();
	const material = new MeshBasicMaterial();

	const m = obj.toMesh();


	geometry.setIndex(new Uint32BufferAttribute(m.i, 1));
	geometry.setAttribute('aVertexPosition', new Float32BufferAttribute(m.v, 3));
	geometry.setAttribute('aVertexNormal', new Float32BufferAttribute(m.n, 3));
	geometry.setAttribute('aTextureCoord', new Float32BufferAttribute(m.t, 2));
	geometry.count = m.i.length;

	return new Mesh(geometry, material);
}

export class OBJImporter {
	static load(txt) {
		const lines = txt.split('\n');
		const vertices = [];
		const verticesNormals = [];
		const verticesCoords = [];
		const faces = [];

		const obj = new Obj();

		for (let line of lines) {
			line = line.trim();
			line = line.replace(/\s+/g, ' ');
			if (line.startsWith('v ')) {
				//vertices.push(readVertex(line));
				obj.addVertex(readVertex(line));
			} else if (line.startsWith('vt ')) {
				//verticesCoords.push(readVertexCoord(line));
				obj.addUv(readVertexCoord(line));
			} else if (line.startsWith('vn ')) {
				//verticesNormals.push(readVertexNormal(line));
				obj.addNormal(readVertexNormal(line));
			} else if (line.startsWith('f ')) {
				//faces.push(readFace(line));
				obj.addFace(readFace(line));
			}
		}

		return buildMesh(obj);
		//return buildMesh(vertices, verticesNormals, verticesCoords, faces);
	}
}
