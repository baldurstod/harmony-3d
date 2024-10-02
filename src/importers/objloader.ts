import { vec2, vec3 } from 'gl-matrix';

import { Float32BufferAttribute, Uint32BufferAttribute } from '../geometry/bufferattribute'
import { BufferGeometry } from '../geometry/buffergeometry';
import { MeshBasicMaterial } from '../materials/meshbasicmaterial';
import { Mesh } from '../objects/mesh';
import { Obj, ObjFace } from './obj';

function readVertex(line) {
	let arr = line.split(' ');
	return vec3.fromValues(arr[1] ?? 0.0, arr[2] ?? 0.0, arr[3] ?? 0.0/*, arr[4] ?? 1.0*/);
}

function readVertexCoord(line) {
	let arr = line.split(' ');
	return vec2.fromValues(arr[1] ?? 0.0, arr[2] ?? 0);
}

function readVertexNormal(line) {
	let arr = line.split(' ');
	let v = vec3.fromValues(arr[1] ?? 1.0, arr[2] ?? 1, arr[3] ?? 1);
	return vec3.normalize(v, v);
}

function readFace(line) {
	let arr = line.split(' ');
	let face = new ObjFace();
	for (let i = 1; i < arr.length; i++) {
		let v = arr[i];
		///let faceVertex = [];
		if (v) {
			let v2 = v.split('/');
			//faceVertex.push(v2[0] ?? 0, v2[1] ?? 0, v2[2] ?? 0);
			face.v.push(v2[0] - 1 ?? 0);
			face.t.push(v2[1] - 1 ?? 0);
			face.n.push(v2[2] - 1 ?? 0);
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
	let geometry = new BufferGeometry();
	let material = new MeshBasicMaterial();

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
		let lines = txt.split('\n');
		let vertices = [];
		let verticesNormals = [];
		let verticesCoords = [];
		let faces = [];

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
