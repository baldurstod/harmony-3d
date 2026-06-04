import { mat3, quat, vec3 } from 'gl-matrix';
import { createElement, createElementNS, createShadowRoot, svgNamespace } from 'harmony-ui';
import { Camera } from '../cameras/camera';
import orbitGizmoCSS from '../css/orbitgizmo.css';
import { GraphicsEvent, GraphicsEvents, GraphicTickEvent } from '../graphics/graphicsevents';

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
	#htmlAxisLabel: [HTMLElement, HTMLElement, HTMLElement, HTMLElement, HTMLElement, HTMLElement] = [null as unknown as HTMLElement, null as unknown as HTMLElement, null as unknown as HTMLElement, null as unknown as HTMLElement, null as unknown as HTMLElement, null as unknown as HTMLElement,];
	camera?: Camera;

	constructor() {
		this.#shadowRoot = createShadowRoot('div', {
			adoptStyle: orbitGizmoCSS,
			child: createElement('div', {
				class: 'wrapper',
				child: this.#htmlGizmo = createElement('div', {
					class: 'gizmo',
					childs: [
						this.#htmlAxis = createElementNS(svgNamespace, 'svg', {
							//hidden: true,
						}) as SVGElement,
						this.#htmlAxisLabel[0] = createElement('div'),
					],
				}),
			}),
		});

		for (let i = 0; i < 6; ++i) {
			this.#htmlAxisLabel[i] = createElement('div', {
				class: `label ${i % 2 === 0 ? 'plus' : 'minus'} ${classes[Math.floor(i / 2)]}`,
				innerText: axis[i],
				parent: this.#htmlGizmo,
			});
		}

		let i = 0;
		GraphicsEvents.addEventListener(GraphicsEvent.Tick, (event: Event) => {
			i += (event as CustomEvent<GraphicTickEvent>).detail.delta * 20;
			this.#update();
		});

	}

	#update(): void {
		if (!this.camera) {
			return;
		}

		const scale = 0.3;
		this.#htmlAxis.replaceChildren();

		const mat = this.camera.cameraMatrix;
		const m3 = mat3.fromMat4(mat3.create(), mat);
		const q = quat.fromMat3(quat.create(), m3);
		quat.normalize(q, q);
		const center = vec3.transformQuat(vec3.create(), [0, 0, 0] as vec3, q);

		const svgWidth = Number(this.#htmlAxis.clientWidth);
		const svgHeight = Number(this.#htmlAxis.clientHeight);

		const line = (pos: vec3, i: number): void => {
			const end = vec3.transformQuat(vec3.create(), pos as vec3, q);

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

	getHtmlElement(): HTMLElement {
		return this.#shadowRoot.host as HTMLElement;
	}
}
