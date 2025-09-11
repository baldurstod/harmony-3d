import { vec3 } from 'gl-matrix';
import { GRIDCELL, polygonise, TRIANGLE } from '../../algorithm/marchingcubes';
import { Float32BufferAttribute, Uint16BufferAttribute } from '../../geometry/bufferattribute';
import { BufferGeometry } from '../../geometry/buffergeometry';
import { Metaball } from './../metaball';

const a = vec3.create();
const b = vec3.create();

const THRESHOLD = 0.99;

export class MetaballsBufferGeometry extends BufferGeometry {
	constructor(balls?: Metaball[]) {
		super();
		this.updateGeometry(balls ?? []);
	}

	updateGeometry(balls: Metaball[], cubeWidth = 1) {
		// build geometry
		const triangles = this.#testMarchingCubes(balls, cubeWidth);

		const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];

		let vertexIndex;
		const normal = vec3.create();
		for (let triangleIndex = 0; triangleIndex < triangles.length; ++triangleIndex) {
			vertexIndex = triangleIndex * 3;
			indices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2);

			vertices.push(...triangles[triangleIndex]![0]!);
			vertices.push(...triangles[triangleIndex]![1]!);
			vertices.push(...triangles[triangleIndex]![2]!);


			vec3.sub(a, triangles[triangleIndex]![1]!, triangles[triangleIndex]![0]!);
			vec3.sub(b, triangles[triangleIndex]![2]!, triangles[triangleIndex]![0]!);
			vec3.cross(normal, a, b);
			vec3.normalize(normal, normal);
			normals.push(...normal);
			normals.push(...normal);
			normals.push(...normal);
		}
		// build geometry

		this.setIndex(new Uint16BufferAttribute(indices, 1));
		this.setAttribute('aVertexPosition', new Float32BufferAttribute(vertices, 3));
		this.setAttribute('aVertexNormal', new Float32BufferAttribute(normals, 3));
		//this.setAttribute('aTextureCoord', new Float32BufferAttribute(uvs, 2));
		this.count = indices.length;
	}

	static getBoundingBox(balls: Metaball[]): [vec3, vec3] {
		const min = vec3.fromValues(+Infinity, +Infinity, +Infinity);
		const max = vec3.fromValues(-Infinity, -Infinity, -Infinity);
		for (const ball of balls) {
			vec3.set(b, ball.radius, ball.radius, ball.radius);
			vec3.min(min, min, vec3.sub(a, ball.currentWorldPosition, b));
			vec3.max(max, max, vec3.add(a, ball.currentWorldPosition, b));
		}
		return [min, max];
	}


	static #computeValue(balls: Metaball[], position: vec3) {
		let value = 0;
		const value2 = 0;
		for (const ball of balls) {
			const a = 1 / vec3.squaredDistance(ball.currentWorldPosition, position);
			value += ball.radius2 * a;
		}

		if (value < THRESHOLD) {
			for (const ball of balls) {
				for (const ball2 of balls) {
					const a = 1 / (vec3.squaredDistance(ball.currentWorldPosition, position) + vec3.squaredDistance(ball2.currentWorldPosition, position));
					value += 20 * a;
				}
			}
		}
		return value;
	}

	#testMarchingCubes(balls: Metaball[], cubeWidth: number) {
		const [min, max] = MetaballsBufferGeometry.getBoundingBox(balls);
		for (const ball of balls) {
			ball.getWorldPosition(ball.currentWorldPosition);
		}

		vec3.floor(min, min);
		vec3.ceil(max, max);

		const grid = new GRIDCELL();
		let i, j, k;
		i = j = k = 0;

		const radius = 3;
		const join = 4;
		const join2 = join * join;
		const doSphere2 = 1;

		const isolevel = THRESHOLD;//1 / (radius * radius - 0.01);
		const sphereRadius = 1;
		const triangles = [];
		const center = vec3.fromValues(3, 3, 3);
		const center2 = vec3.fromValues(7, 7, 7);


		for (let i = min[0] - 1; i <= max[0]; i += cubeWidth) {
			for (let j = min[1] - 1; j <= max[1]; j += cubeWidth) {
				for (let k = min[2] - 1; k <= max[2]; k += cubeWidth) {
					const tris: TRIANGLE[] = [];


					grid.p[0][0] = i;
					grid.p[0][1] = j;
					grid.p[0][2] = k;
					grid.val[0] = MetaballsBufferGeometry.#computeValue(balls, grid.p[0]);//1 / vec3.squaredDistance(center, grid.p[0]) + 1 / vec3.squaredDistance(center2, grid.p[0]) * doSphere2;
					grid.p[1][0] = i + cubeWidth;
					grid.p[1][1] = j;
					grid.p[1][2] = k;
					grid.val[1] = MetaballsBufferGeometry.#computeValue(balls, grid.p[1]);//1 / vec3.squaredDistance(center, grid.p[1]) + 1 / vec3.squaredDistance(center2, grid.p[1]) * doSphere2;
					grid.p[2][0] = i + cubeWidth;
					grid.p[2][1] = j + cubeWidth;
					grid.p[2][2] = k;
					grid.val[2] = MetaballsBufferGeometry.#computeValue(balls, grid.p[2]);//1 / vec3.squaredDistance(center, grid.p[2]) + 1 / vec3.squaredDistance(center2, grid.p[2]) * doSphere2;
					grid.p[3][0] = i;
					grid.p[3][1] = j + cubeWidth;
					grid.p[3][2] = k;
					grid.val[3] = MetaballsBufferGeometry.#computeValue(balls, grid.p[3]);//1 / vec3.squaredDistance(center, grid.p[3]) + 1 / vec3.squaredDistance(center2, grid.p[3]) * doSphere2;
					grid.p[4][0] = i;
					grid.p[4][1] = j;
					grid.p[4][2] = k + cubeWidth;
					grid.val[4] = MetaballsBufferGeometry.#computeValue(balls, grid.p[4]);//1 / vec3.squaredDistance(center, grid.p[4]) + 1 / vec3.squaredDistance(center2, grid.p[4]) * doSphere2;
					grid.p[5][0] = i + cubeWidth;
					grid.p[5][1] = j;
					grid.p[5][2] = k + cubeWidth;
					grid.val[5] = MetaballsBufferGeometry.#computeValue(balls, grid.p[5]);//1 / vec3.squaredDistance(center, grid.p[5]) + 1 / vec3.squaredDistance(center2, grid.p[5]) * doSphere2;
					grid.p[6][0] = i + cubeWidth;
					grid.p[6][1] = j + cubeWidth;
					grid.p[6][2] = k + cubeWidth;
					grid.val[6] = MetaballsBufferGeometry.#computeValue(balls, grid.p[6]);//1 / vec3.squaredDistance(center, grid.p[6]) + 1 / vec3.squaredDistance(center2, grid.p[6]) * doSphere2;
					grid.p[7][0] = i;
					grid.p[7][1] = j + cubeWidth;
					grid.p[7][2] = k + cubeWidth;
					grid.val[7] = MetaballsBufferGeometry.#computeValue(balls, grid.p[7]);//1 / vec3.squaredDistance(center, grid.p[7]) + 1 / vec3.squaredDistance(center2, grid.p[7]) * doSphere2;


					polygonise(grid, isolevel, tris);

					triangles.push(...tris);
				}
			}
		}

		const tris = [];
		for (let i = 0; i < triangles.length; ++i) {
			const triangle = [];
			if (triangles[i]!.p[0] && triangles[i]!.p[1] && triangles[i]!.p[2]) {
				triangle.push(triangles[i]!.p[0]);
				triangle.push(triangles[i]!.p[1]);
				triangle.push(triangles[i]!.p[2]);
				tris.push(triangle);
			} else {
				console.error('error');
			}
		}

		return tris;
	}
}
