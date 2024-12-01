import { SourceEngineMaterial } from './sourceenginematerial';
import { SourceEngineVMTLoader } from '../loaders/sourceenginevmtloader';
import { Source1TextureManager } from '../textures/source1texturemanager';

export class WorldVertexTransitionMaterial extends SourceEngineMaterial {
	constructor(repository, fileName, parameters = Object.create(null)) {//fixme
		super(repository, fileName, parameters);
	}

	afterProcessProxies(proxyParams) {
		let variables = this.variables;
		let parameters = this.parameters;

		let baseTexture2 = this.variables.get('$basetexture2');
		this.setColor2Map(baseTexture2 ? Source1TextureManager.getTexture(this.repository, baseTexture2, 0, true) : null);

		let blendModulateTexture = this.variables.get('$blendmodulatetexture');
		if (blendModulateTexture) {
			this.setTexture('blendModulateMap', Source1TextureManager.getTexture(this.repository, blendModulateTexture, 0, true), 'USE_BLEND_MODULATE_MAP');
		}
	}

	clone() {
		return new WorldVertexTransitionMaterial(this.repository, this.fileName, this.parameters);
	}

	getShaderSource() {
		return 'source1_worldvertextransition';
	}
}
SourceEngineVMTLoader.registerMaterial('worldvertextransition', WorldVertexTransitionMaterial);
