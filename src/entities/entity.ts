import { mat3, mat4, quat, vec3 } from 'gl-matrix';

import { EntityObserver } from './entityobserver';
import { pickList } from './picklist';

import { DEBUG, VERBOSE } from '../buildoptions';
import { JSONLoader } from '../loaders/jsonloader';
import { BoundingBox } from '../math/boundingbox';
import { DEG_TO_RAD } from '../math/constants';
import { generateRandomUUID } from '../math/functions';
import { stringToVec3, stringToQuat } from '../utils/utils';
import { registerEntity } from './entities';

const X_VECTOR = vec3.fromValues(1, 0, 0);
const Y_VECTOR = vec3.fromValues(0, 1, 0);
const Z_VECTOR = vec3.fromValues(0, 0, 1);

const tempVec3_1 = vec3.create();
const tempVec3_2 = vec3.create();
const tempVec3_3 = vec3.create();
const tempVec3_4 = vec3.create();
const tempQuat = quat.create();
const tempQuat2 = quat.create();
const tempMat4 = mat4.create();
const _upVector = vec3.fromValues(0, 0, 1);

let incrementalPickingId = 0;

export const IDENTITY_QUAT = quat.create();
export const IDENTITY_VEC3 = vec3.create();
export const UNITY_VEC3 = vec3.fromValues(1, 1, 1);

export class Entity {
	static addSubMenu: any;
	id = generateRandomUUID();
	#wireframe;
	#hideInExplorer = false;
	#serializable = true;
	#castShadow;
	#receiveShadow;
	#visible: boolean;
	#playing = true;
	#worldMatrix = mat4.create();
	#name: string;
	#children: Set<Entity> = new Set();
	#attributes = new Map();
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
	materialsParams: any = {};
	isRenderable = false;
	lockPos = false;
	lockRot = false;
	lockScale = false;
	drawOutline = false;

	constructor(params?: any) {
		this.setParameters(params);
	}

