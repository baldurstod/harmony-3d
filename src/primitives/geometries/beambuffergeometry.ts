import { quat, vec3, vec4 } from 'gl-matrix';
import { Camera } from '../../cameras/camera';
import { Float32BufferAttribute, Uint16BufferAttribute } from '../../geometry/bufferattribute';
import { BufferGeometry } from '../../geometry/buffergeometry';

const DEFAULT_SEGMENT_COLOR = vec4.fromValues(1.0, 1.0, 1.0, 1.0);

const UNIT_VEC3_MINUS_Y = vec3.fromValues(0, -1, 0);

export class BeamSegment {
	readonly pos = vec3.create();
	readonly normal = vec3.create();
	readonly color = vec4.create();
	texCoordY: number;
	width: number;

	constructor(pos: vec3, color = DEFAULT_SEGMENT_COLOR, texCoordY = 0.0, width = 1.0) {
		vec3.copy(this.pos, pos);
		vec3.copy(this.normal, UNIT_VEC3_MINUS_Y);
		vec4.copy(this.color, color);
		this.texCoordY = texCoordY;
		this.width = width;
	}

	distanceTo(other: BeamSegment) {
		return vec3.distance(this.pos, other.pos);
	}
}

export class BeamBufferGeometry extends BufferGeometry {
	/*
	constructor(segments?) {
		super();

		if (segments) {
			this.segments = segments;
		}
	}
	*/

	setSegments(segments: BeamSegment[], camera: Camera): void {
		let previousSegment = null;

		let indiceBase = 0;
		const indices = [];
		const vertices = []
		const uvs = [];
		const colors = [];

		const cameraPos = camera.getWorldPosition();
		const tangentY = vec3.create();
		const dirToBeam = vec3.create();
		const normal = vec3.create();
		const p = vec3.create();

		for (const segment of segments) {
			if (previousSegment) {
				indices.push(indiceBase, indiceBase + 2, indiceBase + 1, indiceBase + 2, indiceBase + 3, indiceBase + 1);

				vec3.sub(tangentY, segment.pos, previousSegment.pos);
				vec3.sub(dirToBeam, segment.pos, cameraPos);
				vec3.cross(normal, tangentY, dirToBeam);
				vec3.normalize(normal, normal);

				vertices.push(...vec3.scaleAndAdd(p, previousSegment.pos, normal, -previousSegment.width / 2.0));
				vertices.push(...vec3.scaleAndAdd(p, previousSegment.pos, normal, previousSegment.width / 2.0));
				vertices.push(...vec3.scaleAndAdd(p, segment.pos, normal, -segment.width / 2.0));
				vertices.push(...vec3.scaleAndAdd(p, segment.pos, normal, segment.width / 2.0));

				uvs.push(0, previousSegment.texCoordY,
					1, previousSegment.texCoordY,
					0, segment.texCoordY,
					1, segment.texCoordY);

				colors.push(...previousSegment.color, ...previousSegment.color, ...segment.color, ...segment.color);
				indiceBase += 4;
			}
			previousSegment = segment;
		}


		this.setIndex(new Uint16BufferAttribute(indices, 1, 'index'));
		this.setAttribute('aVertexPosition', new Float32BufferAttribute(vertices, 3, 'position'));
		this.setAttribute('aTextureCoord', new Float32BufferAttribute(uvs, 2, 'texCoord'));
		this.setAttribute('aVertexColor', new Float32BufferAttribute(colors, 4, 'color'));
		//this.setAttribute('aVertexWidth', new Float32BufferAttribute(this.widths, 1));
		this.count = indices.length;
	}
}
