import { mat3, mat4, quat, vec3, vec4 } from 'gl-matrix';
import { DEBUG, VERBOSE } from '../buildoptions';
import { Camera } from '../cameras/camera';
import { JSONLoader } from '../importers/jsonloader';
import { Material } from '../materials/material';
import { BoundingBox } from '../math/boundingbox';
import { DEG_TO_RAD } from '../math/constants';
import { clamp, generateRandomUUID } from '../math/functions';
import { Intersection } from '../raycasting/intersection';
import { Raycaster } from '../raycasting/raycaster';
import { Scene } from '../scenes/scene';
import { JSONObject } from '../types';
import { Properties, Property } from '../utils/properties';
import { stringToQuat, stringToVec3 } from '../utils/utils';
import { registerEntity } from './entities';
import { EntityObserver } from './entityobserver';
import { pickList } from './picklist';

const X_VECTOR = vec3.fromValues(1, 0, 0);
const Y_VECTOR = vec3.fromValues(0, 1, 0);
const Z_VECTOR = vec3.fromValues(0, 0, 1);

const tempVec3_1 = vec3.create();
const tempVec3_2 = vec3.create();
const tempVec3_3 = vec3.create();
const tempVec3_4 = vec3.create();
const tempQuat = quat.create();
const tempQuat2 = quat.create();
const tempQuat3 = quat.create();
const tempMat4 = mat4.create();
const _upVector = vec3.fromValues(0, 0, 1);

let incrementalPickingId = 0;

export const IDENTITY_QUAT = quat.create();
export const IDENTITY_VEC3 = vec3.create();
export const UNITY_VEC3 = vec3.fromValues(1, 1, 1);

export const LAYER_MAX = 50;

export enum EngineEntityAttributes {
	IsTool = 'is tool',
}

export interface EntityParameters {
	name?: string;
	parent?: Entity;
	childs?: Entity[];
	position?: vec3;
	quaternion?: quat;
	scale?: vec3;
	hideInExplorer?: boolean;
	castShadow?: boolean;
	receiveShadow?: boolean;
	visible?: boolean;
}

export type DynamicParams = { [key: string]: DynamicParam }//TODO: create a map;
export type DynamicParam = any/*TODO: create an actual type*/;

export class Entity {
	static addSubMenu: any;
	id = generateRandomUUID();
	#wireframe?: number = 0;
	#hideInExplorer = false;
	#serializable = true;
	#castShadow?: boolean;
	#receiveShadow?: boolean;
	#visible?: boolean;
	#playing = true;
	#worldMatrix = mat4.create();
	#name = '';
	#children = new Set<Entity>();
	#attributes = new Map<string, any>();
	#pickingColor?: vec3;
	enumerable = true;
	animable = false;
	resetable = false;
	_position = vec3.create();
	_quaternion = quat.create();
	_scale = vec3.clone(UNITY_VEC3);
	_mvMatrix = mat4.create();
	_normalMatrix = mat3.create();
	_parent: Entity | null = null;
	materialsParams: DynamicParams = {};
	isRenderable = false;
	lockPos = false;
	lockRot = false;
	//lockScale = false;
	drawOutline = false;
	locked = false; // Prevents updates from animation system
	lockPosition = false;
	lockRotation = false;
	lockScale = false;
	static editMaterial: (entity: Entity) => void;
	readonly properties = new Properties()//Map<string, any>();
	loadedPromise?: Promise<any>;
	#layer?: number = undefined;

	constructor(params?: EntityParameters) {
		this.setParameters(params);
	}

	setParameters(parameters?: EntityParameters) {
		if (!parameters) {
			return;
		}

		if (parameters.name) {
			this.#name = parameters.name;
		}
		if (parameters.parent) {
			this.parent = parameters.parent;
		}
		if (parameters.childs) {
			parameters.childs.forEach((child: Entity) => this.addChild(child));
		}
		if (parameters.position) {
			this.position = parameters.position;
		}
		if (parameters.quaternion) {
			this.quaternion = parameters.quaternion;
		}
		if (parameters.scale) {
			this.scale = parameters.scale;
		}
		if (parameters.hideInExplorer) {
			this.hideInExplorer = parameters.hideInExplorer;
		}
		if (parameters.castShadow) {
			this.castShadow = parameters.castShadow;
		}
		if (parameters.receiveShadow) {
			this.receiveShadow = parameters.receiveShadow;
		}

		if (parameters.visible !== undefined) {
			this.setVisible(parameters.visible);
		}
	}

