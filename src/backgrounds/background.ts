import { Camera } from '../cameras/camera';
import { InternalRenderContext } from '../interfaces/rendercontext';
import { Renderer } from '../renderers/renderer';

export type BackGroundResult = {
	clearColor: boolean;
	clearValue?: GPUColorDict;
};

export class BackGround {
	render(renderer: Renderer, camera: Camera, context: InternalRenderContext): BackGroundResult {
		return { clearColor: false };
	}

	dispose(): void { }

	is(s: string): boolean {
		return s == 'BackGround';
	}
}
