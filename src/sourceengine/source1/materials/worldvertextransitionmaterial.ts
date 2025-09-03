import { DynamicParams } from '../../../entities/entity';
import { Source1VmtLoader } from '../loaders/source1vmtloader';
import { Source1Material, TextureRole } from './source1material';

export class WorldVertexTransitionMaterial extends Source1Material {
	#initialized = false;

	init(): void {
		if (this.#initialized) {
			return;
		}
		this.#initialized = true;
		super.init();
	}

	afterProcessProxies(proxyParams: DynamicParams) {
		const variables = this.variables;
		const parameters = this.vmt;

		const baseTexture2 = this.variables.get('$basetexture2');
		this.setColor2Map(baseTexture2 ? this.getTexture(TextureRole.Color2, this.repository, baseTexture2, 0, true) : null);

		const blendModulateTexture = this.variables.get('$blendmodulatetexture');
		if (blendModulateTexture) {
			this.setTexture('blendModulateMap', this.getTexture(TextureRole.BlendModulate, this.repository, blendModulateTexture, 0, true), 'USE_BLEND_MODULATE_MAP');
		}
	}

	clone() {
		return new WorldVertexTransitionMaterial(this.repository, this.path, this.vmt, this.parameters);
	}

	getShaderSource() {
		return 'source1_worldvertextransition';
	}
}
Source1VmtLoader.registerMaterial('worldvertextransition', WorldVertexTransitionMaterial);
