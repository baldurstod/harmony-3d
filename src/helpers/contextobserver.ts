import { FirstPersonControl } from '../controls/firstpersoncontrol'
import { OrbitControl } from '../controls/orbitcontrol'
import { Graphics } from '../graphics/graphics'

function resizeCamera(context, camera) {
	const w = context.getWidth() / 2.0;
	const h = context.getHeight() / 2.0;

	camera.left = -w;
	camera.right = w;
	camera.bottom = -h;
	camera.top = h;
	camera.aspectRatio = w / h;
}


class ContextObserverClass {
	#observed = new Map();
	#listeners = new Map();
	static #instance: ContextObserverClass;
	constructor() {
		if (ContextObserverClass.#instance) {
			return ContextObserverClass.#instance;
		}
	}

	handleEvent(event) {
		const subject = event.target;
		const dependents = this.#observed.get(subject);
		if (dependents) {
			for (const dependent of dependents) {
				ContextObserverClass.#processEvent(subject, dependent, event);
			}
		}
	}

	static #processEvent(subject, dependent, event) {
		switch (true) {
			case dependent.is('Camera'):
				resizeCamera(new Graphics(), dependent);
				break;
			case dependent instanceof FirstPersonControl://TODO do it for any CameraControl?
			case dependent instanceof OrbitControl:
				dependent.update();
				break;
			case dependent.isRenderTargetViewer:
				dependent.refreshPlane();
				break;
			default:
		}
	}

	#addObserver(subject, dependent) {
		if (!this.#observed.has(subject)) {
			this.#observed.set(subject, new Set());
		}

		this.#createListeners(subject, dependent);
		this.#observed.get(subject).add(dependent);
	}

	#removeObserver(subject, dependent) {
		if (this.#observed.has(subject)) {
			this.#observed.get(subject).delete(dependent);
			this.#removeListeners(subject, dependent);
		}

	}

	#createListeners(subject, dependent) {
		switch (true) {
			case dependent.is('Camera'):
			case dependent instanceof FirstPersonControl://TODO do it for any CameraControl?
			case dependent instanceof OrbitControl:
			case dependent.isRenderTargetViewer:
				//subject.addEventListener('resize', this);
				this.#addListener(subject, 'resize');
				break;
			default:
		}
	}

	#removeListeners(subject, dependent) {
		const size = this.#observed.get(subject).size;
		if (size == 0) {
			const types = this.#listeners.get(subject);
			for (const type of types) {
				//console.log(listener);
				this.#removeListener(subject, type);
			}
		}
	}

	#addListener(target, type) {
		if (!this.#listeners.has(target)) {
			this.#listeners.set(target, new Set());
		}

		const targetSet = this.#listeners.get(target);

		if (!targetSet.has(type)) {
			targetSet.add(type);
			target.addEventListener(type, this);
		}
	}

	#removeListener(target, type) {
		const targetSet = this.#listeners.get(target);

		if (targetSet && targetSet.has(type)) {
			targetSet.delete(type);
			target.removeEventListener(type, this);
		}
	}

	observe(subject, dependent) {
		this.#addObserver(subject, dependent);

		switch (true) {
			case dependent.is('Camera'):
				resizeCamera(new Graphics(), dependent);
				break;
		}
	}

	unobserve(subject, dependent) {
		this.#removeObserver(subject, dependent);
	}
}

export const ContextObserver = new ContextObserverClass();
