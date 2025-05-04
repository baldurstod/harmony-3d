import { vec2, vec3 } from 'gl-matrix';

import { Camera, CameraProjection } from '../cameras/camera'
import { Graphics } from '../graphics/graphics';
import { GraphicsEvents } from '../graphics/graphicsevents';
import { ContextObserver } from '../helpers/contextobserver';
import { Plane } from '../primitives/plane';
import { Scene } from '../scenes/scene';
import { RenderTarget } from '../textures/rendertarget';
import { Material } from '../materials/material';
import { Renderer } from '../renderers/renderer';

const DEFAULT_SIZE = 256;

export class RenderTargetViewer {
	#scene = new Scene();
	#camera = new Camera({ projection: CameraProjection.Orthographic, position: [0, 0, 1] });
	#plane = new Plane();
	#renderTarget: RenderTarget;
	#position = vec2.create();
	#size = vec2.fromValues(DEFAULT_SIZE, DEFAULT_SIZE);
	isRenderTargetViewer = true;
	#material?: Material;

	constructor(renderTarget: RenderTarget) {
		ContextObserver.observe(GraphicsEvents, this.#camera);
		ContextObserver.observe(GraphicsEvents, this);
		this.#scene.addChild(this.#plane);

		this.#renderTarget = renderTarget;
		this.refreshPlane();
	}

	/**
	 * @deprecated Please use `setMaterial` instead.
	 */
	set material(material) {
		throw 'deprecated'
	}

	setRenderTarget(renderTarget: RenderTarget) {
		this.#renderTarget = renderTarget;
		this.#plane.material!.setColorMap(renderTarget.getTexture());
	}

	setMaterial(material: Material) {
		this.#material = material;
		this.#plane.setMaterial(material);
		material.setColorMap(this.#renderTarget.getTexture());
	}

	getMaterial() {
		return this.#material;
	}

	/**
	 * @deprecated Please use `getMaterial` instead.
	 */
	get material() {
		throw 'deprecated'
	}

	setPosition(x: number, y: number) {
		vec2.set(this.#position, x, y);
		this.refreshPlane();
	}

	setSize(x: number, y: number) {
		vec2.set(this.#size, x, y);
		this.refreshPlane();
	}

	refreshPlane() {
		vec3.set(this.#plane._position,
			(this.#size[0] - new Graphics().getWidth()) * 0.5 + this.#position[0],
			(new Graphics().getHeight() - this.#size[1]) * 0.5 - this.#position[1],
			0);

		this.#plane.setSize(this.#size[0], this.#size[1]);
	}

	render(renderer: Renderer) {
		renderer.render(this.#scene, this.#camera, 0, { DisableToolRendering: true });
	}

	is(s: string): boolean {
		return s == 'RenderTargetViewer';
	}
}
