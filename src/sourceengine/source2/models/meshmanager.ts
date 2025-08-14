import { Source2File } from '../loaders/source2file';
import { Source2FileLoader } from '../loaders/source2fileloader';
/**
 * Mesh manager
 */
export class MeshManager {// TODO: remove this class ?  meshes seems not used anymore in source2
	static meshList:Record<string, Source2File> = {};//TODO: create map
	//this.renderMode = 2;

	static async getMesh(repository: string, meshName: string): Promise<Source2File> {
		meshName = meshName.toLowerCase();
		meshName = meshName.replace(/\.vmesh_c$/, '');
		meshName = meshName.replace(/\.vmesh$/, '');
		let mesh = this.meshList[meshName];
		if (!mesh) {
			mesh = await new Source2FileLoader().load(repository, meshName + '.vmesh_c') as Source2File;
		}
		if (mesh) {
			this.meshList[meshName] = mesh;
		} else {
			//TODO; create a dummy mesh
			console.error('No mesh loaded');
		}
		return mesh;
	}

	static removeMesh(meshName: string): void {
		delete this.meshList[meshName];
	}
}
