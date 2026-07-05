import { vec3 } from 'gl-matrix';
import { MyEventTarget } from 'harmony-utils';
import { Camera } from '../cameras/camera';
import { Graphics } from '../graphics/graphics2';
import { Material } from '../materials/material';
import { MeshBasicMaterial } from '../materials/meshbasicmaterial';
import { FullScreenQuad } from '../primitives/fullscreenquad';
import { Scene } from '../scenes/scene';
import { Source1TextureManager } from '../sourceengine/export';
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
	textureSize?: number;
	lenght?: number;
	[key: string]: any;
}

export class NodeImageEditor extends MyEventTarget<NodeImageEditorEventType, CustomEvent<NodeImageEditorEvent>> {
	#variables = new Map<string, NodeImageVariableType>();
	#scene = new Scene();
	#nodes = new Set<Node>();
	#camera = new Camera({ position: vec3.fromValues(0, 0, 100), autoResize: false, });
	#material = new MeshBasicMaterial();
	#fullScreenQuadMesh = new FullScreenQuad({ material: this.#material, parent: this.#scene });
	textureSize = DEFAULT_TEXTURE_SIZE;

	render(material: Material, width: number, height: number): void {
		this.#fullScreenQuadMesh.setMaterial(material);
		Graphics.render(this.#scene, this.#camera, 0, { DisableToolRendering: true, width: width, height: height });
		// Set the material back to default to free the material
		this.#fullScreenQuadMesh.setMaterial(this.#material);
	}

	addNode(operationName: string, params: AddNodeParameters = {}): Node | null {
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

	#dispatchEvent(eventName: NodeImageEditorEventType, eventDetail: Node | null): void {
		this.dispatchEvent(new CustomEvent<NodeImageEditorEvent>(eventName, { detail: { node: eventDetail } }));
		this.dispatchEvent(new CustomEvent<NodeImageEditorEvent>(NodeImageEditorEventType.Any, { detail: { eventName: eventName } }));
	}

	/*addNode(node) {
		if (node instanceof Node && node.editor == this) {
			this.#nodes.add(node);
			this.#dispatchEvent('nodeadded', node);
		}
	}*/

	removeNode(node: Node): void {
		if (node.editor == this) {
			this.#nodes.delete(node);
			//TODO :remove all inputs / output
			this.#dispatchEvent(NodeImageEditorEventType.NodeRemoved, node);
		}
	}

	removeAllNodes(): void {
		this.#nodes.forEach((node) => node.dispose());
		this.#nodes.clear();
		this.#dispatchEvent(NodeImageEditorEventType.AllNodesRemoved, null);
		//TODO :remove all inputs / output
		Source1TextureManager.cleanup();
	}

	getVariable(name: string): number | undefined {
		return this.#variables.get(name);
	}

	setVariable(name: string, value: number): void {
		this.#variables.set(name, value);
	}

	deleteVariable(name: string): void {
		this.#variables.delete(name);
	}

	clearVariables(): void {
		this.#variables.clear();
	}

	getNodes(): Set<Node> {
		return new Set(this.#nodes);
	}
}
