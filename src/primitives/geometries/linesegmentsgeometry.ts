import { Float32BufferAttribute, Uint16BufferAttribute } from '../../geometry/bufferattribute'
import { InstancedBufferGeometry } from '../../geometry/instancedbuffergeometry';

export class LineSegmentsGeometry extends InstancedBufferGeometry {
	constructor() {
		super();
		this.#setupGeometry();
	}

	#setupGeometry() {
		var positions = [- 1, 2, 0, 1, 2, 0, - 1, 1, 0, 1, 1, 0, - 1, 0, 0, 1, 0, 0, - 1, - 1, 0, 1, - 1, 0];
		var uvs = [- 1, 2, 1, 2, - 1, 1, 1, 1, - 1, - 1, 1, - 1, - 1, - 2, 1, - 2];
		var indices = [0, 2, 1, 2, 3, 1, 2, 4, 3, 4, 5, 3, 4, 6, 5, 6, 7, 5];
		// build geometry

		this.setIndex(new Uint16BufferAttribute(indices, 1));
		this.setAttribute('aVertexPosition', new Float32BufferAttribute(positions, 3));
		this.setAttribute('aTextureCoord', new Float32BufferAttribute(uvs, 2));
		this.count = indices.length;
	}

	setSegments(positions, colors?, lineStrip?: boolean) {
		let start = [];
		let end = [];
		let instanceCount = 0;

		let increment = lineStrip ? 3 : 6;
		for (let i = 0, l = positions.length; i < l; i += increment) {
			start.push(positions[i + 0]);
			start.push(positions[i + 1]);
			start.push(positions[i + 2]);

			end.push(positions[i + 3]);
			end.push(positions[i + 4]);
			end.push(positions[i + 5]);
			++instanceCount;
		}

		let startAttribute = new Float32BufferAttribute(start, 3);
		startAttribute.divisor = 1;
		let endAttribute = new Float32BufferAttribute(end, 3);
		endAttribute.divisor = 1;

		this.setAttribute('aSegmentStart', startAttribute);
		this.setAttribute('aSegmentEnd', endAttribute);
		this.instanceCount = instanceCount;
	}



	updateGeometry() {


		/*************************/
		let start = [];
		let end = [];
		let x = Math.random();
		let y = Math.random();
		let z = Math.random();

		for (let i = 0; i < 10 * 3; i += 3) {
			start[i + 0] = x;
			start[i + 1] = y;
			start[i + 2] = z;

			x = Math.random();
			y = Math.random();
			z = Math.random();

			end[i + 0] = x;
			end[i + 1] = y;
			end[i + 2] = z;
		}

		let startAttribute = new Float32BufferAttribute(start, 3);
		startAttribute.divisor = 1;
		let endAttribute = new Float32BufferAttribute(end, 3);
		endAttribute.divisor = 1;

		this.setAttribute('aSegmentStart', startAttribute);
		this.setAttribute('aSegmentEnd', endAttribute);

		/*************************/
	}
}
