import { Mesh } from '../mesh';
import { Entity } from '../../entities/entity';
import { Uint16BufferAttribute, Uint32BufferAttribute } from '../../geometry/bufferattribute';
import { GL_LINES, GL_UNSIGNED_INT, GL_ELEMENT_ARRAY_BUFFER } from '../../webgl/constants';

export class WireframeHelper extends Entity {
	#meshToWireframe = new Map();
	#wireframeToMesh = new Map();
	constructor() {
		super();
	}

	parentChanged(parent) {
		if (parent instanceof Entity) {
			let meshes = parent.getChildList('Mesh');
			for (let mesh of meshes) {
				if ((mesh as Mesh).renderMode !== GL_LINES) {//TODO: improve wireframe detection
					let wireframeGeometry = (mesh as Mesh).geometry.clone();
					let wireframeMesh = new Mesh(wireframeGeometry, (mesh as Mesh).material);
					wireframeMesh.renderMode = GL_LINES;
					this.#meshToWireframe.set(mesh, wireframeMesh)
					this.#wireframeToMesh.set(wireframeMesh, mesh);

					WireframeHelper.updateWireframeIndex(wireframeGeometry);

					mesh.addChild(wireframeMesh);
				}
			}
		}
	}

	setVisible(visible) {
		super.setVisible(visible);
		for (const [w, m] of this.#wireframeToMesh) {
			w.setVisible(visible);
		}
	}

	static updateWireframeIndex(geometry) {
		let attribute = geometry.attributes.get('index');
		if (attribute) {
			let indexArray = attribute._array;
			let wireframeArray;
			let arraySize = indexArray.length * 2;
			let wireframeAttribute = (geometry.elementArrayType == GL_UNSIGNED_INT) ? new Uint32BufferAttribute(new Array(arraySize), 1) : new Uint16BufferAttribute(new Array(arraySize), 1);

			wireframeAttribute.target = GL_ELEMENT_ARRAY_BUFFER;
			geometry.setAttribute('index', wireframeAttribute);
			geometry.count = arraySize;
			wireframeArray = wireframeAttribute._array;

			for (let i = 0, j = 0, l = indexArray.length; i < l; i += 3, j += 6) {
				let i1 = indexArray[i];
				let i2 = indexArray[i + 1];
				let i3 = indexArray[i + 2];

				wireframeArray[j + 0] = i1;
				wireframeArray[j + 1] = i2;
				wireframeArray[j + 2] = i2;
				wireframeArray[j + 3] = i3;
				wireframeArray[j + 4] = i3;
				wireframeArray[j + 5] = i1;
			}

			wireframeAttribute.dirty = true;
		}
	}

	get entityName() {
		return this.getEntityName();
	}

	getEntityName() {
		return 'Wireframe helper';
	}
}
