import { vec3 } from 'gl-matrix';
import { MyEventTarget } from 'harmony-utils';
import { Camera } from '../cameras/camera';
import { Graphics } from '../graphics/graphics';
import { Material } from '../materials/material';
import { FullScreenQuad } from '../primitives/fullscreenquad';
import { Scene } from '../scenes/scene';
import { Node } from './node';
import { getOperation } from './operations';

export const DEFAULT_TEXTURE_SIZE = 512;

export type NodeImageVariableType = number;

export class NodeImageEditor extends MyEventTarget {
	#variables = new Map<string, NodeImageVariableType>();
	#scene = new Scene();
	#nodes = new Set<Node>();
	#camera = new Camera({ position: vec3.fromValues(0, 0, 100) });
	#fullScreenQuadMesh = new FullScreenQuad();
	textureSize = DEFAULT_TEXTURE_SIZE;

	constructor() {
		super();
		this.#scene.addChild(this.#fullScreenQuadMesh);
	}

	render(material: Material) {
		this.#fullScreenQuadMesh.setMaterial(material);
		Graphics.render(this.#scene, this.#camera, 0, { DisableToolRendering: true });

	}

	addNode(operationName: string, params: any = {}): Node | null {
		params.textureSize = params.textureSize ?? this.textureSize;
		if (!operationName) {
			return null;
		}
		const node = getOperation(operationName, this, params);
		if (node) {
			this.textureSize = params.textureSize;
			this.#nodes.add(node);
			this.#dispatchEvent('nodeadded', node);
		}
		return node;
	}

	/*addNewNode(operationName, params = Object.create(null)) {
		let node = this._createNode(operationName, params);
		this.addNode(node);
		return node;
	}*/

	#dispatchEvent(eventName: string, eventDetail: Node | null) {
		this.dispatchEvent(new CustomEvent(eventName, { detail: { value: eventDetail } }));
		this.dispatchEvent(new CustomEvent('*', { detail: { eventName: eventName } }));
	}

	/*addNode(node) {
		if (node instanceof Node && node.editor == this) {
			this.#nodes.add(node);
			this.#dispatchEvent('nodeadded', node);
		}
	}*/

	removeNode(node: Node) {
		if (node.editor == this) {
			this.#nodes.delete(node);
			//TODO :remove all inputs / output
			this.#dispatchEvent('noderemoved', node);
		}
	}

	removeAllNodes() {
		this.#nodes.forEach((node) => node.dispose());
		this.#nodes.clear();
		this.#dispatchEvent('allnodesremoved', null);
		//TODO :remove all inputs / output
	}

	getVariable(name: string) {
		return this.#variables.get(name);
	}

	setVariable(name: string, value: number) {
		return this.#variables.set(name, value);
	}

	deleteVariable(name: string) {
		return this.#variables.delete(name);
	}

	clearVariables() {
		return this.#variables.clear();
	}

	getNodes() {
		return new Set(this.#nodes);
	}
}
