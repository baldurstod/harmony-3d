import { Mesh } from '../../objects/mesh';
import { Float32BufferAttribute, Uint16BufferAttribute } from '../../geometry/bufferattribute'
import { BufferGeometry } from '../../geometry/buffergeometry';
import { LineBasicMaterial } from '../../materials/linebasicmaterial';
import { MaterialColorMode } from '../../materials/material';
import { Sphere } from '../../primitives/sphere';
import { PI, TWO_PI } from '../../math/constants';

import { GL_LINES } from '../../webgl/constants';

const SPHERE_RADIUS = 1;
const RAYS_RADIUS = 3;

export class PointLightHelper extends Mesh {
	constructor() {
		super(new BufferGeometry(), new LineBasicMaterial());
		this.renderMode = GL_LINES;
		this.#createVertices();
		this.material.setColorMode(MaterialColorMode.PerMesh);
		this.material.setDefine('ALWAYS_ON_TOP');
		let sphere = new Sphere({ radius: SPHERE_RADIUS, segments: 12, rings: 12 });
		sphere.material.setDefine('ALWAYS_ON_TOP');
		this.addChild(sphere);
	}

	#createVertices() {
		const indices = [];
		const vertices = [];

		vertices.push(0, 0, 0);

		let iInc = PI / 4;
		let jInc = PI / 4;
		let k = 0;
		for (let i = 0; i < TWO_PI; i += iInc) {
			for (let j = 0; j < PI; j += jInc) {
				vertices.push(
					RAYS_RADIUS * Math.cos(i) * Math.sin(j),
					RAYS_RADIUS * Math.cos(j),
					RAYS_RADIUS * Math.sin(i) * Math.sin(j),
				);
				indices.push(0, ++k);
			}
		}

		let geometry = this.geometry;
		geometry.setIndex(new Uint16BufferAttribute(indices, 1));
		geometry.setAttribute('aVertexPosition', new Float32BufferAttribute(vertices, 3));
		geometry.count = indices.length;
	}
}
