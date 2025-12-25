import { vec3 } from 'gl-matrix';
import { Camera } from '../../cameras/camera';
import { Entity } from '../../entities/entity';
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
	#camera: Camera | null = null;
	#vertexPositionAttribute!: Float32BufferAttribute;

	constructor(params: MeshParameters = {}) {
		params.geometry = new BufferGeometry();
		params.material = new LineBasicMaterial();
		super(params);
		this.renderMode = GL_LINES;
		this.#createVertices();
		this.getMaterial().setColorMode(MaterialColorMode.PerVertex);
		this.castShadow = false;

		GraphicsEvents.addEventListener(GraphicsEvent.Tick, () => this.update());
	}

	#createVertices() {
		const indices = Lines;
		const vertices: number[] = [];
		const normals: number[] = [];
		const texCoords: number[] = [];
		const colors:number[] = [];

		for (const point of Points) {
			vertices.push(...point.p);
			normals.push(1, 0, 0);
			texCoords.push(1, 0, 0);
			colors.push(...point.c);
		}

		const geometry = this.getGeometry();
		geometry.setIndex(new Uint16BufferAttribute(indices, 1, 'index'));
		this.#vertexPositionAttribute = new Float32BufferAttribute(vertices, 3, 'position');
		geometry.setAttribute('aVertexPosition', this.#vertexPositionAttribute);
		geometry.setAttribute('aVertexNormal', new Float32BufferAttribute(normals, 3, 'normal'));
		geometry.setAttribute('aTextureCoord', new Float32BufferAttribute(texCoords, 2, 'texCoord'));
		geometry.setAttribute('aVertexColor', new Float32BufferAttribute(colors, 4, 'color'));
		geometry.count = indices.length;
	}

	update(): void {
		if (!this.#camera) {
			return;
		}
		let index = 0;
		const verticesArray = this.#vertexPositionAttribute._array;
		if (!verticesArray) {
			return;
		}
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

	parentChanged(parent: Entity) {
		if (parent?.is('Camera')) {
			this.#camera = parent as Camera;
		} else {
			this.#camera = null;
		}
		this.update();
	}
}
