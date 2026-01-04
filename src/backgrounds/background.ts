import { Camera } from '../cameras/camera';
import { InternalRenderContext } from '../interfaces/rendercontext';
import { Renderer } from '../renderers/renderer';

export type BackGroundIssue = {
	clearColor: boolean;
	clearValue?: GPUColorDict;
};

export class BackGround {
	render(renderer: Renderer, camera: Camera, context: InternalRenderContext): BackGroundIssue {
		return { clearColor: false };
	}

	dispose() {
	}

	is(s: string): boolean {
		return s == 'BackGround';
	}
}
