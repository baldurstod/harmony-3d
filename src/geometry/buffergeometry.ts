import { BufferAttribute, Uint16BufferAttribute, Uint32BufferAttribute } from './bufferattribute';
import { GL_ELEMENT_ARRAY_BUFFER, GL_UNSIGNED_SHORT, GL_UNSIGNED_INT } from '../webgl/constants';
import { DEBUG, TESTING } from '../buildoptions';

export class BufferGeometry {
	#elementArrayType: GLenum;
	#users = new Set<any>();
	attributes = new Map<string, BufferAttribute>();
	dirty: boolean = true;
	count: number = 0;

	getAttribute(name: string) {
		return this.attributes.get(name);
	}

	setAttribute(name: string, attribute: BufferAttribute) {
		this.attributes.set(name, attribute);
	}

	hasAttribute(name: string) {
		return this.attributes.has(name);
	}

	deleteAttribute(name: string) {
		this.attributes.delete(name);
	}

	get elementArrayType() {
		return this.#elementArrayType;
	}

	/*getUniform(name) {
		return this.uniforms.get(name);
	}

	setUniform(name, uniform) {
		this.uniforms.set(name, uniform);
	}

	deleteUniform(name) {
		this.uniforms.delete(name);
	}*/

	setIndex(attribute: BufferAttribute) {//fixme
		if (DEBUG) {
			if (!(attribute instanceof Uint16BufferAttribute) && !(attribute instanceof Uint32BufferAttribute)) {
				throw 'attribute must be Uint16BufferAttribute or Uint32BufferAttribute';
			}
		}
		this.#elementArrayType = attribute instanceof Uint32BufferAttribute ? GL_UNSIGNED_INT : GL_UNSIGNED_SHORT;
		attribute.target = GL_ELEMENT_ARRAY_BUFFER;
		this.setAttribute('index', attribute);
		return;
		/*let attribute;
		if (Array.isArray(index)) {
			attribute = new (arrayMax(index) > 65535 ? Uint32BufferAttribute : Uint16BufferAttribute)(index, 1, offset, length);
		} else {
			attribute = index;
		}

		this.#elementArrayType = attribute instanceof Uint32BufferAttribute ? GL_UNSIGNED_INT : GL_UNSIGNED_SHORT;
		attribute.target = GL_ELEMENT_ARRAY_BUFFER;
		this.setAttribute('index', attribute);
*/
	}

	update(glContext) {
		throw 'error';
		if (this.dirty) {
			for (let [name, attribute] of this.attributes) {
				attribute.update(glContext);
			}
			this.dirty = false;
		}
	}

	computeVertexNormals() {
		/* TODO
		var index = this.index;
		var attributes = this.attributes;

		if (attributes.position) {
			var positions = attributes.position.array;
			if (attributes.normal === undefined) {
				this.setAttribute('normal', new BufferAttribute(new Float32Array(positions.length), 3));//TODOV3: replace with a Float32BufferAttribute
			} else {
				// reset existing normals to zero
				var array = attributes.normal.array;
				for (var i = 0, il = array.length; i < il; i++) {
					array[i] = 0;
				}
			}

			var normals = attributes.normal.array;

			var vA, vB, vC;
			var pA = new Vector3(), pB = new Vector3(), pC = new Vector3();
			var cb = new Vector3(), ab = new Vector3();

			// indexed elements

			if (index) {
				var indices = index.array;
				for (var i = 0, il = index.count; i < il; i += 3) {
					vA = indices[i + 0] * 3;
					vB = indices[i + 1] * 3;
					vC = indices[i + 2] * 3;

					pA.fromArray(positions, vA);
					pB.fromArray(positions, vB);
					pC.fromArray(positions, vC);

					cb.subVectors(pC, pB);
					ab.subVectors(pA, pB);
					cb.cross(ab);

					normals[vA] += cb.x;
					normals[vA + 1] += cb.y;
					normals[vA + 2] += cb.z;

					normals[vB] += cb.x;
					normals[vB + 1] += cb.y;
					normals[vB + 2] += cb.z;

					normals[vC] += cb.x;
					normals[vC + 1] += cb.y;
					normals[vC + 2] += cb.z;
				}
			} else {
				// non-indexed elements (unconnected triangle soup)
				for (var i = 0, il = positions.length; i < il; i += 9) {
					pA.fromArray(positions, i);
					pB.fromArray(positions, i + 3);
					pC.fromArray(positions, i + 6);

					cb.subVectors(pC, pB);
					ab.subVectors(pA, pB);
					cb.cross(ab);

					normals[i] = cb.x;
					normals[i + 1] = cb.y;
					normals[i + 2] = cb.z;

					normals[i + 3] = cb.x;
					normals[i + 4] = cb.y;
					normals[i + 5] = cb.z;

					normals[i + 6] = cb.x;
					normals[i + 7] = cb.y;
					normals[i + 8] = cb.z;
				}
			}
			this.normalizeNormals();
			attributes.normal.needsUpdate = true;
		}
			*/
	}

	clone(): BufferGeometry {
		const clone = new BufferGeometry();
		for (let [attributeName, attribute] of this.attributes) {
			clone.attributes.set(attributeName, attribute);
		}

		clone.count = this.count;
		clone.#elementArrayType = this.#elementArrayType;
		this.dirty = true;//TODO: or should we copy this.dirty ?
		return clone;
	}

	addUser(user: any) {
		this.#users.add(user);
	}

	removeUser(user: any) {
		this.#users.delete(user);
		this.dispose();
	}

	hasNoUser(): boolean {
		return this.#users.size == 0;
	}

	hasOnlyUser(user: any) {
		return (this.#users.size == 1) && (this.#users.has(user));
	}

	dispose() {
		if (this.hasNoUser()) {
			if (TESTING) {
				console.info('BufferGeometry has no more users, deleting', this);
			}
		}
	}
}