	setParameters(parameters?: any) {
		if (!parameters) {
			return;
		}

		if (parameters.name) {
			this.#name = parameters.name;
		}
		if (parameters.parent) {
			this.parent = parameters.parent;
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
		this.#name = name;
		EntityObserver.propertyChanged(this, 'name', name);
	}

	get name() {
		return this.#name;
	}

	setPosition(position: vec3) {
		vec3.copy(this._position, position);
		EntityObserver.propertyChanged(this, 'position', this._position);
	}

	getPosition(position: vec3 = vec3.create()) {
		return vec3.copy(position, this._position);
	}

	set position(position: vec3) {
		// TODO: deprecate
		this.setPosition(position);
	}

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

	setWorldPosition(position) {
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

	setWorldQuaternion(quaternion) {
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

	set quaternion(quaternion) {
		quat.normalize(this._quaternion, quaternion);
		EntityObserver.propertyChanged(this, 'quaternion', this._quaternion);
	}

	get quaternion() {
		return quat.clone(this._quaternion);
	}

	get quaternionAsString() {
		return `${this._quaternion[0].toFixed(2)} ${this._quaternion[1].toFixed(2)} ${this._quaternion[2].toFixed(2)} ${this._quaternion[3].toFixed(2)}`;
	}

	set scale(scale) {
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

	render(canvas) {
	}

	get transparent() {
		return false;
	}

	setVisible(visible) {
		this.#visible = visible;
		EntityObserver.propertyChanged(this, 'visible', visible);
	}

	set visible(visible) {
		this.setVisible(visible);
	}

	isVisible() {
		if (this.#visible === undefined) {
			return this._parent?.isVisible() ?? true;
		} else {
			return this.#visible;
		}
	}

	get visible() {
		return this.isVisible();
	}

	get visibleSelf() {
		return this.#visible;
	}

	toggleVisibility() {
		if (this.#visible === undefined) {
			if (this.visible) {
				this.setVisible(false);
			} else {
				this.setVisible(true);
			}
		} else if (this.#visible === true) {
			if (this._parent) {
				if (this._parent.visible) {
					this.setVisible(false);
				} else {
					this.setVisible(undefined);
				}
			} else {
				this.setVisible(false);
			}
		} else { // false
			if (this._parent) {
				if (this._parent.visible) {
					this.setVisible(undefined);
				} else {
					this.setVisible(true);
				}
			} else {
				this.setVisible(undefined);
			}
		}
		EntityObserver.propertyChanged(this, 'visible', this.#visible);
	}

	setPlaying(playing) {
		this.#playing = playing;
		EntityObserver.propertyChanged(this, 'playing', playing);
	}

	isPlaying() {
		return this.#playing;
	}

	togglePlaying() {
		this.setPlaying(!this.#playing);
	}

	do(action: string, params?: any) { }

	setParent(parent: Entity | null) {
		EntityObserver.parentChanged(this, this._parent, parent);
		if (this._parent != null) {
			this._parent.removeChild(this);
		}
		if (this._parent != parent) {
			this._parent = parent;
		}
		this.propagate();
		this.parentChanged(parent);
	}

	parentChanged(parent: Entity | null) { }

	*getParentIterator() {
		const ws = new WeakSet();

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
			this.setParent(null);
		}
	}

	removeThis() {
		for (let child of this.#children) {
			child.parent = this.parent;
		}
		this.remove();
	}

	removeChildren() {
		for (let child of this.#children) {
			child.remove();
		}
	}

	disposeChildren() {
		for (let child of this.#children) {
			child.dispose();
		}
	}

	removeSiblings() {
		if (this._parent != null) {
			for (let child of this._parent.#children) {
				if (child !== this) {
					child.remove();
				}
			}
		}
	}

	removeSimilarSiblings() {
		if (this._parent != null) {
			let constructorName = this.constructor.name;
			for (let child of this._parent.#children) {
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
		let currentEntity = this;
		let parent;
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

	addChild(child) {
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
		child.setParent(this);
		return child;
	}

	addChilds(...childs) {
		childs.forEach(child => this.addChild(child));
	}

	isParent(parent) {
		let _parent = this._parent;
		if (_parent) {
			if (_parent === parent) {
				return true;
			} else {
				return _parent.isParent(parent);
			}
		}
		return false;
	}

	removeChild(child) {
		if (this.#children.has(child)) {
			this.#children.delete(child);
			child.setParent();
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
	translate(v) {
		vec3.add(tempVec3_1, this._position, v);
		this.position = tempVec3_1;
	}
	translateOnAxis(axis, distance) {
		vec3.transformQuat(tempVec3_1, axis, this._quaternion);
		vec3.scaleAndAdd(tempVec3_1, this._position, tempVec3_1, distance);
		this.position = tempVec3_1;
		return this;
	}
	translateX(distance) {//TODO: optimize inline
		return this.translateOnAxis(X_VECTOR, distance);
	}
	translateY(distance) {
		return this.translateOnAxis(Y_VECTOR, distance);
	}
	translateZ(distance) {
		return this.translateOnAxis(Z_VECTOR, distance);
	}
	rotateX(rad) {
		quat.rotateX(this._quaternion, this._quaternion, rad);
	}
	rotateY(rad) {
		quat.rotateY(this._quaternion, this._quaternion, rad);
	}
	rotateZ(rad) {
		quat.rotateZ(this._quaternion, this._quaternion, rad);
	}

	rotateGlobalX(rad) {
		quat.rotateX(tempQuat, IDENTITY_QUAT, rad);
		quat.mul(this._quaternion, tempQuat, this._quaternion);
	}

	rotateGlobalY(rad) {
		quat.rotateY(tempQuat, IDENTITY_QUAT, rad);
		quat.mul(this._quaternion, tempQuat, this._quaternion);
	}

	rotateGlobalZ(rad) {
		quat.rotateZ(tempQuat, IDENTITY_QUAT, rad);
		quat.mul(this._quaternion, tempQuat, this._quaternion);
	}

	/**
	 * Makes this object look at the specified location.
	 *
	 * @param {Float32Array(3)} target Point in space to look at.
	 *
	 * @return {void}.
	 */
	lookAt(target, upVector = undefined) {
		let parent = this._parent;
		mat4.lookAt(tempMat4, this._position, target, upVector ?? _upVector);
		mat4.getRotation(tempQuat, tempMat4);
		quat.invert(tempQuat, tempQuat);


		if (parent) {
			quat.conjugate(tempQuat2, parent._quaternion);
			quat.mul(tempQuat, tempQuat2, tempQuat);
		}
		this.quaternion = tempQuat;
	}

	getMeshList() {
		let meshList = new Set();
		const treated = new WeakSet();

		let currentEntity: Entity | undefined = this;
		let objectStack: Entity[] = [];

		while (currentEntity) {
			if (currentEntity.isRenderable && (currentEntity.visible !== false)) {
				meshList.add(currentEntity);
			}
			for (let child of currentEntity.#children) {
				if (!treated.has(child)) {
					objectStack.push(child);
					treated.add(child);
				}
			}
			currentEntity = objectStack.shift();
		}
		return meshList;
	}

	showOutline(show, color) {
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

	getAllChilds(includeSelf) {
		let ws = new WeakSet();
		let childs = new Set();
		let objectStack: Entity[] = [];

		let currentEntity: Entity | undefined = this;
		if (includeSelf) {
			childs.add(this);
		}

		while (currentEntity) {
			for (let child of currentEntity.#children) {
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
			for (let child of this.#children) {
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
		let childBoundingBox = new BoundingBox();
		for (let child of this.#children) {
			boundingBox.addBoundingBox(child.getBoundingBox(childBoundingBox));
		}
		return boundingBox;
	}

	getParentModel() {
		return this._parent?.getParentModel();
	}

	getChildsList(type, list = new Set()) {
		throw 'Error : use getChildList instead';
		if (this instanceof type) {
			list.add(this);
		}
		for (let child of this.#children) {
			child.getChildsList(type, list);
		}
		return list;
	}

	getChildList(type) {
		let ws = new WeakSet();
		let childs: Set<Entity> = new Set();
		let objectStack: Entity[] = [];

		let currentEntity: Entity | undefined = this;
		while (currentEntity) {
			for (let child of currentEntity.#children) {
				if (!ws.has(child) && child.enumerable) {
					objectStack.push(child);
					ws.add(child);
				}
			}
			if (type === undefined || currentEntity instanceof type) {
				childs.add(currentEntity);
			}
			currentEntity = objectStack.shift();
		}
		return childs;
	}

	forEach(callback) {
		callback(this);
		for (let child of this.#children) {
			child.forEach(callback);
		}
	}

	forEachVisible(callback) {
		if (this.#visible) {
			callback(this);
			for (let child of this.#children) {
				child.forEach(callback);
			}
		}
	}

	forEachParent(callback) {
		let parent = this._parent;
		if (parent) {
			callback(parent);
			parent.forEachParent(callback);
		}
	}

	setupPickingId() {
		let pickingId = ++incrementalPickingId;
		pickList.set(pickingId, this);
		this.#pickingColor = vec3.fromValues(((pickingId >> 16) & 0xFF) / 255.0, ((pickingId >> 8) & 0xFF) / 255.0, ((pickingId >> 0) & 0xFF) / 255.0);
	}

	get pickingColor() {
		return this.#pickingColor ?? this._parent?.pickingColor;
	}

	update(scene, camera, delta) {
	}

	set castShadow(castShadow) {
		this.#castShadow = castShadow;
	}

	get castShadow() {
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

	set receiveShadow(receiveShadow) {
		this.#receiveShadow = receiveShadow;
	}

	get receiveShadow() {
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
		let menu = {
			visibility: { i18n: '#visibility', selected: this.visible, f: () => this.toggleVisibility() },

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
			name: { i18n: '#name', f: () => { let n = prompt('Name', this.name); if (n !== null) { this.name = n; } } },
			add: { i18n: '#add', submenu: Entity.addSubMenu },
			entitynull_1: null,
			position: { i18n: '#position', f: () => { let v = prompt('Position', this.position.join(' ')); if (v !== null) { this.lockPos = true; this.position = stringToVec3(v); } } },
			translate: { i18n: '#translate', f: () => { let t = prompt('Translation', '0 0 0'); if (t !== null) { this.lockPos = true; this.translate(stringToVec3(t)); } } },
			reset_position: { i18n: '#reset_position', f: () => this.position = IDENTITY_VEC3 },
			entitynull_2: null,
			quaternion: { i18n: '#quaternion', f: () => { let v = prompt('Quaternion', this.quaternion.join(' ')); if (v !== null) { this.lockRot = true; this.quaternion = stringToQuat(v); } } },
			rotate: {
				i18n: '#rotate', submenu: [
					{ i18n: '#rotate_x_global', f: () => { let r = Number(prompt('Rotation around X global', '0')); if (r !== null) { this.lockRot = true; this.rotateGlobalX(r * DEG_TO_RAD); } } },
					{ i18n: '#rotate_y_global', f: () => { let r = Number(prompt('Rotation around Y global', '0')); if (r !== null) { this.lockRot = true; this.rotateGlobalY(r * DEG_TO_RAD); } } },
					{ i18n: '#rotate_z_global', f: () => { let r = Number(prompt('Rotation around Z global', '0')); if (r !== null) { this.lockRot = true; this.rotateGlobalZ(r * DEG_TO_RAD); } } },
					{ i18n: '#rotate_x', f: () => { let r = Number(prompt('Rotation around X', '0')); if (r !== null) { this.lockRot = true; this.rotateX(r * DEG_TO_RAD); } } },
					{ i18n: '#rotate_y', f: () => { let r = Number(prompt('Rotation around Y', '0')); if (r !== null) { this.lockRot = true; this.rotateY(r * DEG_TO_RAD); } } },
					{ i18n: '#rotate_z', f: () => { let r = Number(prompt('Rotation around Z', '0')); if (r !== null) { this.lockRot = true; this.rotateZ(r * DEG_TO_RAD); } } },
				]
			},
			reset_rotation: { i18n: '#reset_rotation', f: () => this.quaternion = IDENTITY_QUAT },
			entitynull_3: null,
			scale: {
				i18n: '#scale', f: () => {
					let s = prompt('Scale', this.scale.join(' ')); if (s !== null) {
						let arr = s.split(' ');
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
			wireframe: { i18n: '#wireframe', selected: this.wireframe, f: () => this.toggleWireframe() },
			cast_shadows: { i18n: '#cast_shadows', selected: this.castShadow, f: () => this.toggleCastShadow() },
			receive_shadows: { i18n: '#receive_shadows', selected: this.receiveShadow, f: () => this.toggleReceiveShadow() },
			material: { i18n: '#material', submenu: {} },
		};
		/*
		if (this.material) {
			Object.assign(menu.material.submenu, {
				entitynull_5: null,
				edit_material: { i18n: '#edit_material', f: () => Entity.editMaterial(this) }
			})
		}
			*/
		return menu;
	}

	raycast(raycaster, intersections) {
	}

	setWireframe(wireframe, recursive = true) {
		this.wireframe = wireframe;
		if (recursive) {
			for (let child of this.#children) {
				child.setWireframe(wireframe, recursive);
			}
		}
	}

	set wireframe(wireframe) {
		this.#wireframe = wireframe;
	}

	get wireframe() {
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

	replaceMaterial(material, recursive = true) {
		if (recursive) {
			for (let child of this.#children) {
				child.replaceMaterial(material, recursive);
			}
		}
	}

	resetMaterial(recursive = true) {
		if (recursive) {
			for (let child of this.#children) {
				child.resetMaterial(recursive);
			}
		}
	}

	getAttachement() {
	}

	setAttribute(attributeName, attributeValue) {
		this.#attributes.set(attributeName, attributeValue);
		this.propagate();
	}

	getAttribute(attributeName, inherited = true) {
		if (this.#attributes.has(attributeName)) {
			return this.#attributes.get(attributeName);
		}

		if (inherited && this._parent) {
			return this._parent.getAttribute(attributeName, inherited);
		}
	}

	propagate() {
		for (let child of this.#children) {
			child.propagate();
		}
	}

	copy(source) {
		//TODO: should we copy world pos / quat ?
		vec3.copy(this._position, source._position);
		quat.copy(this._quaternion, source._quaternion);
		vec3.copy(this._scale, source._scale);
	}

	toJSON() {
		let children: any[] = [];
		for (let child of this.#children) {
			if (child.#serializable) {
				children.push(child.toJSON());
			}
		}

		let json: any = {
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
		return json;
	}

	static async constructFromJSON(json, entities, loadedPromise) {
		let entity = new Entity({ name: json.name });
		entity.fromJSON(json);
		return entity;
	}

	async createChild(entityName, parameters) {
		const entity = await JSONLoader.fromJSON({
			constructor: entityName,
			...parameters,
		});

		if (entity) {
			this.addChild(entity);
			return entity;
		}
	}

	fromJSON(json) {
		this.id = json.id ?? generateRandomUUID();
		this.#name = json.name;
		this.#visible = json.visible;
		if (json.position) {
			this.position = json.position;
		}
		if (json.quaternion) {
			this.quaternion = json.quaternion;
		}
		if (json.scale) {
			this.scale = json.scale;
		}
		this.castShadow = json.castshadow;
		this.receiveShadow = json.receiveshadow;
		this.materialsParams = json.materialsparams;
		this.#hideInExplorer = json.hideinexplorer ?? false;
		this.wireframe = json.wireframe;
	}

	static getEntityName() {
		return 'Entity';
	}

	is(s: string): boolean {
		return s == 'Entity';
	}
}
registerEntity(Entity);
