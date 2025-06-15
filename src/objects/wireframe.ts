import { vec4 } from 'gl-matrix';
import { Entity } from '../entities/entity';
import { LineSegmentsGeometry } from '../primitives/geometries/linesegmentsgeometry';
import { Mesh } from './mesh';
import { LineMaterial } from '../materials/linematerial';
import { Material, MaterialColorMode } from '../materials/material';

export class Wireframe extends Entity {
	#material: Material = new LineMaterial({ polygonOffset: true, lineWidth: 3 });
	#color: vec4 = vec4.fromValues(0, 0, 0, 1);
	enumerable = false;
	#meshes = new Set<Mesh>();
	constructor(params?: any) {
		super(params);
		//const material = new LineMaterial({ polygonOffset: true, lineWidth: 3 });

		//this.#material = material;

		this.#material.setColorMode(MaterialColorMode.PerMesh);
		this.#material.color = vec4.fromValues(0.0, 0.0, 0.0, 1.0);
		this.#material.addUser(this);

		//this.setParameters(params);
	}

	setColor(color: vec4) {
		vec4.copy(this.#color, color);
		this.#material.setMeshColor(color);
	}

	parentChanged(parent: Entity | null) {
		if (parent) {
			this.#updateGeometry(parent);
		}
	}

	#updateGeometry(parent: Entity) {
		this.#disposeMeshes();
		const meshes = parent.getChildList('Mesh');

		for (const mesh of meshes) {
			if (mesh == this || !mesh.isVisible()) {
				continue;
			}

			const segments: number[] = [];
			const line = new LineSegmentsGeometry();
			line.addUser(this);
			const me = new Mesh(line, this.#material);
			this.#meshes.add(me);
			this.addChild(me);

			const m = (mesh as unknown as Mesh).exportObj();

			const vertexIndices = m.f;
			const vertexPos = m.v;

			for (let i = 0, l = vertexIndices.length; i < l; i += 3) {
				const vertexIndex1 = vertexIndices[i + 0] * 3;
				const vertexIndex2 = vertexIndices[i + 1] * 3;
				const vertexIndex3 = vertexIndices[i + 2] * 3;

				segments.push(vertexPos[vertexIndex1], vertexPos[vertexIndex1 + 1], vertexPos[vertexIndex1 + 2]);
				segments.push(vertexPos[vertexIndex2], vertexPos[vertexIndex2 + 1], vertexPos[vertexIndex2 + 2]);

				segments.push(vertexPos[vertexIndex2], vertexPos[vertexIndex2 + 1], vertexPos[vertexIndex2 + 2]);
				segments.push(vertexPos[vertexIndex3], vertexPos[vertexIndex3 + 1], vertexPos[vertexIndex3 + 2]);

				segments.push(vertexPos[vertexIndex3], vertexPos[vertexIndex3 + 1], vertexPos[vertexIndex3 + 2]);
				segments.push(vertexPos[vertexIndex1], vertexPos[vertexIndex1 + 1], vertexPos[vertexIndex1 + 2]);
			}
			line.setSegments(segments);
		}
	}

	#disposeMeshes() {
		for (const mesh of this.#meshes) {
			mesh.dispose();
		}
		this.#meshes.clear();
	}

	dispose() {
		super.dispose();
		this.#material.removeUser(this);
		this.#disposeMeshes();
	}

	is(s: string): boolean {
		return s == 'Wireframe';
	}

	static getEntityName() {
		return 'Wireframe';
	}
}
