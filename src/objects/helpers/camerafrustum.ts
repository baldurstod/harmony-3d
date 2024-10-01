import { vec3 } from 'gl-matrix';

import { Mesh } from '../mesh';
import { Float32BufferAttribute, Uint8BufferAttribute, Uint16BufferAttribute } from '../../geometry/bufferattribute'
import { BufferGeometry } from '../../geometry/buffergeometry';
import { GraphicsEvents, GraphicsEvent } from '../../graphics/graphicsevents';
import { LineBasicMaterial } from '../../materials/linebasicmaterial';
import { MATERIAL_COLOR_PER_VERTEX } from '../../materials/material';
import { DEBUG } from '../../buildoptions';
import { GL_LINES } from '../../webgl/constants';

const BASE_COLOR = [1, 1, 1, 1];
const FRUSTRUM_COLOR = [1, 0, 0, 1];
const AXIS_COLOR = [1, 1, 0, 1];
const UP_COLOR = [0, 0, 1, 1];

const tempVec3 = vec3.create();

const Points = [
	//Base Points
	{ p: vec3.fromValues(0, 0, 0), c: BASE_COLOR },
	{ p: vec3.fromValues(0, 0, 0), c: AXIS_COLOR },

	// Base pyramid
	{ p: vec3.fromValues(-1, -1, -1), c: BASE_COLOR },
	{ p: vec3.fromValues(-1, +1, -1), c: BASE_COLOR },
	{ p: vec3.fromValues(+1, -1, -1), c: BASE_COLOR },
	{ p: vec3.fromValues(+1, +1, -1), c: BASE_COLOR },

	// near plane
	{ p: vec3.fromValues(-1, -1, -1), c: FRUSTRUM_COLOR },
	{ p: vec3.fromValues(-1, +1, -1), c: FRUSTRUM_COLOR },
	{ p: vec3.fromValues(+1, -1, -1), c: FRUSTRUM_COLOR },
	{ p: vec3.fromValues(+1, +1, -1), c: FRUSTRUM_COLOR },

	// far plane
	{ p: vec3.fromValues(-1, -1, 1), c: FRUSTRUM_COLOR },
	{ p: vec3.fromValues(-1, +1, 1), c: FRUSTRUM_COLOR },
	{ p: vec3.fromValues(+1, -1, 1), c: FRUSTRUM_COLOR },
	{ p: vec3.fromValues(+1, +1, 1), c: FRUSTRUM_COLOR },

	//Axis line
	{ p: vec3.fromValues(0, 0, 1), c: AXIS_COLOR },

	//Near plane axis
	{ p: vec3.fromValues(-1, 0, -1), c: AXIS_COLOR },
	{ p: vec3.fromValues(+1, 0, -1), c: AXIS_COLOR },
	{ p: vec3.fromValues(0, -1, -1), c: AXIS_COLOR },
	{ p: vec3.fromValues(0, +1, -1), c: AXIS_COLOR },

	//Far plane axis
	{ p: vec3.fromValues(-1, 0, 1), c: AXIS_COLOR },
	{ p: vec3.fromValues(+1, 0, 1), c: AXIS_COLOR },
	{ p: vec3.fromValues(0, -1, 1), c: AXIS_COLOR },
	{ p: vec3.fromValues(0, +1, 1), c: AXIS_COLOR },
]
const Lines = [
	0, 2,
	0, 3,
	0, 4,
	0, 5,

	// near plane
	6, 7,
	6, 8,
	7, 9,
	8, 9,

	6, 10,
	7, 11,
	8, 12,
	9, 13,

	// far plane
	10, 11,
	10, 12,
	11, 13,
	12, 13,

	//center axis
	1, 14,

	//near plane axis
	15, 16,
	17, 18,
	//far plane axis
	19, 20,
	21, 22,

	//near / far plane junction
	/*15, 19,
	16, 20,
	17, 21,
	18, 22,*/
]

export class CameraFrustum extends Mesh {
	#camera;
	#vertexPositionAttribute;
	constructor() {
		super(new BufferGeometry(), new LineBasicMaterial());
		this.renderMode = GL_LINES;
		this.#createVertices();
		this.material.colorMode = MATERIAL_COLOR_PER_VERTEX;
		this.castShadow = false;

		GraphicsEvents.addEventListener(GraphicsEvent.Tick, () => this.update());
	}

	#createVertices() {
		const indices = Lines;
		const vertices = [];
		const colors = [];

		for (let point of Points) {
			vertices.push(...point.p);
			colors.push(...point.c);
		}

		let geometry = this.geometry;
		geometry.setIndex(new Uint16BufferAttribute(indices, 1));
		this.#vertexPositionAttribute = new Float32BufferAttribute(vertices, 3);
		geometry.setAttribute('aVertexPosition', this.#vertexPositionAttribute);
		geometry.setAttribute('aVertexColor', new Uint8BufferAttribute(colors, 4));
		geometry.count = indices.length;
	}

	update() {
		if (this.#camera) {
			let index = 0;
			let verticesArray = this.#vertexPositionAttribute._array;
			for (let point of Points) {
				if (index > 3) {//Skip the base point
					vec3.copy(tempVec3, point.p)
					this.#camera.invertProjection(tempVec3);
					verticesArray.set(tempVec3, index);
				}
				index += 3;
			}

			this.#vertexPositionAttribute.dirty = true;
		}
	}

	parentChanged(parent) {
		if (parent?.is('Camera')) {
			this.#camera = parent;
		} else {
			this.#camera = null;
		}
		this.update();
	}
}
