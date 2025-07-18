import { SourceEngineVMTLoader } from '../loaders/sourceenginevmtloader';
import { SourceEngineMaterial, TextureRole } from './sourceenginematerial';

export class WorldVertexTransitionMaterial extends SourceEngineMaterial {
	#initialized = false;

	init(): void {
		if (this.#initialized) {
			return;
		}
		const params = this.parameters;
		this.#initialized = true;
		super.init();
	}

	afterProcessProxies(proxyParams) {
		const variables = this.variables;
		const parameters = this.parameters;

		const baseTexture2 = this.variables.get('$basetexture2');
		this.setColor2Map(baseTexture2 ? this.getTexture(TextureRole.Color2, this.repository, baseTexture2, 0, true) : null);

		const blendModulateTexture = this.variables.get('$blendmodulatetexture');
		if (blendModulateTexture) {
			this.setTexture('blendModulateMap', this.getTexture(TextureRole.BlendModulate, this.repository, blendModulateTexture, 0, true), 'USE_BLEND_MODULATE_MAP');
		}
	}

	clone() {
		return new WorldVertexTransitionMaterial(this.parameters);
	}

	getShaderSource() {
		return 'source1_worldvertextransition';
	}
}
SourceEngineVMTLoader.registerMaterial('worldvertextransition', WorldVertexTransitionMaterial);
