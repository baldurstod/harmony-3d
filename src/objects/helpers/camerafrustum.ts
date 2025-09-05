import { vec3 } from 'gl-matrix';
import { Float32BufferAttribute, Uint16BufferAttribute, Uint8BufferAttribute } from '../../geometry/bufferattribute';
import { BufferGeometry } from '../../geometry/buffergeometry';
import { GraphicsEvent, GraphicsEvents } from '../../graphics/graphicsevents';
import { LineBasicMaterial } from '../../materials/linebasicmaterial';
import { MaterialColorMode } from '../../materials/material';
import { GL_LINES } from '../../webgl/constants';
import { Mesh, MeshParameters } from '../mesh';

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

	constructor(params: MeshParameters = {}) {
		params.geometry = new BufferGeometry();
		params.material = new LineBasicMaterial();
		super(params);
		this.renderMode = GL_LINES;
		this.#createVertices();
		this.material.setColorMode(MaterialColorMode.PerVertex);
		this.castShadow = false;

		GraphicsEvents.addEventListener(GraphicsEvent.Tick, () => this.update());
	}

	#createVertices() {
		const indices = Lines;
		const vertices = [];
		const colors = [];

		for (const point of Points) {
			vertices.push(...point.p);
			colors.push(...point.c);
		}

		const geometry = this.geometry;
		geometry.setIndex(new Uint16BufferAttribute(indices, 1));
		this.#vertexPositionAttribute = new Float32BufferAttribute(vertices, 3);
		geometry.setAttribute('aVertexPosition', this.#vertexPositionAttribute);
		geometry.setAttribute('aVertexColor', new Uint8BufferAttribute(colors, 4));
		geometry.count = indices.length;
	}

	update() {
		if (this.#camera) {
			let index = 0;
			const verticesArray = this.#vertexPositionAttribute._array;
			for (const point of Points) {
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
