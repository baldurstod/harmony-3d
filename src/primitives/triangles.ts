import { vec3 } from 'gl-matrix';
import { TrianglesBufferGeometry } from './geometries/trianglesbuffergeometry';
import { MeshBasicMaterial } from '../materials/meshbasicmaterial';
import { Mesh } from '../objects/mesh';

export class Triangles extends Mesh {
	#triangles?: vec3[][];
	//constructor(triangles, material = ) {
	constructor(params: any = {}) {
		super(params);

		this.#triangles = params.triangles;

		this.setMaterial(params.material ?? new MeshBasicMaterial());
		this.setGeometry(new TrianglesBufferGeometry(params.triangles));
	}

	updateGeometry() {
		(this.geometry as TrianglesBufferGeometry).updateGeometry(this.#triangles);
	}
}
