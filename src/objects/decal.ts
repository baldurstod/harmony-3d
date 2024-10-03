import { mat4, vec3 } from 'gl-matrix';

import { Mesh } from './mesh';
import { Float32BufferAttribute, Uint16BufferAttribute } from '../geometry/bufferattribute';
import { BufferGeometry } from '../geometry/buffergeometry';
import { JSONLoader } from '../importers/jsonloader';
import { MeshBasicMaterial } from '../materials/meshbasicmaterial';
import { stringToVec3 } from '../utils/utils';
import { registerEntity } from '../entities/entities';

const DEFAULT_SIZE = vec3.fromValues(1, 1, 1);

export class Decal extends Mesh {
	#size = vec3.create();
	//constructor(size = DEFAULT_SIZE, material = new MeshBasicMaterial({polygonOffset:true})) {
	constructor(params: any = {}) {
		super(new DecalGeometry(), params.material ?? new MeshBasicMaterial({ polygonOffset: true }));
		this.setSize(params.size ?? DEFAULT_SIZE);
	}

	set position(position) {
		super.position = position;
		this.refreshGeometry();
	}

	get position() {
		return super.position;
	}

	parentChanged(parent) {
		this.refreshGeometry();
	}

	setSize(size: vec3) {
		vec3.copy(this.#size, size);
		this.refreshGeometry();
	}

	get size() {
		return this.#size;
	}

	refreshGeometry() {
		if (this.parent) {
			(this.geometry as DecalGeometry).applyTo(this.parent, this.worldMatrix, this.#size);
		}
	}

	buildContextMenu() {
		return Object.assign(super.buildContextMenu(), {
			StaticDecal_1: null,
			size: { i18n: '#size', f: () => { let v = prompt('Size', this.size.join(' ')); if (v !== null) { this.setSize(stringToVec3(v)); } } },
			refresh: { i18n: '#refresh', f: () => this.refreshGeometry() },
		});
	}

	static async constructFromJSON(json) {
		return new Decal(json.name);
	}

	static getEntityName() {
		return 'Decal';
	}
}
registerEntity(Decal);

class DecalGeometry extends BufferGeometry {
	applyTo(mesh, projectorMatrix, size) {
		let indices = [];
		let vertices = [];
		let normals = [];
		let uvs = [];

		this.#generate(mesh, projectorMatrix, size, indices, vertices, normals, uvs);
		//console.log(uvs);

		this.setIndex(new Uint16BufferAttribute(indices, 1));
		this.setAttribute('aVertexPosition', new Float32BufferAttribute(vertices, 3));
		this.setAttribute('aVertexNormal', new Float32BufferAttribute(normals, 3));
		this.setAttribute('aTextureCoord', new Float32BufferAttribute(uvs, 2));
		this.count = indices.length;
	}

	#generate(mesh, projectorMatrix, size, indices, vertices, normals, uvs) {
		let decalVertices = [];

		const projectorMatrixInverse = mat4.invert(mat4.create(), projectorMatrix);

		let vertex = vec3.create();
		let normal = vec3.create();

		const geometry = mesh.geometry;
		if (!geometry) {
			return;
		}

		const indexAttribute = geometry.attributes.get('index');
		const indexArray = indexAttribute._array;
		let posArray;
		let normalArray;
		if (!mesh.isSkeletalMesh) {
			posArray = geometry.attributes.get('aVertexPosition')._array;
			normalArray = geometry.attributes.get('aVertexNormal')._array;
		} else {
			mesh.prepareRayCasting();
			posArray = mesh.skinnedVertexPosition;
			normalArray = mesh.skinnedVertexNormal;
		}

		for (let i = 0, l = indexAttribute.count; i < l; ++i) {
			let index = indexArray[i];
			vertex[0] = posArray[index * 3];
			vertex[1] = posArray[index * 3 + 1];
			vertex[2] = posArray[index * 3 + 2];

			normal[0] = normalArray[index * 3];
			normal[1] = normalArray[index * 3 + 1];
			normal[2] = normalArray[index * 3 + 2];

			vec3.transformMat4(vertex, vertex, mesh.worldMatrix);
			vec3.transformMat4(vertex, vertex, projectorMatrixInverse);
			decalVertices.push([vec3.clone(vertex), vec3.clone(normal)]);
		}


		decalVertices = this.#clipGeometry(decalVertices, size, [1, 0, 0]);
		decalVertices = this.#clipGeometry(decalVertices, size, [- 1, 0, 0]);
		decalVertices = this.#clipGeometry(decalVertices, size, [0, 1, 0]);
		decalVertices = this.#clipGeometry(decalVertices, size, [0, - 1, 0]);
		decalVertices = this.#clipGeometry(decalVertices, size, [0, 0, 1]);
		decalVertices = this.#clipGeometry(decalVertices, size, [0, 0, - 1]);

		for (let i = 0; i < decalVertices.length; i++) {
			const decalVertex = decalVertices[i];

			// create texture coordinates (we are still in projector space)

			uvs.push(
				0.5 + (decalVertex[0][0] / size[0]),
				0.5 + (decalVertex[0][1] / size[1])
			);

			// transform the vertex back to world space
			let v = decalVertex[0];
			//vec3.transformMat4(v, v, projectorMatrix);

			vertices.push(...decalVertex[0]);
			normals.push(...decalVertex[1]);

			indices.push(i);
		}
	}


	#clipGeometry(inVertices, size, plane) {
		const outVertices = [];

		const s = 0.5 * Math.abs(vec3.dot(size, plane));

		// a single iteration clips one face,
		// which consists of three consecutive 'DecalVertex' objects

		for (let i = 0; i < inVertices.length; i += 3) {

			let total = 0;
			let nV1;
			let nV2;
			let nV3;
			let nV4;

			const d1 = vec3.dot(inVertices[i + 0][0], plane) - s;
			const d2 = vec3.dot(inVertices[i + 1][0], plane) - s;
			const d3 = vec3.dot(inVertices[i + 2][0], plane) - s;

			const v1Out = d1 > 0;
			const v2Out = d2 > 0;
			const v3Out = d3 > 0;

			// calculate, how many vertices of the face lie outside of the clipping plane

			total = (v1Out ? 1 : 0) + (v2Out ? 1 : 0) + (v3Out ? 1 : 0);

			switch (total) {

				case 0: {

					// the entire face lies inside of the plane, no clipping needed

					outVertices.push(inVertices[i]);
					outVertices.push(inVertices[i + 1]);
					outVertices.push(inVertices[i + 2]);
					break;

				}

				case 1: {

					// one vertex lies outside of the plane, perform clipping

					if (v1Out) {

						nV1 = inVertices[i + 1];
						nV2 = inVertices[i + 2];
						nV3 = this.#clip(inVertices[i], nV1, plane, s);
						nV4 = this.#clip(inVertices[i], nV2, plane, s);

					}

					if (v2Out) {

						nV1 = inVertices[i];
						nV2 = inVertices[i + 2];
						nV3 = this.#clip(inVertices[i + 1], nV1, plane, s);
						nV4 = this.#clip(inVertices[i + 1], nV2, plane, s);

						outVertices.push(nV3);
						outVertices.push([vec3.clone(nV2[0]), vec3.clone(nV2[1])]);//outVertices.push( nV2.clone() );
						outVertices.push([vec3.clone(nV1[0]), vec3.clone(nV1[1])]);//outVertices.push( nV1.clone() );

						outVertices.push([vec3.clone(nV2[0]), vec3.clone(nV2[1])]);//outVertices.push( nV2.clone() );
						outVertices.push([vec3.clone(nV3[0]), vec3.clone(nV3[1])]);//outVertices.push( nV3.clone() );
						outVertices.push(nV4);
						break;

					}

					if (v3Out) {

						nV1 = inVertices[i];
						nV2 = inVertices[i + 1];
						nV3 = this.#clip(inVertices[i + 2], nV1, plane, s);
						nV4 = this.#clip(inVertices[i + 2], nV2, plane, s);

					}

					outVertices.push([vec3.clone(nV1[0]), vec3.clone(nV1[1])]);//outVertices.push( nV1.clone() );
					outVertices.push([vec3.clone(nV2[0]), vec3.clone(nV2[1])]);//outVertices.push( nV2.clone() );
					outVertices.push(nV3);

					outVertices.push(nV4);
					outVertices.push([vec3.clone(nV3[0]), vec3.clone(nV3[1])]);//outVertices.push( nV3.clone() );
					outVertices.push([vec3.clone(nV2[0]), vec3.clone(nV2[1])]);//outVertices.push( nV2.clone() );

					break;

				}

				case 2: {

					// two vertices lies outside of the plane, perform clipping

					if (!v1Out) {

						nV1 = [vec3.clone(inVertices[i][0]), vec3.clone(inVertices[i][1])];//inVertices[ i ].clone();
						nV2 = this.#clip(nV1, inVertices[i + 1], plane, s);
						nV3 = this.#clip(nV1, inVertices[i + 2], plane, s);
						outVertices.push(nV1);
						outVertices.push(nV2);
						outVertices.push(nV3);

					}

					if (!v2Out) {

						nV1 = [vec3.clone(inVertices[i + 1][0]), vec3.clone(inVertices[i + 1][1])];//inVertices[ i + 1 ].clone();
						nV2 = this.#clip(nV1, inVertices[i + 2], plane, s);
						nV3 = this.#clip(nV1, inVertices[i], plane, s);
						outVertices.push(nV1);
						outVertices.push(nV2);
						outVertices.push(nV3);

					}

					if (!v3Out) {

						nV1 = [vec3.clone(inVertices[i + 2][0]), vec3.clone(inVertices[i + 2][1])];//inVertices[ i + 2 ].clone();
						nV2 = this.#clip(nV1, inVertices[i], plane, s);
						nV3 = this.#clip(nV1, inVertices[i + 1], plane, s);
						outVertices.push(nV1);
						outVertices.push(nV2);
						outVertices.push(nV3);

					}

					break;

				}

				case 3: {

					// the entire face lies outside of the plane, so let's discard the corresponding vertices

					break;

				}

			}

		}

		return outVertices;

	}


	#clip(v0, v1, p, s) {
		const v0Pos = v0[0];
		const v1Pos = v1[0];
		const v0Norm = v0[1];
		const v1Norm = v1[1];
		const d0 = vec3.dot(v0Pos, p) - s;
		const d1 = vec3.dot(v1Pos, p) - s;

		const s0 = d0 / (d0 - d1);

		// need to clip more values (texture coordinates)? do it this way:
		// intersectpoint.value = a.value + s * ( b.value - a.value );

		return [
			[
				v0Pos[0] + s0 * (v1Pos[0] - v0Pos[0]),
				v0Pos[1] + s0 * (v1Pos[1] - v0Pos[1]),
				v0Pos[2] + s0 * (v1Pos[2] - v0Pos[2])
			],
			[
				v0Norm[0] + s0 * (v1Norm[0] - v0Norm[0]),
				v0Norm[1] + s0 * (v1Norm[1] - v0Norm[1]),
				v0Norm[2] + s0 * (v1Norm[2] - v0Norm[2])
			]
		];

	}

}
