import { RemapValClamped } from '../../../math/functions';

export class FlexController {
	controllers: Record<string, { i: number, min: number, max: number }> = {};
	controllers2 = {};
	controllerIndex = 0;

	getController(name, min, max) {
		if (!this.controllers[name]) {
			this.controllers2[this.controllerIndex] = 0;
			this.controllers[name] = { i: this.controllerIndex++, min: min, max: max };
			/*
			if (typeof AddController !== 'undefined') {
				AddController(name, min, max);
			}
				*/
			this.setControllerValue(name, 0);
		}
		return this.controllers[name].i;
	}

	getControllers() {
		return this.controllers;
	}

	getControllerValue(name) {
		const index = this.controllers[name].i;
		if (index !== undefined) {
			return this.controllers2[index]
		}
		return 0;
	}

	getControllerRealValue(name) {
		const controller = this.controllers[name];
		if (controller !== undefined) {
			const index = this.controllers[name].i;
			return RemapValClamped(this.controllers2[index], 0.0, 1.0, controller.min, controller.max);
		}
		return 0;
	}

	setControllerValue(name, value) {
		const controller = this.controllers[name];
		if (controller !== undefined) {
			value = RemapValClamped(value, controller.min, controller.max, 0.0, 1.0);
			this.controllers2[controller.i] = value;
		}
	}

	setAllValues(value) {
		for (const i in this.controllers) {
			this.setControllerValue(i, value);
		}
	}

	removeAllControllers() {
		this.controllers = {};
		this.controllers2 = {};
		this.controllerIndex = 0;
	}
}
