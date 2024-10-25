import { createElement, shadowRootStyle, I18n } from 'harmony-ui';
import { NodeGui, DELAY_BEFORE_REFRESH } from './nodegui';
import { NodeImageEditor } from '../nodeimageeditor';

import nodeImageEditorCSS from '../../css/nodeimageeditor.css';
import { Node } from '../node';

const WIDTH = 300;
const HEIGHT = 300;

export class NodeImageEditorGui {
	#filter: any = {};
	#htmlElement;
	#shadowRoot;
	#imageEditorChanged: () => void;
	#refreshTimeout: number;
	#nodesGui = new Map<Node, NodeGui>();
	#nodeImageEditor: NodeImageEditor;
	#htmlNodes: HTMLElement;
	#canvas: HTMLCanvasElement;
	#context: CanvasRenderingContext2D;
	constructor(nodeImageEditor: NodeImageEditor) {
		this.#imageEditorChanged = () => {
			clearTimeout(this.#refreshTimeout);
			this.#refreshTimeout = setTimeout(() => this.#refreshHtml(), DELAY_BEFORE_REFRESH);
		}

		this.nodeImageEditor = nodeImageEditor;
		this.#initHtml();
	}

	set nodeImageEditor(nodeImageEditor: NodeImageEditor) {
		if (!(nodeImageEditor instanceof NodeImageEditor)) {
			throw 'Provide a NodeImageEditor instance';
		}
		if (this.#nodeImageEditor == nodeImageEditor) {
			return;
		}
		if (this.#nodeImageEditor) {
			this.#nodeImageEditor.removeEventListener('*', this.#imageEditorChanged);
		}

		this.#nodeImageEditor = nodeImageEditor;
		this.#nodeImageEditor.addEventListener('*', this.#imageEditorChanged);
	}

	get htmlElement() {
		return this.#htmlElement;
	}

	#initHtml() {
		this.#htmlElement = createElement('node-image-editor');
		this.#shadowRoot = this.#htmlElement.attachShadow({ mode: 'closed' });
		shadowRootStyle(this.#shadowRoot, nodeImageEditorCSS);
		I18n.observeElement(this.#shadowRoot);

		let htmlHeader = createElement('div', {
			class: 'node-image-editor-header',
			parent: this.#shadowRoot,
		});
		let htmlNodeFilter = createElement('input', { class: 'node-image-editor-node-filter' });
		htmlNodeFilter.addEventListener('input', (event: InputEvent) => { this.#filter.node = (event.target as HTMLInputElement).value; this.#refreshFilter() });
		htmlHeader.append(htmlNodeFilter);

		this.#htmlNodes = createElement('div', {
			class: 'node-image-editor-nodes',
			parent: this.#shadowRoot,
		});

		this.#canvas = createElement('canvas', { class: 'node-image-editor-canvas', style: 'z-index:1000;position:absolute;' });
		this.#context = this.#canvas.getContext('2d');

		this.#htmlNodes.append(this.#canvas);
		this.#initResizeObserver();
		this.#setCanvasSize();
	}

	#setCanvasSize() {
		this.#canvas.height = this.#htmlNodes.scrollHeight;
		this.#canvas.width = this.#htmlNodes.scrollWidth;
		this.#drawLinks();
	}

	#initResizeObserver() {
		const callback = (entries, observer) => {
			entries.forEach(entry => {
				this.#setCanvasSize();
			});
		};
		const resizeObserver = new ResizeObserver(callback);
		resizeObserver.observe(this.#canvas.parentElement);
	}

