import { vec2, vec3 } from 'gl-matrix';

import { Entity } from '../entities/entity';
import { MaterialManager } from '../materials/materialmanager';
import { BoundingBox } from '../math/boundingbox';
import { getUV, getNormal } from '../math/triangle';
import { Ray } from '../raycasting/ray';
import { Interaction } from '../utils/interaction';
import { GL_TRIANGLES } from '../webgl/constants';
import { BufferGeometry } from '../geometry/buffergeometry';
import { Material } from '../materials/material';

const tempVec3 = vec3.create();

let v1 = vec3.create();
let v2 = vec3.create();
let v3 = vec3.create();
let n1 = vec3.create();
let n2 = vec3.create();
let n3 = vec3.create();
let uv1 = vec2.create();
let uv2 = vec2.create();
let uv3 = vec2.create();
let intersectionPoint = vec3.create();
let intersectionNormal = vec3.create();
let ray = new Ray();
let uv = vec2.create();

export class Mesh extends Entity {
	#geometry: BufferGeometry;
	#material: Material;
	#dirtyProgram = true;//TODOv3 use another method
	renderMode = GL_TRIANGLES;
	isRenderable = true;
	uniforms = {};
	defines = Object.create(null);
	constructor(geometry: BufferGeometry, material: Material) {
		super();
		this.setGeometry(geometry);
		this.setMaterial(material);
	}

	set material(material) {
		this.setMaterial(material);
	}

	get material() {
		return this.getMaterial();
	}

	setGeometry(geometry) {
		if (this.#geometry == geometry) {
			return;
		}
		if (this.#geometry) {
			this.#geometry.removeUser(this);
		}
		if (geometry) {
			geometry.addUser(this);
		}
		this.#geometry = geometry;
	}

	get geometry() {
		return this.#geometry;
	}

	setMaterial(material) {
		if (this.#material != material) {
			if (this.#material) {
				this.#material.removeUser(this);
			}

			if (material) {
				material.addUser(this);
			}
			this.#material = material;
		}
	}

	getMaterial() {
		return this.#material;
	}

	getUniform(name: string) {
		return this.uniforms[name];
	}

	setUniform(name: string, uniform) {
		this.uniforms[name] = uniform;
	}

	deleteUniform(name: string) {
		delete this.uniforms[name];
	}

	setDefine(define: string, value: string | number = '') {
		this.defines[define] = value;
	}

	removeDefine(define: string) {
		delete this.defines[define];
	}

	exportObj() {
		let ret = { f: [], v: [] };
		let attributes = { f: 'index', v: 'aVertexPosition', vn: 'aVertexNormal', vt: 'aTextureCoord' };
		let geometry = this.geometry;
		for (let objAttribute in attributes) {
			let geometryAttribute = attributes[objAttribute];
			if (geometry.getAttribute(geometryAttribute)) {
				let webglAttrib = geometry.getAttribute(geometryAttribute);
				if (webglAttrib) {
					ret[objAttribute] = webglAttrib._array;
				}
			} else {
				ret[objAttribute] = [];
			}
		}
		return ret;
	}

	dispose() {
		super.dispose();
		this.#material?.removeUser(this);
		this.#geometry?.removeUser(this);
	}

	toString() {
		return 'Mesh ' + super.toString();
	}

	getBoundsModelSpace(min = vec3.create(), max = vec3.create()) {
		min[0] = Infinity;
		min[1] = Infinity;
		min[2] = Infinity;
		max[0] = -Infinity;
		max[1] = -Infinity;
		max[2] = -Infinity;

		let vertexPosition = this.geometry.getAttribute('aVertexPosition')._array;
		for (let i = 0, l = vertexPosition.length; i < l; i += 3) {
			tempVec3[0] = vertexPosition[i + 0];
			tempVec3[1] = vertexPosition[i + 1];
			tempVec3[2] = vertexPosition[i + 2];
			vec3.min(min, min, tempVec3);
			vec3.max(max, max, tempVec3);
		}
		//console.error(min, max);
	}

	getBoundingBox(boundingBox = new BoundingBox()) {
		boundingBox.reset();
		boundingBox.setPoints(this.geometry.getAttribute('aVertexPosition')._array);
		return boundingBox;
	}

	propagate() {
		super.propagate();
		this.#desaturate(this.getAttribute('desaturate'));
	}

