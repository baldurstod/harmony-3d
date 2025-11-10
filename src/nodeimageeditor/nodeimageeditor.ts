import { vec3 } from 'gl-matrix';
import { MyEventTarget } from 'harmony-utils';
import { Camera } from '../cameras/camera';
import { Graphics } from '../graphics/graphics2';
import { Material } from '../materials/material';
import { FullScreenQuad } from '../primitives/fullscreenquad';
import { Scene } from '../scenes/scene';
import { Node } from './node';
import { getOperation } from './operations';

export const DEFAULT_TEXTURE_SIZE = 512;

export type NodeImageVariableType = number;

export enum NodeImageEditorEventType {
	Any = '*',
	NodeAdded = 'nodeadded',
	NodeRemoved = 'noderemoved',
	AllNodesRemoved = 'allnodesremoved',
}

export type NodeImageEditorEvent = {
	node?: Node | null;
	eventName?: string;
}

export type AddNodeParameters = {
	textureSize: number;
	lenght?: number;
	[key: string]: any;
}

export class NodeImageEditor extends MyEventTarget<NodeImageEditorEventType, CustomEvent<NodeImageEditorEvent>> {
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

	render(material: Material, width: number, height: number) {
		this.#fullScreenQuadMesh.setMaterial(material);
		Graphics.render(this.#scene, this.#camera, 0, { DisableToolRendering: true, width: width, height: height });

	}

	addNode(operationName: string, params: AddNodeParameters): Node | null {
		if (!operationName) {
			return null;
		}
		const node = getOperation(operationName, this, params);
		if (node) {
			//this.textureSize = params.textureSize ?? this.textureSize;
			this.#nodes.add(node);
			this.#dispatchEvent(NodeImageEditorEventType.NodeAdded, node);
		}
		return node;
	}

	/*addNewNode(operationName, params = Object.create(null)) {
		let node = this._createNode(operationName, params);
		this.addNode(node);
		return node;
	}*/

	#dispatchEvent(eventName: NodeImageEditorEventType, eventDetail: Node | null) {
		this.dispatchEvent(new CustomEvent<NodeImageEditorEvent>(eventName, { detail: { node: eventDetail } }));
		this.dispatchEvent(new CustomEvent<NodeImageEditorEvent>(NodeImageEditorEventType.Any, { detail: { eventName: eventName } }));
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
			this.#dispatchEvent(NodeImageEditorEventType.NodeRemoved, node);
		}
	}

	removeAllNodes() {
		this.#nodes.forEach((node) => node.dispose());
		this.#nodes.clear();
		this.#dispatchEvent(NodeImageEditorEventType.AllNodesRemoved, null);
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
