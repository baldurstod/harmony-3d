import { Camera } from '../cameras/camera';
import { Graphics } from '../graphics/graphics';

export class CameraControl {
	#camera?: Camera;
	#enabled = true;
	constructor(camera?: Camera) {
		this.#camera = camera;
	}

	set enabled(enabled: boolean) {
		this.#enabled = enabled;
		this.handleEnabled();
	}

	get enabled(): boolean {
		return this.#enabled && !Graphics.dragging;
	}

	set camera(camera: Camera) {
		this.#camera = camera;
		this.setupCamera();
	}

	get camera(): Camera | undefined {
		return this.#camera;
	}

	setupCamera() {
	}

	handleEnabled() {
	}

	update(delta: number) {
	}
}