	#desaturate(attributeValue) {
		if (attributeValue) {
			this.setDefine('DESATURATE');
		} else {
			this.removeDefine('DESATURATE');
		}
	}

	buildContextMenu() {
		let contextMenu = super.buildContextMenu();

		Object.assign(contextMenu.material.submenu, {
			Mesh_1: null,
			set_material: {
				i18n: '#set_material', f: async (entity) => {
					let materialName = await Interaction.getString(MaterialManager.getMaterialList()); if (materialName) {
						let material = await MaterialManager.getMaterial(materialName, (material) => { if (material) { this.setMaterial(material); } });
					}
				}
			},
		})
		return contextMenu;
	}

	raycast(raycaster, intersections) {
		let geometry = this.geometry;
		let indices = geometry.getAttribute('index')._array;
		let vertices = geometry.getAttribute('aVertexPosition')._array;
		let textureCoords = geometry.getAttribute('aTextureCoord')._array;
		let normals = geometry.getAttribute('aVertexNormal')?._array;
		let worldMatrix = this.worldMatrix;
		ray.copyTransform(raycaster.ray, worldMatrix);
		if (normals) {
			for (let i = 0, l = indices.length; i < l; i += 3) {
				let i1 = 3 * indices[i];
				let i2 = 3 * indices[i + 1];
				let i3 = 3 * indices[i + 2];

				vec3.set(v1, vertices[i1], vertices[i1 + 1], vertices[i1 + 2]);
				vec3.set(v2, vertices[i2], vertices[i2 + 1], vertices[i2 + 2]);
				vec3.set(v3, vertices[i3], vertices[i3 + 1], vertices[i3 + 2]);

				if (ray.intersectTriangle(v1, v2, v3, intersectionPoint)) {
					vec3.set(n1, normals[i1], normals[i1 + 1], normals[i1 + 2]);
					vec3.set(n2, normals[i2], normals[i2 + 1], normals[i2 + 2]);
					vec3.set(n3, normals[i3], normals[i3 + 1], normals[i3 + 2]);


					i1 = 2 * indices[i];
					i2 = 2 * indices[i + 1];
					i3 = 2 * indices[i + 2];
					vec2.set(uv1, textureCoords[i1], textureCoords[i1 + 1]);
					vec2.set(uv2, textureCoords[i2], textureCoords[i2 + 1]);
					vec2.set(uv3, textureCoords[i3], textureCoords[i3 + 1]);

					getUV(uv, intersectionPoint, v1, v2, v3, uv1, uv2, uv3);
					getNormal(intersectionNormal, intersectionPoint, v1, v2, v3, n1, n2, n3);

					let x = intersectionNormal[0];
					let y = intersectionNormal[1];
					let z = intersectionNormal[2];

					//Tranform the normal with the world matrix
					intersectionNormal[0] = worldMatrix[0] * x + worldMatrix[4] * y + worldMatrix[8] * z;
					intersectionNormal[1] = worldMatrix[1] * x + worldMatrix[5] * y + worldMatrix[9] * z;
					intersectionNormal[2] = worldMatrix[2] * x + worldMatrix[6] * y + worldMatrix[10] * z;

					vec3.transformMat4(intersectionPoint, intersectionPoint, worldMatrix);
					intersections.push(ray.createIntersection(intersectionPoint, intersectionNormal, uv, this, 0));
				}
			}
		} else {
			normals = Float32Array.from([1, 0, 0]);
			for (let i = 0, l = indices.length; i < l; i += 3) {
				let i1 = 3 * indices[i];
				let i2 = 3 * indices[i + 1];
				let i3 = 3 * indices[i + 2];

				vec3.set(v1, vertices[i1], vertices[i1 + 1], vertices[i1 + 2]);
				vec3.set(v2, vertices[i2], vertices[i2 + 1], vertices[i2 + 2]);
				vec3.set(v3, vertices[i3], vertices[i3 + 1], vertices[i3 + 2]);

				if (ray.intersectTriangle(v1, v2, v3, intersectionPoint)) {
					vec3.set(n1, normals[0], normals[1], normals[2]);
					vec3.set(n2, normals[0], normals[1], normals[2]);
					vec3.set(n3, normals[0], normals[1], normals[2]);


					i1 = 2 * indices[i];
					i2 = 2 * indices[i + 1];
					i3 = 2 * indices[i + 2];
					vec2.set(uv1, textureCoords[i1], textureCoords[i1 + 1]);
					vec2.set(uv2, textureCoords[i2], textureCoords[i2 + 1]);
					vec2.set(uv3, textureCoords[i3], textureCoords[i3 + 1]);

					getUV(uv, intersectionPoint, v1, v2, v3, uv1, uv2, uv3);
					getNormal(intersectionNormal, intersectionPoint, v1, v2, v3, n1, n2, n3);

					let x = intersectionNormal[0];
					let y = intersectionNormal[1];
					let z = intersectionNormal[2];

					//Tranform the normal with the world matrix
					intersectionNormal[0] = worldMatrix[0] * x + worldMatrix[4] * y + worldMatrix[8] * z;
					intersectionNormal[1] = worldMatrix[1] * x + worldMatrix[5] * y + worldMatrix[9] * z;
					intersectionNormal[2] = worldMatrix[2] * x + worldMatrix[6] * y + worldMatrix[10] * z;

					vec3.transformMat4(intersectionPoint, intersectionPoint, worldMatrix);
					intersections.push(ray.createIntersection(intersectionPoint, intersectionNormal, uv, this, 0));
				}
			}
		}
	}

	get entityName() {
		return 'Static mesh';
	}

	is(s: string): boolean {
		if (s == 'Mesh') {
			return true;
		} else {
			return super.is(s);
		}
	}
}