	#refreshHtml() {
		this.#htmlNodes.innerHTML = '';
		this.#htmlNodes.append(this.#canvas);
		for (let node of this.#nodeImageEditor.getNodes()) {
			let nodeGui = this.#nodesGui.get(node);
			if (!nodeGui) {
				nodeGui = new NodeGui(this, node);
				this.#nodesGui.set(node, nodeGui);
			}
			this.#htmlNodes.append(nodeGui.html);
		}
		//TODO: remove old nodes from this.#nodesGui
		this.#refreshFilter();
	}

	#organizeNodes() {
		this.#htmlNodes.innerHTML = '';
		this.#htmlNodes.append(this.#canvas);
		let nodes = new Map();
		let maxHeight = 0;
		for (let node of this.#nodeImageEditor.getNodes()) {
			let nodeGui = this.#nodesGui.get(node);

			let l = node.successorsLength();
			//nodeGui.html.style.right = l * WIDTH + 'px';

			let s = nodes.get(l);
			if (!s) {
				s = [];
				nodes.set(l, s);
			}
			s.push(nodeGui);
		}


		nodes[Symbol.iterator] = function* () {
			yield* [...this.entries()].sort(
				(a, b) => {
					return a[0] < b[0] ? -1 : 1;
				}
			);
		}

		for (let [s, n] of nodes) {
			let column = createElement('div', { class: 'node-image-editor-nodes-column' });
			this.#htmlNodes.prepend(column);
			for (let i = 0; i < n.length; ++i) {
				let nodeGui = n[i];
				//nodeGui.html.style.top = i * HEIGHT + 'px';
				let rect = nodeGui.html.getBoundingClientRect();
				//maxHeight = Math.max(maxHeight, rect.bottom);
				column.append(nodeGui.html);
			}
		}
		//this.#htmlNodes.style.height = maxHeight + 'px';;
	}

	#drawLink(p1, p2) {
		if (p1 && p2) {
			let context = this.#context;
			let p1BoundingRect = p1.getBoundingClientRect();
			let p2BoundingRect = p2.getBoundingClientRect();
			let p1Weight = 1;
			let p2Weight = 1;
			if (p1BoundingRect.height == 0 || p1BoundingRect.width == 0) {
				p1BoundingRect = p1.parentNode.parentNode.parentNode.getBoundingClientRect();
				p1Weight = 2;
			}
			if (p2BoundingRect.height == 0 || p2BoundingRect.width == 0) {
				p2BoundingRect = p2.parentNode.parentNode.parentNode.getBoundingClientRect();
				p2Weight = 0;
			}

			let panelBoundingRect = this.#canvas.getBoundingClientRect();

			let x1 = p1BoundingRect.left + p1BoundingRect.width / 2 * p1Weight - panelBoundingRect.left;
			let y1 = p1BoundingRect.top + p1BoundingRect.height / 2 - panelBoundingRect.top;
			let x2 = p2BoundingRect.left + p2BoundingRect.width / 2 * p2Weight - panelBoundingRect.left;
			let y2 = p2BoundingRect.top + p2BoundingRect.height / 2 - panelBoundingRect.top;
			context.beginPath();
			context.moveTo(x1, y1);
			let max = Math.max(Math.abs(y2 - y1), Math.abs(x2 - x1))
			//context.bezierCurveTo(Math.max(x2, x1 + max),y1,Math.min(x1, x2 - max),y2,x2,y2);

			let xa, xb;
			if (x2 > x1) {
				xa = (x1 + x2) / 2;
				xb = (x1 + x2) / 2;
			} else {
				xa = x1 + 100;
				xb = x2 - 100;
			}

			context.bezierCurveTo(xa, y1, xb, y2, x2, y2);
			context.lineWidth = 2;
			context.strokeStyle = "#EEEEEE";
			context.stroke();
		}
	}

	#drawLinks() {
		this.#context.clearRect(0, 0, this.#canvas.clientWidth, this.#canvas.clientHeight)

		for (let node of this.#nodeImageEditor.getNodes()) {
			let nodeGui = this.#nodesGui.get(node);
			let inputs = node.inputs;
			for (let input of inputs.values()) {
				if (input.predecessor) {
					let nodeGui2 = this.#nodesGui.get(input.predecessor.node);
					if (nodeGui && nodeGui2) {
						let inputGui = nodeGui._ioGui.get(input);
						let outputGui = nodeGui2._ioGui.get(input.predecessor);

						this.#drawLink(outputGui, inputGui);
					}
				}
			}
		}
	}

	#refreshFilter() {
		for (let node of this.#nodeImageEditor.getNodes()) {
			let nodeGui = this.#nodesGui.get(node);
			this.#matchFilter(nodeGui);
		}
		this.#organizeNodes();
		this.#drawLinks();
	}

	#matchFilter(nodeGUI) {
		let expanded = true;
		if (this.#filter.node) {
			if (!nodeGUI.node.title.includes(this.#filter.node)) {
				expanded = false;
			}
		}
		nodeGUI.expanded = expanded;
	}
}