	set name(name) {
		const oldValue = this.#name;
		this.#name = name;
		if (oldValue != name) {
			EntityObserver.propertyChanged(this, 'name', oldValue, name);
		}
	}

	get name() {
		return this.#name;
	}

	setPosition(position: vec3) {
		if (this.lockPosition) {
			return;
		}
		const oldValue = vec3.copy(tempVec3_4, this._position);
		vec3.copy(this._position, position);
		if (!vec3.exactEquals(oldValue, position)) {
			EntityObserver.propertyChanged(this, 'position', oldValue, position);
		}
	}

	getPosition(position: vec3 = vec3.create()) {
		return vec3.copy(position, this._position);
	}

	/**
	 * @deprecated Please use `setPosition` instead.
	 */
	set position(position: vec3) {
		// TODO: deprecate
		this.setPosition(position);
	}

	/**
	 * @deprecated Please use `getPosition` instead.
	 */
	get position() {
		// TODO: deprecate
		return this.getPosition();
	}

	getWorldPosition(vec = vec3.create()) {
		if (this._parent) {
			this._parent.getWorldPosition(vec);
			this._parent.getWorldQuaternion(tempQuat);
			vec3.mul(tempVec3_3, this._position, this._parent.getWorldScale(tempVec3_3));
			vec3.transformQuat(tempVec3_3, tempVec3_3, tempQuat);
			vec3.add(vec, vec, tempVec3_3);
		} else {
			vec3.copy(vec, this._position);
		}
		return vec;
	}

	getPositionFrom(other: Entity, vec = vec3.create()) {
		this.getWorldPosition(tempVec3_1);
		other.getWorldPosition(tempVec3_2);

		return vec3.sub(vec, tempVec3_2, tempVec3_1);
	}

	setWorldPosition(position: vec3) {
		if (this._parent) {
			this._parent.getWorldPosition(tempVec3_1);
			this._parent.getWorldQuaternion(tempQuat);
			vec3.sub(tempVec3_1, position, tempVec3_1);
			quat.invert(tempQuat, tempQuat);
			vec3.transformQuat(tempVec3_1, tempVec3_1, tempQuat);
			this.position = tempVec3_1;
		} else {
			this.position = position;
		}
	}

	getWorldQuaternion(q = quat.create()) {
		if (this._parent) {
			this._parent.getWorldQuaternion(q);
			quat.mul(q, q, this._quaternion);
		} else {
			quat.copy(q, this._quaternion);
		}
		return q;
	}

	setWorldQuaternion(quaternion: quat) {
		if (this._parent) {
			this._parent.getWorldQuaternion(tempQuat);
			quat.invert(tempQuat, tempQuat);
			quat.mul(this._quaternion, tempQuat, quaternion);
		} else {
			quat.copy(this._quaternion, quaternion);
		}
	}

	getWorldScale(vec = vec3.create()) {
		if (this._parent) {
			this._parent.getWorldScale(vec);
			vec3.mul(vec, vec, this._scale);
		} else {
			vec3.copy(vec, this._scale);
		}
		return vec;
	}

	get positionAsString() {
		return `${this._position[0].toFixed(2)} ${this._position[1].toFixed(2)} ${this._position[2].toFixed(2)}`;
	}

	setQuaternion(quaternion: quat) {
		if (this.lockRotation) {
			return;
		}
		const oldValue = quat.copy(tempQuat3, this._quaternion);
		quat.normalize(this._quaternion, quaternion);
		if (!quat.exactEquals(oldValue, this._quaternion)) {
			EntityObserver.propertyChanged(this, 'quaternion', oldValue, this._quaternion);
		}
	}

	getQuaternion(quaternion: quat = quat.create()) {
		return quat.copy(quaternion, this._quaternion);
	}

	/**
	 * @deprecated Please use `setQuaternion` instead.
	 */
	set quaternion(quaternion: quat) {
		this.setQuaternion(quaternion);
	}

	/**
	 * @deprecated Please use `getQuaternion` instead.
	 */
	get quaternion() {
		return this.getQuaternion();
	}

