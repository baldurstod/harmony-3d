import { Entity } from '../../entities/entity';
import { Uint16BufferAttribute, Uint32BufferAttribute } from '../../geometry/bufferattribute';
import { BufferGeometry } from '../../geometry/buffergeometry';
import { GL_ELEMENT_ARRAY_BUFFER, GL_LINES, GL_UNSIGNED_INT } from '../../webgl/constants';
import { Mesh } from '../mesh';

export class WireframeHelper extends Entity {
	#meshToWireframe = new Map<Entity, Mesh>();
	#wireframeToMesh = new Map<Mesh, Entity>();

	parentChanged(parent: Entity) {
		const meshes = parent.getChildList('Mesh');
		for (const mesh of meshes) {
			if ((mesh as Mesh).renderMode !== GL_LINES) {//TODO: improve wireframe detection
				const wireframeGeometry = (mesh as Mesh).getGeometry().clone();
				const wireframeMesh = new Mesh({ geometry: wireframeGeometry, material: (mesh as Mesh).getMaterial() });
				wireframeMesh.renderMode = GL_LINES;
				this.#meshToWireframe.set(mesh, wireframeMesh)
				this.#wireframeToMesh.set(wireframeMesh, mesh);

				WireframeHelper.#updateWireframeIndex(wireframeGeometry);

				mesh.addChild(wireframeMesh);
			}
		}
	}

	setVisible(visible: boolean) {
		super.setVisible(visible);
		for (const [w, m] of this.#wireframeToMesh) {
			w.setVisible(visible);
		}
	}

	static #updateWireframeIndex(geometry: BufferGeometry): void {
		const attribute = geometry.attributes.get('index');
		if (!attribute) {
			return;
		}
		const indexArray = attribute._array;
		if (!indexArray) {
			return;
		}
		let wireframeArray;
		const arraySize = indexArray.length * 2;
		const wireframeAttribute = (geometry.elementArrayType == GL_UNSIGNED_INT) ? new Uint32BufferAttribute(new Array(arraySize), 1, 'index') : new Uint16BufferAttribute(new Array(arraySize), 1, 'index');

		wireframeAttribute.target = GL_ELEMENT_ARRAY_BUFFER;
		geometry.setIndex(wireframeAttribute);
		geometry.count = arraySize;
		wireframeArray = wireframeAttribute._array;
		if (!wireframeArray) {
			return;
		}

		for (let i = 0, j = 0, l = indexArray.length; i < l; i += 3, j += 6) {
			const i1 = indexArray[i]!;
			const i2 = indexArray[i + 1]!;
			const i3 = indexArray[i + 2]!;

			wireframeArray[j + 0] = i1;
			wireframeArray[j + 1] = i2;
			wireframeArray[j + 2] = i2;
			wireframeArray[j + 3] = i3;
			wireframeArray[j + 4] = i3;
			wireframeArray[j + 5] = i1;
		}

		wireframeAttribute.dirty = true;
	}


	static getEntityName() {
		return 'Wireframe helper';
	}
}
