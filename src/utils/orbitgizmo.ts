import { mat3, quat, vec3 } from 'gl-matrix';
import { createElement, createElementNS, createShadowRoot, svgNamespace } from 'harmony-ui';
import { OrbitControl } from '../controls/orbitcontrol';
import orbitGizmoCSS from '../css/orbitgizmo.css';
import { GraphicsEvent, GraphicsEvents } from '../graphics/graphicsevents';

const axis = ['X', '-X', 'Y', '-Y', 'Z', '-Z',];
//const classes = ['right', 'left', 'back', 'front', 'top', 'bottom'];
const classes = ['x', 'y', 'z'];
const positions = [
	[1, 0, 0],
	[-1, 0, 0],
	[0, 1, 0],
	[0, -1, 0],
	[0, 0, 1],
	[0, 0, -1],

];

export class OrbitGizmo {
	#shadowRoot: ShadowRoot;
	#htmlGizmo: HTMLElement;
	#htmlAxis: SVGElement;
	#htmlAxisLabel: HTMLElement[] = [];
	orbitControl?: OrbitControl;

	constructor() {
		this.#shadowRoot = createShadowRoot('div', {
			adoptStyle: orbitGizmoCSS,
			child: this.#htmlGizmo = createElement('div', {
				class: 'gizmo',
				childs: [
					this.#htmlAxis = createElementNS(svgNamespace, 'svg', {
						//hidden: true,
					}) as SVGElement,
					this.#htmlAxisLabel[0] = createElement('div'),
				],
			}),
		});

		for (let i = 0; i < 6; ++i) {
			this.#htmlAxisLabel[i] = createElement('div', {
				class: `label ${i % 2 === 0 ? 'plus' : 'minus'} ${classes[Math.floor(i / 2)]}`,
				innerText: axis[i],
				parent: this.#htmlGizmo,
				$click: () => this.#handleAxisClick(i),
			});
		}

		GraphicsEvents.addEventListener(GraphicsEvent.Tick, () => this.#update());
	}

	#update(): void {
		const camera = this.orbitControl?.camera;
		if (!camera) {
			return;
		}

		const scale = 0.4;
		this.#htmlAxis.replaceChildren();

		const mat = camera.cameraMatrix;
		const m3 = mat3.fromMat4(mat3.create(), mat);
		const q = quat.fromMat3(quat.create(), m3);
		quat.normalize(q, q);

		const svgWidth = Number(this.#htmlAxis.clientWidth);
		const svgHeight = Number(this.#htmlAxis.clientHeight);

		const line = (pos: vec3, i: number): void => {
			const end = vec3.transformQuat(vec3.create(), pos, q);

			createElementNS(svgNamespace, 'line', {
				parent: this.#htmlAxis,
				class: `stroke${i}`,
				x1: svgWidth / 2,
				y1: svgHeight / 2,
				x2: end[0] * svgWidth * scale + svgWidth / 2,
				y2: -end[1] * svgWidth * scale + svgWidth / 2,
			}) as SVGElement;
		}

		let gizmoStyle = '';

		for (let i = 0; i < 6; ++i) {
			const label = this.#htmlAxisLabel[i]!;

			const pos = vec3.create();
			vec3.transformQuat(pos, positions[i] as vec3, q);
			if (i % 2 == 0) {
				line(positions[i] as vec3, i);
			}
			const scaledPos = vec3.scale(vec3.create(), pos, scale * 100);
			vec3.add(scaledPos, scaledPos, [50, 50, 0]);
			const labelWidth = Number(label.offsetWidth);
			const labelHeight = Number(label.offsetHeight);
			label.style.left = `calc(${scaledPos[0]}% - ${labelWidth / 2}px)`;
			label.style.top = `calc(${100 - scaledPos[1]}% - ${labelHeight / 2}px)`;
			label.style.zIndex = `${Math.round(pos[2] * 1000)}`;

			if (i % 2 == 1) {
				// Update opacity for negative axis

				if (pos[2] < 0) {
					label.style.opacity = `${1 + pos[2]}`;
				}
			} else {
				gizmoStyle += `--${classes[Math.floor(i / 2)]}: ${pos[2] * 0.5 + 0.5};`
			}
		}
		this.#htmlGizmo.style.cssText = gizmoStyle;
	}

	#handleAxisClick(axis: number): void {
		const camera = this.orbitControl?.camera;
		if (!camera) {
			return;
		}

		const sign = (axis % 2 === 0) ? 1 : -1;

		const pos = this.orbitControl!.target.getWorldPosition();

		switch (Math.floor(axis / 2)) {
			case 0:
				pos[0] += 500 * sign;
				break;
			case 1:
				pos[1] += 500 * sign;
				break;
			case 2:
				pos[2] += 500 * sign;
				break;
		}

		camera.setWorldPosition(pos);
	}

	getHtmlElement(): HTMLElement {
		return this.#shadowRoot.host as HTMLElement;
	}
}
