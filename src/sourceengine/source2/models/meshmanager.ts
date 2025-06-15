import { Source2FileLoader } from '../loaders/source2fileloader';
/**
 * Mesh manager
 */
export const MeshManager = new function() {
	const meshList = {};
	//this.renderMode = 2;

	//TODO
	const getMesh = async function(repository, meshName) {
		meshName = meshName.toLowerCase();
		meshName = meshName.replace(/.vmesh_c$/, '');
		meshName = meshName.replace(/.vmesh$/, '');
		let mesh = meshList[meshName];
		if (!mesh) {
			mesh = await new Source2FileLoader().load(repository, meshName + '.vmesh_c');
		}
		if (mesh) {
			meshList[meshName] = mesh;
		} else {
			//TODO; create a dummy mesh
			console.error('No mesh loaded');
		}
		return mesh;
	}

	//TODO
	const removeMesh = function(meshName) {
		meshList[meshName] = null;
	}

	this.getMesh = getMesh;
	this.removeMesh = removeMesh;
}
