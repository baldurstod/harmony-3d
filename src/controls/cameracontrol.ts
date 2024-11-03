import { Camera } from '../cameras/camera';
import { Graphics } from '../graphics/graphics';

export class CameraControl {
	#camera?: Camera;
	#enabled = true;
	#htmlElement?: HTMLElement;
	constructor(camera?: Camera, htmlElement?: HTMLElement) {
		this.#camera = camera;
		this.#htmlElement = htmlElement;
	}

	get htmlElement() {
		return this.#htmlElement;
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

	get camera(): Camera {
		return this.#camera;
	}

	setupCamera() {
	}

	handleEnabled() {
	}
}