	get quaternionAsString() {
		return `${this._quaternion[0].toFixed(2)} ${this._quaternion[1].toFixed(2)} ${this._quaternion[2].toFixed(2)} ${this._quaternion[3].toFixed(2)}`;
	}

	set scale(scale) {
		if (this.lockScale) {
			return;
		}
		vec3.copy(this._scale, scale);
	}

	get scale() {
		return vec3.clone(this._scale);
	}

	get worldMatrix() {//TODO: remove ?
		//TODO: optimize
		this.getWorldPosition(tempVec3_1);
		this.getWorldQuaternion(tempQuat);
		//console.error(...tempVec3_1);


		mat4.fromRotationTranslationScale(this.#worldMatrix, tempQuat, tempVec3_1, this.getWorldScale());
		return this.#worldMatrix;
	}

	render(canvas: HTMLCanvasElement) {
	}

	get transparent() {
		return false;
	}

	setVisible(visible?: boolean | undefined) {
		const oldValue = this.#visible;
		this.#visible = visible;
		if (oldValue != visible) {
			EntityObserver.propertyChanged(this, 'visible', oldValue, visible);
		}
	}

	/**
	 * @deprecated Please use `setVisible` instead.
	 */
	set visible(visible) {
		this.setVisible(visible);
	}

	isVisible(): boolean {
		if (this.#visible === undefined) {
			return this._parent?.isVisible() ?? true;
		} else {
			return this.#visible;
		}
	}

	isVisibleSelf(): boolean | undefined {
		return this.#visible;
	}

	/**
	 * @deprecated Please use `isVisible` instead.
	 */
	get visible() {
		return this.isVisible();
	}

	/**
	 * @deprecated Please use `isVisibleSelf` instead.
	 */
	get visibleSelf() {
		return this.#visible;
	}

	toggleVisibility() {
		const oldValue = this.#visible;
		if (this.#visible === undefined) {
			if (this.isVisible()) {
				this.setVisible(false);
			} else {
				this.setVisible(true);
			}
		} else if (this.#visible === true) {
			if (this._parent) {
				if (this._parent.isVisible()) {
					this.setVisible(false);
				} else {
					this.setVisible(undefined);
				}
			} else {
				this.setVisible(false);
			}
		} else { // false
			if (this._parent) {
				if (this._parent.isVisible()) {
					this.setVisible(undefined);
				} else {
					this.setVisible(true);
				}
			} else {
				this.setVisible(undefined);
			}
		}
		if (oldValue != this.#visible) {
			EntityObserver.propertyChanged(this, 'visible', oldValue, this.#visible);
		}
	}

	setPlaying(playing: boolean) {
		const oldValue = this.#playing;
		this.#playing = playing;
		if (oldValue != playing) {
			EntityObserver.propertyChanged(this, 'playing', oldValue, playing);
		}
	}

	isPlaying() {
		return this.#playing;
	}

	togglePlaying() {
		this.setPlaying(!this.#playing);
	}

	do(action: string, params?: any) { }

	#setParent(parent: Entity | null) {
		EntityObserver.parentChanged(this, this._parent, parent);
		if (this._parent != null) {
			this._parent.removeChild(this);
		}
		if (this._parent != parent) {
			this._parent = parent;
		}
		this.#propagate();
		this.parentChanged(parent);
	}

	parentChanged(parent: Entity | null) { }

	*getParentIterator() {
		const ws = new WeakSet<Entity>();

		let current = this._parent;

		while (current) {
			ws.add(current);
			yield current;

			current = current.parent;
			if (!current || ws.has(current)) {
				return null;
			}
		}
	}


	remove() {
		if (this._parent != null) {
			this.#setParent(null);
		}
	}

	removeThis() {
		for (const child of this.#children) {
			child.parent = this.parent;
		}
		this.remove();
	}

	removeChildren() {
		for (const child of this.#children) {
			child.remove();
		}
	}

	disposeChildren() {
		for (const child of this.#children) {
			child.dispose();
		}
	}

	removeSiblings() {
		if (this._parent != null) {
			for (const child of this._parent.#children) {
				if (child !== this) {
					child.remove();
				}
			}
		}
	}

	removeSimilarSiblings() {
		if (this._parent != null) {
			const constructorName = this.constructor.name;
			for (const child of this._parent.#children) {
				if (child !== this && child.constructor.name === constructorName) {
					child.remove();
				}
			}
		}
	}

	set parent(parent: Entity | null) {
		if (parent) {
			parent.addChild(this);
		}
		/*if (parent instanceof Entity) {
		} else {
			if (DEBUG) {
				console.log(parent, ' is not instanceof Entity');
			}
		}*/
	}

	get parent(): Entity | null {
		return this._parent;
	}

	get root() {
		let currentEntity: Entity = this;
		let parent: Entity | null;
		while (currentEntity) {
			parent = currentEntity._parent;
			if (parent) {
				currentEntity = parent;
			} else {
				return currentEntity;
			}
		}
		return currentEntity;
	}

	addChild(child?: Entity | null) {
		if (!child) {
			return
		}
		if (!(child instanceof Entity)) {
			if (DEBUG) {
				console.log(child, ' is not instanceof Entity');
			}
			return;
		}
		if (child === this) {
			if (DEBUG) {
				console.log('Cannot add an entity as child of itself');
			}
			return;
		}
		if (this.#children.has(child)) {
			if (VERBOSE) {
				console.info(child, ' is already a child of ', this);
			}
			return;
		}
		if (this.isParent(child)) {
			if (DEBUG) {
				console.info(child, ' is parent of ', this);
			}
			return;
		}

		this.#children.add(child);
		EntityObserver.childAdded(this, child);
		child.#setParent(this);
		return child;
	}

	addChilds(...childs: Entity[]) {
		childs.forEach(child => this.addChild(child));
	}

	isParent(parent: Entity): boolean {
		const _parent = this._parent;
		if (_parent) {
			if (_parent === parent) {
				return true;
			} else {
				return _parent.isParent(parent);
			}
		}
		return false;
	}

	removeChild(child?: Entity | null) {
		if (child && this.#children.has(child)) {
			this.#children.delete(child);
			child.#setParent(null);
			EntityObserver.childRemoved(this, child);
		} else {
			if (VERBOSE) {
				console.log(child, ' is not a child of ', this);
			}
		}
	}

	toString() {
		return this.#name !== undefined ? this.#name : '';
	}

	translate(v: vec3) {
		vec3.add(tempVec3_1, this._position, v);
		this.position = tempVec3_1;
	}

	translateOnAxis(axis: vec3, distance: number) {
		vec3.transformQuat(tempVec3_1, axis, this._quaternion);
		vec3.scaleAndAdd(tempVec3_1, this._position, tempVec3_1, distance);
		this.position = tempVec3_1;
		return this;
	}

	translateX(distance: number) {//TODO: optimize inline
		return this.translateOnAxis(X_VECTOR, distance);
	}

	translateY(distance: number) {
		return this.translateOnAxis(Y_VECTOR, distance);
	}

	translateZ(distance: number) {
		return this.translateOnAxis(Z_VECTOR, distance);
	}

	rotateX(rad: number) {
		quat.rotateX(this._quaternion, this._quaternion, rad);
		this.locked = true;
	}

	rotateY(rad: number) {
		quat.rotateY(this._quaternion, this._quaternion, rad);
		this.locked = true;
	}

	rotateZ(rad: number) {
		quat.rotateZ(this._quaternion, this._quaternion, rad);
		this.locked = true;
	}

	rotateGlobalX(rad: number) {
		quat.rotateX(tempQuat, IDENTITY_QUAT, rad);
		quat.mul(this._quaternion, tempQuat, this._quaternion);
		this.locked = true;
	}

	rotateGlobalY(rad: number) {
		quat.rotateY(tempQuat, IDENTITY_QUAT, rad);
		quat.mul(this._quaternion, tempQuat, this._quaternion);
		this.locked = true;
	}

	rotateGlobalZ(rad: number) {
		quat.rotateZ(tempQuat, IDENTITY_QUAT, rad);
		quat.mul(this._quaternion, tempQuat, this._quaternion);
		this.locked = true;
	}

	/**
	 * Makes this object look at the specified location.
	 *
	 * @param {Float32Array(3)} target Point in space to look at.
	 *
	 * @return {void}.
	 */
	lookAt(target: vec3, upVector = undefined): void {
		const parent = this._parent;
		mat4.lookAt(tempMat4, this._position, target, upVector ?? _upVector);
		mat4.getRotation(tempQuat, tempMat4);
		quat.invert(tempQuat, tempQuat);


		if (parent) {
			quat.conjugate(tempQuat2, parent._quaternion);
			quat.mul(tempQuat, tempQuat2, tempQuat);
		}
		this.quaternion = tempQuat;
	}

	getMeshList(): Set<Entity> {
		const meshList = new Set<Entity>();
		const treated = new WeakSet<Entity>();

		let currentEntity: Entity | undefined = this;
		const objectStack: Entity[] = [];

		while (currentEntity) {
			if (currentEntity.isRenderable && (currentEntity.isVisible() !== false)) {
				meshList.add(currentEntity);
			}
			for (const child of currentEntity.#children) {
				if (!treated.has(child)) {
					objectStack.push(child);
					treated.add(child);
				}
			}
			currentEntity = objectStack.shift();
		}
		return meshList;
	}

	showOutline(show: boolean, color?: vec4) {
		if (show) {
			this.drawOutline = true;
			this.materialsParams.drawOutline = true;
			if (color) {
				this.materialsParams.outlineColor = color;
			}
		} else {
			this.drawOutline = false;
			this.materialsParams.drawOutline = false;
		}
	}

	getAllChilds(includeSelf: boolean) {
		const ws = new WeakSet<Entity>();
		const childs = new Set<Entity>();
		const objectStack: Entity[] = [];

		let currentEntity: Entity | undefined = this;
		if (includeSelf) {
			childs.add(this);
		}

		while (currentEntity) {
			for (const child of currentEntity.#children) {
				if (!ws.has(child)) {
					objectStack.push(child);
					childs.add(child);
					ws.add(child);
				}
			}
			currentEntity = objectStack.shift();
		}
		return childs;
	}

	getBoundsModelSpace(min = vec3.create(), max = vec3.create()) {
		//TODO: deprecate
		if (this.#children.size > 0) {
			min[0] = Infinity;
			min[1] = Infinity;
			min[2] = Infinity;
			max[0] = -Infinity;
			max[1] = -Infinity;
			max[2] = -Infinity;
			for (const child of this.#children) {
				child.getBoundsModelSpace(tempVec3_1, tempVec3_2);
				vec3.min(min, min, tempVec3_1);
				vec3.max(max, max, tempVec3_2);
			}
		} else {
			min[0] = 0;
			min[1] = 0;
			min[2] = 0;
			max[0] = 0;
			max[1] = 0;
			max[2] = 0;
		}
	}

	getBoundingBox(boundingBox = new BoundingBox()) {
		boundingBox.reset();
		const childBoundingBox = new BoundingBox();
		for (const child of this.#children) {
			if (child.isVisible()) {
				boundingBox.addBoundingBox(child.getBoundingBox(childBoundingBox));
			}
		}
		return boundingBox;
	}

	getParentModel(): Entity | undefined {
		return this._parent?.getParentModel();
	}

	getChildList(type?: string) {
		const ws = new WeakSet<Entity>();
		const childs = new Set<Entity>();
		const objectStack: Entity[] = [];

		let currentEntity: Entity | undefined = this;
		while (currentEntity) {
			for (const child of currentEntity.#children) {
				if (!ws.has(child) && child.enumerable) {
					objectStack.push(child);
					ws.add(child);
				}
			}
			if (type === undefined || currentEntity.is(type)) {
				childs.add(currentEntity);
			}
			currentEntity = objectStack.shift();
		}
		return childs;
	}

	forEach(callback: (ent: Entity) => void) {
		callback(this);
		for (const child of this.#children) {
			child.forEach(callback);
		}
	}

	forEachVisible(callback: (ent: Entity) => void) {
		if (this.#visible) {
			callback(this);
			for (const child of this.#children) {
				child.forEach(callback);
			}
		}
	}

	forEachParent(callback: (ent: Entity) => void) {
		const parent = this._parent;
		if (parent) {
			callback(parent);
			parent.forEachParent(callback);
		}
	}

	setupPickingId() {
		const pickingId = ++incrementalPickingId;
		pickList.set(pickingId, this);
		this.#pickingColor = vec3.fromValues(((pickingId >> 16) & 0xFF) / 255.0, ((pickingId >> 8) & 0xFF) / 255.0, ((pickingId >> 0) & 0xFF) / 255.0);
	}

	get pickingColor(): vec3 | undefined {
		return this.#pickingColor ?? this._parent?.pickingColor;
	}

	update(scene: Scene, camera: Camera, delta: number) {
	}

	set castShadow(castShadow: boolean | undefined) {
		this.#castShadow = castShadow;
	}

	get castShadow(): boolean | undefined {
		if (this.#castShadow === undefined) {
			return this._parent ? this._parent.castShadow : true;
		} else {
			return this.#castShadow;
		}
	}

	toggleCastShadow() {
		if (this.#castShadow === undefined) {
			if (this.castShadow) {
				this.castShadow = false;
			} else {
				this.castShadow = true;
			}
		} else if (this.#castShadow === true) {
			if (this._parent?.castShadow) {
				this.castShadow = false;
			} else {
				this.castShadow = undefined;
			}
		} else {
			if (this._parent?.castShadow) {
				this.castShadow = undefined;
			} else {
				this.castShadow = true;
			}
		}
	}

	set receiveShadow(receiveShadow: boolean | undefined) {
		this.#receiveShadow = receiveShadow;
	}

	get receiveShadow(): boolean {
		if (this.#receiveShadow === undefined) {
			return this._parent ? this._parent.receiveShadow : true;
		} else {
			return this.#receiveShadow;
		}
	}

	toggleReceiveShadow() {
		if (this.#receiveShadow === undefined) {
			if (this.receiveShadow) {
				this.receiveShadow = false;
			} else {
				this.receiveShadow = true;
			}
		} else if (this.#receiveShadow === true) {
			if (this._parent?.receiveShadow) {
				this.receiveShadow = false;
			} else {
				this.receiveShadow = undefined;
			}
		} else {
			if (this._parent?.receiveShadow) {
				this.receiveShadow = undefined;
			} else {
				this.receiveShadow = true;
			}
		}
	}

	set serializable(serializable) {
		this.#serializable = serializable;
	}

	get serializable() {
		return this.#serializable;
	}

	set hideInExplorer(hideInExplorer) {
		this.#hideInExplorer = hideInExplorer;
	}

	get hideInExplorer() {
		return this.#hideInExplorer;
	}

	buildContextMenu() {
		const menu = {
			visibility: { i18n: '#visibility', selected: this.isVisible(), f: () => this.toggleVisibility() },

			remove: { i18n: '#remove', f: () => this.remove() },
			destroy: { i18n: '#destroy', f: () => this.dispose() },
			remove_more: {
				i18n: '#remove_more', submenu: [
					{ i18n: '#remove_this', f: () => this.removeThis() },
					{ i18n: '#remove_childs', f: () => this.removeChildren() },
					{ i18n: '#remove_siblings', f: () => this.removeSiblings() },
					{ i18n: '#remove_similar_siblings', f: () => this.removeSimilarSiblings() },
				]
			},
			name: { i18n: '#name', f: () => { const n = prompt('Name', this.name); if (n !== null) { this.name = n; } } },
			add: { i18n: '#add', submenu: Entity.addSubMenu },
			entitynull_1: null,
			position: { i18n: '#position', f: () => { const v = prompt('Position', this.position.join(' ')); if (v !== null) { this.lockPos = true; this.position = stringToVec3(v); } } },
			translate: { i18n: '#translate', f: () => { const t = prompt('Translation', '0 0 0'); if (t !== null) { this.lockPos = true; this.translate(stringToVec3(t)); } } },
			reset_position: { i18n: '#reset_position', f: () => this.position = IDENTITY_VEC3 },
			entitynull_2: null,
			quaternion: { i18n: '#quaternion', f: () => { const v = prompt('Quaternion', this.quaternion.join(' ')); if (v !== null) { this.lockRot = true; this.quaternion = stringToQuat(v); } } },
			rotate: {
				i18n: '#rotate', submenu: [
					{ i18n: '#rotate_x_global', f: () => { const r = Number(prompt('Rotation around X global', '0')); if (r !== null) { this.lockRot = true; this.rotateGlobalX(r * DEG_TO_RAD); } } },
					{ i18n: '#rotate_y_global', f: () => { const r = Number(prompt('Rotation around Y global', '0')); if (r !== null) { this.lockRot = true; this.rotateGlobalY(r * DEG_TO_RAD); } } },
					{ i18n: '#rotate_z_global', f: () => { const r = Number(prompt('Rotation around Z global', '0')); if (r !== null) { this.lockRot = true; this.rotateGlobalZ(r * DEG_TO_RAD); } } },
					{ i18n: '#rotate_x', f: () => { const r = Number(prompt('Rotation around X', '0')); if (r !== null) { this.lockRot = true; this.rotateX(r * DEG_TO_RAD); } } },
					{ i18n: '#rotate_y', f: () => { const r = Number(prompt('Rotation around Y', '0')); if (r !== null) { this.lockRot = true; this.rotateY(r * DEG_TO_RAD); } } },
					{ i18n: '#rotate_z', f: () => { const r = Number(prompt('Rotation around Z', '0')); if (r !== null) { this.lockRot = true; this.rotateZ(r * DEG_TO_RAD); } } },
				]
			},
			reset_rotation: { i18n: '#reset_rotation', f: () => this.quaternion = IDENTITY_QUAT },
			entitynull_3: null,
			scale: {
				i18n: '#scale', f: () => {
					const s = prompt('Scale', this.scale.join(' ')); if (s !== null) {
						const arr = s.split(' ');
						if (arr.length == 3) {
							this.scale = vec3.set(tempVec3_1, Number(arr[0]), Number(arr[1]), Number(arr[2]));
						} else if (arr.length == 1) {
							this.scale = vec3.set(tempVec3_1, Number(arr[0]), Number(arr[0]), Number(arr[0]));
						}
					}
				}
			},
			reset_scale: { i18n: '#reset_scale', f: () => this.scale = UNITY_VEC3 },
			entitynull_4: null,
			wireframe: { i18n: '#wireframe', selected: this.wireframe > 0, f: () => this.toggleWireframe() },
			cast_shadows: { i18n: '#cast_shadows', selected: this.castShadow, f: () => this.toggleCastShadow() },
			receive_shadows: { i18n: '#receive_shadows', selected: this.receiveShadow, f: () => this.toggleReceiveShadow() },
			material: { i18n: '#material', submenu: {} },
		};

		if ((this as any).material) {
			Object.assign(menu.material.submenu, {
				entitynull_5: null,
				edit_material: { i18n: '#edit_material', f: () => Entity.editMaterial(this) }
			})
		}

		return menu;
	}

	raycast(raycaster: Raycaster, intersections: Intersection[]) :void{
	}

	setWireframe(wireframe: number, recursive = true) {
		this.wireframe = wireframe;
		if (recursive) {
			for (const child of this.#children) {
				child.setWireframe(wireframe, recursive);
			}
		}
	}

	set wireframe(wireframe: number | undefined) {
		this.#wireframe = wireframe;
	}

	get wireframe(): number {
		return this.#wireframe ?? this._parent?.wireframe ?? 0;
	}

	get children() {
		return this.#children;
	}

	toggleWireframe() {
		if (this.#wireframe === undefined) {
			switch (this.wireframe) {
				case 0:
					this.wireframe = 1;
					break;
				case 1:
					this.wireframe = 2;
					break;
				case 2:
					this.wireframe = 0;
					break;
			}
		} else {
			//switch (this._parent?.wireframe) {
			let target
			switch (this.wireframe) {
				case 0:
					target = 1;
					break;
				case 1:
					target = 2;
					break;
				case 2:
					target = 0;
					break;
			}
			if (this._parent?.wireframe === target) {
				this.wireframe = undefined;
			} else {
				this.wireframe = target;
			}
		}
	}

	dispose() {
		this.remove();
		EntityObserver.entityDeleted(this);
	}

	replaceMaterial(material: Material, recursive = true) {
		if (recursive) {
			for (const child of this.#children) {
				child.replaceMaterial(material, recursive);
			}
		}
	}

	resetMaterial(recursive = true) {
		if (recursive) {
			for (const child of this.#children) {
				child.resetMaterial(recursive);
			}
		}
	}

	setAttribute(attributeName: string, attributeValue: any) {
		const oldValue = this.#attributes.get(attributeName);
		this.#attributes.set(attributeName, attributeValue);

		EntityObserver.attributeChanged(this, attributeName, oldValue, attributeValue);
		this.#propagate();
	}

	getAttribute(attributeName: string, inherited = true): any {
		if (this.#attributes.has(attributeName)) {
			return this.#attributes.get(attributeName);
		}

		if (inherited && this._parent) {
			return this._parent.getAttribute(attributeName, inherited);
		}
	}

	#propagate(): void {
		this.propagate();
		for (const child of this.#children) {
			child.#propagate();
		}
	}

	propagate(): void {
	}

	copy(source: Entity) {
		//TODO: should we copy world pos / quat ?
		vec3.copy(this._position, source._position);
		quat.copy(this._quaternion, source._quaternion);
		vec3.copy(this._scale, source._scale);
	}

	getProperty(name: string): Property | undefined {
		return this.properties.get(name);
	}

	setProperty(name: string, value: Property): void {
		return this.properties.set(name, value);
	}

	setLayer(layer?: number) {
		if (Number.isNaN(Number(layer))) {
			this.#layer = undefined;
		} else {
			this.#layer = clamp(layer!, 0, LAYER_MAX);
		}
	}

	getLayer(): number | undefined {
		if (this.#layer === undefined) {
			return this._parent?.getLayer() ?? undefined;
		} else {
			return this.#layer;
		}
	}

	setMaterialParam(name: string, value: DynamicParam) {
		this.materialsParams[name] = value;
	}

	toJSON() {
		const children: any[] = [];
		for (const child of this.#children) {
			if (child.#serializable) {
				children.push(child.toJSON());
			}
		}

		const json: any = {
			constructor: (this.constructor as typeof Entity).getEntityName(),
			id: this.id,
			name: this.name
		};
		if (this.#visible !== undefined) {
			json.visible = this.#visible ? true : false;
		}
		if (!vec3.exactEquals(this._position, IDENTITY_VEC3)) {
			json.position = this.position;
		}
		if (!quat.exactEquals(this._quaternion, IDENTITY_QUAT)) {
			json.quaternion = this.quaternion;
		}
		if (!vec3.exactEquals(this._scale, UNITY_VEC3)) {
			json.scale = this.scale;
		}
		if (this.#castShadow !== undefined) {
			json.castshadow = this.#castShadow ? true : false;
		}
		if (this.#receiveShadow !== undefined) {
			json.receiveshadow = this.#receiveShadow ? true : false;
		}
		if (this.#hideInExplorer) {
			json.hideinexplorer = true;
		}
		if (this.materialsParams && Object.keys(this.materialsParams).length) {
			json.materialsparams = this.materialsParams;
		}
		if (children.length) {
			json.children = children;
		}
		if (this.wireframe !== undefined) {
			json.wireframe = this.wireframe;
		}
		if (this.#layer !== undefined) {
			json.layer = this.#layer;
		}
		return json;
	}

	static async constructFromJSON(json: JSONObject, entities: Map<string, Entity | Material>, loadedPromise: Promise<void>): Promise<Entity | null> {
		const entity = new Entity({ name: json.name as string });
		entity.fromJSON(json);
		return entity;
	}

	async createChild(entityName: string, parameters: any) {
		const entity = await JSONLoader.fromJSON({
			constructor: entityName,
			...parameters,
		});

		if (entity) {
			this.addChild(entity as Entity);
			return entity;
		}
	}

	fromJSON(json: JSONObject) {
		this.id = json.id as string ?? generateRandomUUID();
		this.#name = json.name as string;
		this.#visible = json.visible as boolean;
		if (json.position) {
			this.position = json.position as vec3;
		}
		if (json.quaternion) {
			this.quaternion = json.quaternion as quat;
		}
		if (json.scale) {
			this.scale = json.scale as vec3;
		}
		this.castShadow = json.castshadow as boolean;
		this.receiveShadow = json.receiveshadow as boolean;
		this.materialsParams = json.materialsparams as { [key: string]: DynamicParam };
		this.#hideInExplorer = json.hideinexplorer as boolean ?? false;
		this.wireframe = json.wireframe as number;
		this.#layer = json.layer as number;
	}

	static getEntityName() {
		return 'Entity';
	}

	is(s: string): boolean {
		return s == 'Entity';
	}
}
registerEntity(Entity);
