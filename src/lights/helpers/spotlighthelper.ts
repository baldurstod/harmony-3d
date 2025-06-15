import { vec3, vec4 } from 'gl-matrix';

import { GraphicsEvents, GraphicsEvent } from '../../graphics/graphicsevents';
import { Mesh } from '../../objects/mesh';
import { Float32BufferAttribute, Uint16BufferAttribute } from '../../geometry/bufferattribute'
import { BufferGeometry } from '../../geometry/buffergeometry';
import { LineBasicMaterial } from '../../materials/linebasicmaterial';
import { SpotLight } from '../spotlight';
import { TWO_PI } from '../../math/constants';
import { GL_LINES } from '../../webgl/constants';
import { Entity } from '../../entities/entity';

const DIVISIONS = 32;
const tempVec4: vec4 = vec4.create();

export class SpotLightHelper extends Mesh {
	#color = vec3.create();
	#angle;
	#range;
	#spotLight: SpotLight;
	#vertexPositionAttribute;
	constructor() {
		super(new BufferGeometry(), new LineBasicMaterial());
		this.renderMode = GL_LINES;
		this.#createVertices();
		this.material.setMeshColor();
		this.material.setDefine('ALWAYS_ON_TOP');
		this.castShadow = false;
		GraphicsEvents.addEventListener(GraphicsEvent.Tick, event => this.update());
	}

	#createVertices() {
		const indices = [];
		const vertices = [];

		vertices.push(0, 0, 0);

		let k = 1;
		for (let i = 0; i < DIVISIONS; i += 1) {
			vertices.push(0, 0, 0);
			indices.push(0, k);
			if (k < DIVISIONS) {
				//segement til next point
				indices.push(k, ++k);
			}
		}
		//close loop
		indices.push(k, 1);

		const geometry = this.geometry;
		geometry.setIndex(new Uint16BufferAttribute(indices, 1));
		this.#vertexPositionAttribute = new Float32BufferAttribute(vertices, 3);
		geometry.setAttribute('aVertexPosition', this.#vertexPositionAttribute);
		geometry.count = indices.length;
	}


	update() {
		const spotLight = this.#spotLight;
		if (spotLight && ((this.#range != spotLight.range) || (this.#angle != spotLight.angle) || (!vec3.exactEquals(spotLight.color, this.#color)))) {
			vec3.copy(this.#color, spotLight.color);
			vec4.set(tempVec4, this.#color[0], this.#color[1], this.#color[2], 1.);
			this.material.setMeshColor(tempVec4);
			const range = spotLight.range || 1000.0;
			const radius = Math.sin(spotLight.angle) * range;
			this.#range = spotLight.range;
			this.#angle = spotLight.angle;
			const verticesArray = this.#vertexPositionAttribute._array;

			for (let i = 0; i < DIVISIONS; i += 1) {
				const angle = i * TWO_PI / DIVISIONS;
				const index = (i + 1) * 3;
				verticesArray[index + 0] = Math.cos(angle) * radius;
				verticesArray[index + 1] = Math.sin(angle) * radius;
				verticesArray[index + 2] = -range;
				const sub = verticesArray.subarray(index, index + 2);
			}
			this.#vertexPositionAttribute.dirty = true;
		}
	}

	parentChanged(parent: Entity | null = null) {
		if (parent instanceof SpotLight) {
			this.#spotLight = parent;
		} else {
			this.#spotLight = null;
		}
		this.update();
	}
}
