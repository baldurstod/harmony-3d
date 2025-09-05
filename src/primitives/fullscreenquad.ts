import { Float32BufferAttribute, Uint16BufferAttribute } from '../geometry/bufferattribute'
import { BufferGeometry } from '../geometry/buffergeometry';
import { MeshBasicMaterial } from '../materials/meshbasicmaterial';
import { Mesh, MeshParameters } from '../objects/mesh'

class FullScreenQuadGeometry extends BufferGeometry {
	constructor() {
		super();

		const indices = [0, 2, 1, 2, 3, 1];
		const vertices = [-1.0, 1.0, 0.0, 1.0, 1.0, 0.0, -1.0, -1.0, 0.0, 1.0, -1.0, 0.0];
		const uvs = [0.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0];

		this.setIndex(new Uint16BufferAttribute(indices, 1));
		this.setAttribute('aVertexPosition', new Float32BufferAttribute(vertices, 3));
		this.setAttribute('aVertexNormal', new Float32BufferAttribute(vertices, 3));//TODOv3: fix this
		this.setAttribute('aTextureCoord', new Float32BufferAttribute(uvs, 2));
		this.count = indices.length;
	}
}

export class FullScreenQuad extends Mesh {
	constructor(params: MeshParameters = {}) {
		params.geometry = new FullScreenQuadGeometry();
		params.material = params.material ?? new MeshBasicMaterial();
		super(params);
		this.setDefine('SKIP_PROJECTION');
		super.setParameters(arguments[0]);
	}
}
