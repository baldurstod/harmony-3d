import { Camera } from '../cameras/camera';
import { FirstPersonControl } from '../controls/firstpersoncontrol';
import { OrbitControl } from '../controls/orbitcontrol';
import { Graphics } from '../graphics/graphics';
import { GraphicsEvents } from '../graphics/graphicsevents';
import { RenderTargetViewer } from '../utils/rendertargetviewer';

function resizeCamera(context: Graphics, camera: Camera) {
	const w = Graphics.getWidth() / 2.0;
	const h = Graphics.getHeight() / 2.0;

	camera.left = -w;
	camera.right = w;
	camera.bottom = -h;
	camera.top = h;
	camera.aspectRatio = w / h;
}

export type ContextObserverTarget = Camera | FirstPersonControl | OrbitControl | RenderTargetViewer;

export type ContextObserverSubject = EventTarget | typeof GraphicsEvents;

class ContextObserverClass {//TODO: create static class
	#observed = new Map<ContextObserverSubject, Set<ContextObserverTarget>>();
	#listeners = new Map<ContextObserverSubject, Set<string>>();
	static #instance: ContextObserverClass;

	constructor() {
		if (ContextObserverClass.#instance) {
			return ContextObserverClass.#instance;
		}
	}

	handleEvent(event: Event): void {
		const subject = event.target;
		if (!subject) {
			return;
		}
		const dependents = this.#observed.get(subject);
		if (dependents) {
			for (const dependent of dependents) {
				ContextObserverClass.#processEvent(subject, dependent, event);
			}
		}
	}

	static #processEvent(subject: ContextObserverSubject, dependent: ContextObserverTarget, event: Event) {
		switch (true) {
			case (dependent as Camera).is('Camera'):
				resizeCamera(Graphics, dependent as Camera);
				break;
			case dependent instanceof FirstPersonControl://TODO do it for any CameraControl?
			case dependent instanceof OrbitControl:
				dependent.update();
				break;
			case (dependent as RenderTargetViewer).isRenderTargetViewer:
				(dependent as RenderTargetViewer).refreshPlane();
				break;
			default:
		}
	}

	#addObserver(subject: ContextObserverSubject, dependent: ContextObserverTarget) {
		if ((subject as typeof GraphicsEvents).isGraphicsEvents) {
			subject = (subject as typeof GraphicsEvents).eventTarget;
		}

		if (!this.#observed.has(subject)) {
			this.#observed.set(subject, new Set());
		}

		this.#createListeners(subject, dependent);
		this.#observed.get(subject)?.add(dependent);
	}

	#removeObserver(subject: ContextObserverSubject, dependent: ContextObserverTarget) {
		if (this.#observed.has(subject)) {
			this.#observed.get(subject)?.delete(dependent);
			this.#removeListeners(subject, dependent);
		}

	}

	#createListeners(subject: ContextObserverSubject, dependent: ContextObserverTarget) {
		switch (true) {
			case (dependent as Camera).is('Camera'):
			case dependent instanceof FirstPersonControl://TODO do it for any CameraControl?
			case dependent instanceof OrbitControl:
			case (dependent as RenderTargetViewer).isRenderTargetViewer:
				//subject.addEventListener('resize', this);
				this.#addListener(subject, 'resize');
				break;
			default:
		}
	}

	#removeListeners(subject: ContextObserverSubject, dependent: ContextObserverTarget): void {
		const size = this.#observed.get(subject)?.size ?? 0;
		if (size == 0) {
			const types = this.#listeners.get(subject);
			if (!types) {
				return;
			}
			for (const type of types) {
				//console.log(listener);
				this.#removeListener(subject, type);
			}
		}
	}

	#addListener(target: ContextObserverSubject, type: string) {
		if (!this.#listeners.has(target)) {
			this.#listeners.set(target, new Set());
		}

		const targetSet = this.#listeners.get(target);

		if (targetSet && !targetSet.has(type)) {
			targetSet.add(type);
			target.addEventListener(type, this);
		}
	}

	#removeListener(target: ContextObserverSubject, type: string) {
		const targetSet = this.#listeners.get(target);

		if (targetSet && targetSet.has(type)) {
			targetSet.delete(type);
			target.removeEventListener(type, this);
		}
	}

	observe(subject: ContextObserverSubject, dependent: ContextObserverTarget) {
		this.#addObserver(subject, dependent);

		switch (true) {
			case (dependent as Camera).is('Camera'):
				resizeCamera(Graphics, (dependent as Camera));
				break;
		}
	}

	unobserve(subject: ContextObserverSubject, dependent: ContextObserverTarget) {
		this.#removeObserver(subject, dependent);
	}
}

export const ContextObserver = new ContextObserverClass();
