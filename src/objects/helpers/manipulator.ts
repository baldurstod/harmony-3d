import { mat4, quat, vec2, vec3, vec4 } from 'gl-matrix';
import { ShortcutHandler } from 'harmony-browser-utils';

import { Entity, LAYER_MAX } from '../../entities/entity';
import { Graphics } from '../../graphics/graphics';
import { GraphicsEvents, GraphicsEvent, GraphicMouseEventData } from '../../graphics/graphicsevents';
import { LineMaterial } from '../../materials/linematerial';
import { MATERIAL_BLENDING_NORMAL } from '../../materials/material';
import { MeshBasicMaterial } from '../../materials/meshbasicmaterial';
import { Box } from '../../primitives/box';
import { Circle } from '../../primitives/circle';
import { Cone } from '../../primitives/cone';
import { Cylinder } from '../../primitives/cylinder';
import { Plane } from '../../primitives/plane';
import { Sphere } from '../../primitives/sphere';
import { HALF_PI, PI, DEG_TO_RAD } from '../../math/constants';
import { RenderFace } from '../../materials/constants';
import { Camera } from '../../cameras/camera';
import { Scene } from '../../scenes/scene';

const ARROW_RADIUS = 0.1;
const ARROW_LENGTH = 5;
const PLANE_LENGTH = ARROW_LENGTH / 3;
const HALF_PLANE_LENGTH = PLANE_LENGTH / 2;
const TIP_LENGTH = 1;
const RADIUS = 5;

const X_COLOR = vec4.fromValues(1, 0, 0, 1);
const Y_COLOR = vec4.fromValues(0, 1, 0, 1);
const Z_COLOR = vec4.fromValues(0, 0, 1, 1);

const XY_COLOR = vec4.fromValues(1, 1, 0, 0.2);
const XZ_COLOR = vec4.fromValues(1, 0, 1, 0.2);
const YZ_COLOR = vec4.fromValues(0, 1, 1, 0.2);

const GREY_COLOR = vec4.fromValues(0.2, 0.2, 0.2, 1);

const SCREEN_COLOR = vec4.fromValues(1.0, 0.0, 1.0, 1);

const SELECTED_COLOR = vec4.fromValues(1, 1, 0, 1);

const ORIENTATION_WORLD = 0;
const ORIENTATION_OBJECT = 1;
const ORIENTATION_PARENT = 2;

const xUnitVec3 = vec3.fromValues(1, 0, 0);
const yUnitVec3 = vec3.fromValues(0, 1, 0);
const zUnitVec3 = vec3.fromValues(0, 0, 1);

const xyUnitVec3 = vec3.fromValues(1, 1, 0);
const xzUnitVec3 = vec3.fromValues(1, 0, 1);
const yzUnitVec3 = vec3.fromValues(0, 1, 1);

const tempVec3 = vec3.create();
const tempVec3_b = vec3.create();
const translationManipulatorTempQuat = quat.create();
const tempQuat = quat.create();

export const MANIPULATOR_SHORTCUT_INCREASE = 'engine.shortcuts.manipulator.size.increase';
export const MANIPULATOR_SHORTCUT_DECREASE = 'engine.shortcuts.manipulator.size.decrease';
export const MANIPULATOR_SHORTCUT_TRANSLATION = 'engine.shortcuts.manipulator.mode.translation';
export const MANIPULATOR_SHORTCUT_ROTATION = 'engine.shortcuts.manipulator.mode.rotation';
export const MANIPULATOR_SHORTCUT_SCALE = 'engine.shortcuts.manipulator.mode.scale';
export const MANIPULATOR_SHORTCUT_AXIS_ORIENTATION = 'engine.shortcuts.manipulator.axis.orientation';
export const MANIPULATOR_SHORTCUT_TOGGLE_X = 'engine.shortcuts.manipulator.toggle.x';
export const MANIPULATOR_SHORTCUT_TOGGLE_Y = 'engine.shortcuts.manipulator.toggle.y';
export const MANIPULATOR_SHORTCUT_TOGGLE_Z = 'engine.shortcuts.manipulator.toggle.z';

export enum ManipulatorMode {
	Translation = 0,
	Rotation,
	Scale
}

export class Manipulator extends Entity {
	#entityAxis = new Map();
	#xMaterial = new MeshBasicMaterial();
	#yMaterial = new MeshBasicMaterial();
	#zMaterial = new MeshBasicMaterial();
	#xyMaterial = new MeshBasicMaterial();
	#xzMaterial = new MeshBasicMaterial();
	#yzMaterial = new MeshBasicMaterial();
	#xyzMaterial = new MeshBasicMaterial();
	#xLineMaterial = new LineMaterial();
	#yLineMaterial = new LineMaterial();
	#zLineMaterial = new LineMaterial();
	#xyzLineMaterial = new LineMaterial();
	#viewLineMaterial = new LineMaterial();
	#xyzSphere = new Sphere({ radius: ARROW_RADIUS * 6.0, material: this.#xyzMaterial, segments: 32, rings: 32, name: 'Manipulator XYZ sphere' });
	#xArrow = new Cylinder({ radius: ARROW_RADIUS, height: ARROW_LENGTH, material: this.#xMaterial, name: 'Manipulator X arrow' });
	#yArrow = new Cylinder({ radius: ARROW_RADIUS, height: ARROW_LENGTH, material: this.#yMaterial, name: 'Manipulator Y arrow' });
	#zArrow = new Cylinder({ radius: ARROW_RADIUS, height: ARROW_LENGTH, material: this.#zMaterial, name: 'Manipulator Z arrow' });
	#xyPlane = new Plane({ width: PLANE_LENGTH, height: PLANE_LENGTH, material: this.#xyMaterial, name: 'Manipulator XY' });
	#xzPlane = new Plane({ width: PLANE_LENGTH, height: PLANE_LENGTH, material: this.#xzMaterial, name: 'Manipulator XZ' });
	#yzPlane = new Plane({ width: PLANE_LENGTH, height: PLANE_LENGTH, material: this.#yzMaterial, name: 'Manipulator YZ' });
	#xCircle = new Circle({ radius: RADIUS, material: this.#xLineMaterial, segments: 32, startAngle: -HALF_PI, endAngle: HALF_PI, name: 'Manipulator rotate X' });
	#yCircle = new Circle({ radius: RADIUS, material: this.#yLineMaterial, segments: 32, startAngle: -PI, endAngle: 0, name: 'Manipulator rotate Y' });
	#zCircle = new Circle({ radius: RADIUS, material: this.#zLineMaterial, segments: 32, startAngle: -HALF_PI, endAngle: HALF_PI, name: 'Manipulator rotate Z' });
	#viewCircle = new Circle({ radius: RADIUS * 1.25, material: this.#xyzLineMaterial, name: 'Manipulator rotate XYZ' });
	#circle = new Circle({ radius: RADIUS, material: this.#viewLineMaterial, name: 'Manipulator rotate view' });
	#xScale = new Cylinder({ radius: ARROW_RADIUS, height: ARROW_LENGTH, material: this.#xMaterial });
	#yScale = new Cylinder({ radius: ARROW_RADIUS, height: ARROW_LENGTH, material: this.#yMaterial });
	#zScale = new Cylinder({ radius: ARROW_RADIUS, height: ARROW_LENGTH, material: this.#zMaterial });
	#cursorPos = vec2.create();
	#axisOrientation = ORIENTATION_WORLD;
	#near = vec3.create();
	#far = vec3.create();
	#startDragPosition = vec3.create();
	#startScalePosition = vec3.create();
	#parentStartScale = vec3.create();
	#mode: ManipulatorMode = ManipulatorMode.Translation;
	enumerable = false;
	camera?: Camera;
	size = 1;
	#axis: number = 0;
	#startPosition: vec3 = vec3.create();
	#startQuaternion: quat = quat.create();
	#startLocalQuaternion: quat = quat.create();
	#startDragVector?: vec3 = vec3.create();
	#translationManipulator = new Entity({ name: 'Translation manipulator' });
	#rotationManipulator = new Entity({ name: 'Rotation manipulator' });
	#scaleManipulator = new Entity({ name: 'Scale manipulator' });
	#enableX: boolean = false;
	#enableY: boolean = false;
	#enableZ: boolean = false;

	constructor(params?: any) {
		super(params);
		this.wireframe = 0;
		this.setLayer(LAYER_MAX);
		this.hideInExplorer = true;
		this.castShadow = false;
		this.serializable = false;
		this.#initMaterials();
		this.#initTranslationManipulator();
		this.#initRotationManipulator();
		this.#initScaleManipulator();

		this.setMode(0);

		this.enableX = true;
		this.enableY = true;
		this.enableZ = true;


		this.forEach((entity) => entity.setupPickingId());

		GraphicsEvents.addEventListener(GraphicsEvent.Tick, () => this.resize((this.root as Scene)?.activeCamera));

		GraphicsEvents.addEventListener(GraphicsEvent.MouseDown, (event: CustomEvent<GraphicMouseEventData>) => {
			let detail = event.detail;
			if (this.#entityAxis.has(detail.entity)) {
				this.#axis = this.#entityAxis.get(detail.entity);
				if (this.#axis < 10) {
					this.startTranslate(detail.x, detail.y);
				} else if (this.#axis < 20) {
					this.startRotate(detail.x, detail.y);
				} else {
					this.startScale(detail.x, detail.y);
				}
				new Graphics().dragging = true;
				this.#setAxisSelected(true);
			}
		});
		GraphicsEvents.addEventListener(GraphicsEvent.MouseMove, (event: CustomEvent<GraphicMouseEventData>) => {
			let detail = event.detail;
			if (!detail.entity?.isVisible()) {
				return;
			}
			if (this.#entityAxis.has(detail.entity)) {
				if (this.#axis < 10) {
					this.#translationMoveHandler(detail.x, detail.y);
				} else if (this.#axis < 20) {
					this.#rotationMoveHandler(detail.x, detail.y);
				} else {
					this.#scaleMoveHandler(detail.x, detail.y);
				}
			}
		});
		GraphicsEvents.addEventListener(GraphicsEvent.MouseUp, (event: CustomEvent<GraphicMouseEventData>) => {
			if (this.#entityAxis.has(event.detail.entity)) {
				new Graphics().dragging = false;
				this.#setAxisSelected(false);
			}
		});

		ShortcutHandler.addEventListener(MANIPULATOR_SHORTCUT_INCREASE, event => this.size *= 1.1);
		ShortcutHandler.addEventListener(MANIPULATOR_SHORTCUT_DECREASE, event => this.size *= 0.9);
		ShortcutHandler.addEventListener(MANIPULATOR_SHORTCUT_TRANSLATION, event => this.mode = 0);
		ShortcutHandler.addEventListener(MANIPULATOR_SHORTCUT_ROTATION, event => this.mode = 1);
		ShortcutHandler.addEventListener(MANIPULATOR_SHORTCUT_SCALE, event => this.mode = 2);
		ShortcutHandler.addEventListener(MANIPULATOR_SHORTCUT_AXIS_ORIENTATION, event => this.#axisOrientation = (++this.#axisOrientation) % 2);
		ShortcutHandler.addEventListener(MANIPULATOR_SHORTCUT_TOGGLE_X, event => this.enableX = !this.enableX);
		ShortcutHandler.addEventListener(MANIPULATOR_SHORTCUT_TOGGLE_Y, event => this.enableY = !this.enableY);
		ShortcutHandler.addEventListener(MANIPULATOR_SHORTCUT_TOGGLE_Z, event => this.enableZ = !this.enableZ);
	}

	resize(camera?: Camera) {
		if (!this.isVisible()) {
			return;
		}
		let scaleFactor = 1;
		if (camera) {
			this.camera = camera;
			if (camera.isPerspective) {
				this.getWorldPosition(tempVec3);
				camera.getWorldPosition(tempVec3_b);
				scaleFactor = vec3.distance(tempVec3, tempVec3_b) * Math.min(1.9 * Math.tan(camera.verticalFov * DEG_TO_RAD), 7);
				scaleFactor *= 0.02;
			} else if (camera.isOrthographic) {
				scaleFactor = (camera.top - camera.bottom) / camera.orthoZoom;
				scaleFactor *= 0.02;
			}
			scaleFactor *= this.size;

			this.scale = vec3.set(tempVec3, scaleFactor, scaleFactor, scaleFactor);
			this.#setupAxis();
		}
	}

	#setAxisSelected(selected: boolean) {
		switch (this.#axis % 10) {
			case 1:
				this.#xMaterial.setMeshColor(selected ? SELECTED_COLOR : X_COLOR);
				this.#xLineMaterial.setMeshColor(selected ? SELECTED_COLOR : X_COLOR);
				break;
			case 2:
				this.#yMaterial.setMeshColor(selected ? SELECTED_COLOR : Y_COLOR);
				this.#yLineMaterial.setMeshColor(selected ? SELECTED_COLOR : Y_COLOR);
				break;
			case 3:
				this.#zMaterial.setMeshColor(selected ? SELECTED_COLOR : Z_COLOR);
				this.#zLineMaterial.setMeshColor(selected ? SELECTED_COLOR : Z_COLOR);
				break;
			case 4:
				this.#xyMaterial.setMeshColor(selected ? SELECTED_COLOR : XY_COLOR);
				break;
			case 5:
				this.#xzMaterial.setMeshColor(selected ? SELECTED_COLOR : XZ_COLOR);
				break;
			case 6:
				this.#yzMaterial.setMeshColor(selected ? SELECTED_COLOR : YZ_COLOR);
				break;
			case 7:
				this.#xyzLineMaterial.setMeshColor(selected ? SELECTED_COLOR : SCREEN_COLOR);
				break;
			default:

		}
	}

	#initMaterials() {
		this.#xMaterial.setMeshColor(X_COLOR);
		this.#xMaterial.setDefine('ALWAYS_ON_TOP');
		this.#yMaterial.setMeshColor(Y_COLOR);
		this.#yMaterial.setDefine('ALWAYS_ON_TOP');
		this.#zMaterial.setMeshColor(Z_COLOR);
		this.#zMaterial.setDefine('ALWAYS_ON_TOP');

		this.#xyMaterial.setMeshColor(XY_COLOR);
		this.#xyMaterial.setDefine('ALWAYS_ON_TOP');
		this.#xyMaterial.renderFace(RenderFace.Both);
		this.#xyMaterial.setBlending(MATERIAL_BLENDING_NORMAL);
		this.#xzMaterial.setMeshColor(XZ_COLOR);
		this.#xzMaterial.setDefine('ALWAYS_ON_TOP');
		this.#xzMaterial.renderFace(RenderFace.Both);
		this.#xzMaterial.setBlending(MATERIAL_BLENDING_NORMAL);
		this.#yzMaterial.setMeshColor(YZ_COLOR);
		this.#yzMaterial.setDefine('ALWAYS_ON_TOP');
		this.#yzMaterial.renderFace(RenderFace.Both);
		this.#yzMaterial.setBlending(MATERIAL_BLENDING_NORMAL);
		this.#xyzMaterial.setDefine('ALWAYS_ON_TOP');

		this.#xLineMaterial.setMeshColor(X_COLOR);
		this.#xLineMaterial.setDefine('ALWAYS_ON_TOP');
		this.#yLineMaterial.setMeshColor(Y_COLOR);
		this.#yLineMaterial.setDefine('ALWAYS_ON_TOP');
		this.#zLineMaterial.setMeshColor(Z_COLOR);
		this.#zLineMaterial.setDefine('ALWAYS_ON_TOP');
		this.#xyzLineMaterial.setMeshColor(SCREEN_COLOR);
		this.#xyzLineMaterial.setDefine('ALWAYS_ON_TOP');
		this.#viewLineMaterial.setMeshColor(GREY_COLOR);
		this.#viewLineMaterial.setDefine('ALWAYS_ON_TOP');
		this.#viewLineMaterial.lineWidth = 2;
	}

	#initTranslationManipulator() {
		this.addChild(this.#translationManipulator);

		this.#xArrow.rotateY(HALF_PI);
		this.#xArrow.translateZ(ARROW_LENGTH / 2);
		this.#yArrow.rotateX(-HALF_PI);
		this.#yArrow.translateZ(ARROW_LENGTH / 2);
		this.#zArrow.translateZ(ARROW_LENGTH / 2);

		let xTip = new Cone({ radius: ARROW_RADIUS * 2, height: TIP_LENGTH, material: this.#xMaterial, name: 'Manipulator X tip' });
		xTip.translateZ(ARROW_LENGTH / 2);
		let yTip = new Cone({ radius: ARROW_RADIUS * 2, height: TIP_LENGTH, material: this.#yMaterial, name: 'Manipulator Y tip' });
		yTip.translateZ(ARROW_LENGTH / 2);
		let zTip = new Cone({ radius: ARROW_RADIUS * 2, height: TIP_LENGTH, material: this.#zMaterial, name: 'Manipulator Z tip' });
		zTip.translateZ(ARROW_LENGTH / 2);

		this.#xyPlane.translateOnAxis([1, 1, 0], HALF_PLANE_LENGTH);
		this.#xzPlane.translateOnAxis([1, 0, 1], HALF_PLANE_LENGTH);
		this.#xzPlane.rotateX(HALF_PI);
		this.#yzPlane.translateOnAxis([0, 1, 1], HALF_PLANE_LENGTH);
		this.#yzPlane.rotateY(HALF_PI);

		this.#translationManipulator.addChild(this.#xyzSphere);

		this.#translationManipulator.addChild(this.#xArrow);
		this.#translationManipulator.addChild(this.#yArrow);
		this.#translationManipulator.addChild(this.#zArrow);
		this.#xArrow.addChild(xTip);
		this.#yArrow.addChild(yTip);
		this.#zArrow.addChild(zTip);

		this.#translationManipulator.addChild(this.#xyPlane);
		this.#translationManipulator.addChild(this.#xzPlane);
		this.#translationManipulator.addChild(this.#yzPlane);

		this.#entityAxis.set(this.#xyzSphere, 0);
		this.#entityAxis.set(this.#xArrow, 1);
		this.#entityAxis.set(xTip, 1);
		this.#entityAxis.set(this.#yArrow, 2);
		this.#entityAxis.set(yTip, 2);
		this.#entityAxis.set(this.#zArrow, 3);
		this.#entityAxis.set(zTip, 3);
		this.#entityAxis.set(this.#xyPlane, 4);
		this.#entityAxis.set(this.#xzPlane, 5);
		this.#entityAxis.set(this.#yzPlane, 6);
	}

	#initRotationManipulator() {
		this.addChild(this.#rotationManipulator);

		this.#rotationManipulator.addChild(this.#xCircle);
		this.#rotationManipulator.addChild(this.#yCircle);
		this.#rotationManipulator.addChild(this.#zCircle);
		this.#rotationManipulator.addChild(this.#viewCircle);
		this.#rotationManipulator.addChild(this.#circle);

		this.#entityAxis.set(this.#xCircle, 11);
		this.#entityAxis.set(this.#yCircle, 12);
		this.#entityAxis.set(this.#zCircle, 13);
		this.#entityAxis.set(this.#viewCircle, 17);
	}

	#initScaleManipulator() {
		this.addChild(this.#scaleManipulator);
		//let _xyzSphere = new Sphere(ARROW_RADIUS * 6.0, this.#xyzMaterial, 32, 32);

		this.#xScale.rotateY(HALF_PI);
		this.#xScale.translateZ(ARROW_LENGTH / 2);
		this.#yScale.rotateX(-HALF_PI);
		this.#yScale.translateZ(ARROW_LENGTH / 2);
		this.#zScale.translateZ(ARROW_LENGTH / 2);

		let xScaleTip = new Box({ width: TIP_LENGTH, height: TIP_LENGTH, depth: TIP_LENGTH, material: this.#xMaterial });
		xScaleTip.translateZ(ARROW_LENGTH / 2);
		let yScaleTip = new Box({ width: TIP_LENGTH, height: TIP_LENGTH, depth: TIP_LENGTH, material: this.#yMaterial });
		yScaleTip.translateZ(ARROW_LENGTH / 2);
		let zScaleTip = new Box({ width: TIP_LENGTH, height: TIP_LENGTH, depth: TIP_LENGTH, material: this.#zMaterial });
		zScaleTip.translateZ(ARROW_LENGTH / 2);

		/*this.#xyPlane = new Plane(PLANE_LENGTH, PLANE_LENGTH, this.#xyMaterial);
		this.#xyPlane.translateOnAxis([1, 1, 0], HALF_PLANE_LENGTH);
		this.#xzPlane = new Plane(PLANE_LENGTH, PLANE_LENGTH, this.#xzMaterial);
		this.#xzPlane.translateOnAxis([1, 0, 1], HALF_PLANE_LENGTH);
		this.#xzPlane.rotateX(HALF_PI);
		this.#yzPlane = new Plane(PLANE_LENGTH, PLANE_LENGTH, this.#yzMaterial);
		this.#yzPlane.translateOnAxis([0, 1, 1], HALF_PLANE_LENGTH);
		this.#yzPlane.rotateY(HALF_PI);*/

		//scaleManipulator.addChild(_xyzSphere);

		this.#scaleManipulator.addChild(this.#xScale);
		this.#scaleManipulator.addChild(this.#yScale);
		this.#scaleManipulator.addChild(this.#zScale);
		this.#xScale.addChild(xScaleTip);
		this.#yScale.addChild(yScaleTip);
		this.#zScale.addChild(zScaleTip);

		/*this.addChild(this.#xyPlane);
		this.addChild(this.#xzPlane);
		this.addChild(this.#yzPlane);*/

		//this.#entityAxis.set(_xyzSphere, 20);
		this.#entityAxis.set(this.#xScale, 21);
		this.#entityAxis.set(xScaleTip, 21);
		this.#entityAxis.set(this.#yScale, 22);
		this.#entityAxis.set(yScaleTip, 22);
		this.#entityAxis.set(this.#zScale, 23);
		this.#entityAxis.set(zScaleTip, 23);
	}

	startTranslate(x: number, y: number) {
		if (this._parent) {
			this._parent.getWorldPosition(this.#startPosition);
		} else {
			this.getWorldPosition(this.#startPosition);
		}
		this.#computeTranslationPosition(this.#startDragPosition, x, y);
	}

	startRotate(x: number, y: number) {
		if (this._parent) {
			this._parent.getWorldQuaternion(this.#startQuaternion);
			this._parent.getQuaternion(this.#startLocalQuaternion);
		} else {
			this.getWorldQuaternion(this.#startQuaternion);
			this.getQuaternion(this.#startLocalQuaternion);
		}
		this.#startDragVector = this.#computeQuaternion(x, y);
	}

	startScale(x: number, y: number) {
		let startScalePosition = this.#startScalePosition;
		if (this._parent) {
			this._parent.getWorldPosition(this.#startPosition);
		} else {
			this.getWorldPosition(this.#startPosition);
		}
		this.#computeTranslationPosition(this.#startScalePosition, x, y);
		vec3.div(startScalePosition, startScalePosition, this.scale);
		vec3.scale(startScalePosition, startScalePosition, 2 / ARROW_LENGTH);
		if (this._parent) {
			vec3.copy(this.#parentStartScale, this._parent._scale);
		}
	}

	#translationMoveHandler(x: number, y: number) {
		this.#computeTranslationPosition(tempVec3, x, y);

		vec3.sub(tempVec3, tempVec3, this.#startDragPosition);
		switch (this.#axis) {
			case 0:
				break;
			case 1:
				tempVec3[1] = 0;
				tempVec3[2] = 0;
				break;
			case 2:
				tempVec3[0] = 0;
				tempVec3[2] = 0;
				break;
			case 3:
				tempVec3[0] = 0;
				tempVec3[1] = 0;
				break;
			case 4:
				tempVec3[2] = 0;
				break;
			case 5:
				tempVec3[1] = 0;
				break;
			case 6:
				tempVec3[0] = 0;
				break;
			default:
				tempVec3[0] = 0;
				tempVec3[1] = 0;
				tempVec3[2] = 0;
		}
		vec3.transformQuat(tempVec3, tempVec3, this.getWorldQuaternion());

		vec3.add(tempVec3, this.#startPosition, tempVec3);
		if (this._parent) {
			this._parent.setWorldPosition(tempVec3);
			this._parent.locked = true;
		} else {
			this.setWorldPosition(tempVec3);
		}
	}

	#rotationMoveHandler(x: number, y: number) {//TODO: rename this func
		let v3 = this.#computeQuaternion(x, y);
		quat.rotationTo(translationManipulatorTempQuat, this.#startDragVector, v3);
		quat.mul(translationManipulatorTempQuat, this.#startLocalQuaternion, translationManipulatorTempQuat);
		if (this._parent) {
			this._parent.quaternion = translationManipulatorTempQuat;
			this._parent.locked = true;
		} else {
			this.quaternion = translationManipulatorTempQuat;
		}
	}

	#scaleMoveHandler(x: number, y: number) {
		let v3 = this.#computeTranslationPosition(tempVec3, x, y);
		if (!v3) {
			return;
		}

		//vec3.sub(v3, v3, this.#startScalePosition);
		vec3.div(v3, v3, this.scale);
		vec3.div(v3, v3, this.#startScalePosition);
		vec3.scale(v3, v3, 2 / ARROW_LENGTH);

		switch (this.#axis) {
			case 20:
				break;
			case 21:
				v3[1] = 1;
				v3[2] = 1;
				break;
			case 22:
				v3[0] = 1;
				v3[2] = 1;
				break;
			case 23:
				v3[0] = 1;
				v3[1] = 1;
				break;
			default:
				v3[0] = 1;
				v3[1] = 1;
				v3[2] = 1;
		}

		if (this._parent) {
			this._parent.scale = vec3.mul(v3, v3, this.#parentStartScale);
			this._parent.locked = true;
		}
	}

	#computeTranslationPosition(out: vec3, x: number, y: number) {
		let camera = this.camera;
		if (camera) {
			let projectionMatrix = camera.projectionMatrix;
			let viewMatrix = camera.cameraMatrix;
			let nearPlane = camera.nearPlane;
			let farPlane = camera.farPlane;
			let aspectRatio = camera.aspectRatio;

			let invProjectionMatrix = mat4.invert(mat4.create(), projectionMatrix);
			let invViewMatrix = mat4.invert(mat4.create(), viewMatrix);

			// transform the screen coordinates to normalized coordinates
			this.#cursorPos[0] = (x / new Graphics().getWidth()) * 2.0 - 1.0;
			this.#cursorPos[1] = 1.0 - (y / new Graphics().getHeight()) * 2.0;

			this.#near[0] = this.#far[0] = this.#cursorPos[0];
			this.#near[1] = this.#far[1] = this.#cursorPos[1];
			this.#near[2] = -1.0;
			this.#far[2] = 1.0;

			vec3.transformMat4(this.#near, this.#near, invProjectionMatrix);
			vec3.transformMat4(this.#far, this.#far, invProjectionMatrix);

			vec3.transformMat4(this.#near, this.#near, invViewMatrix);
			vec3.transformMat4(this.#far, this.#far, invViewMatrix);

			function lineIntersection(out: vec3, planePoint: vec3, planeNormal: vec3, linePoint: vec3, lineDirection: vec3) {
				if (vec3.dot(planeNormal, lineDirection) == 0) {
					return vec3.create();//TODO: optimize
				}

				let t = (vec3.dot(planeNormal, planePoint) - vec3.dot(planeNormal, linePoint)) / vec3.dot(planeNormal, lineDirection);
				return vec3.scaleAndAdd(out, linePoint, lineDirection, t);
			}

			let angle;
			let planeNormal = vec3.create();
			switch (this.#axis % 10) {
				case 1:
					planeNormal = vec3.transformQuat(planeNormal, xUnitVec3, this.getWorldQuaternion());
					break;
				case 2:
					planeNormal = vec3.transformQuat(planeNormal, yUnitVec3, this.getWorldQuaternion());
					break;
				case 3:
					planeNormal = vec3.transformQuat(planeNormal, zUnitVec3, this.getWorldQuaternion());
					break;
				case 4:
					planeNormal = vec3.transformQuat(planeNormal, xyUnitVec3, this.getWorldQuaternion());
					break;
				case 5:
					planeNormal = vec3.transformQuat(planeNormal, xzUnitVec3, this.getWorldQuaternion());
					break;
				case 6:
					planeNormal = vec3.transformQuat(planeNormal, yzUnitVec3, this.getWorldQuaternion());
					break;
				default:
					planeNormal = vec3.sub(vec3.create(), this.#far, this.#near);
					break;
			}

			/********************/
			let worldPos = this._parent ? this._parent.getWorldPosition() : this.getWorldPosition();
			let A = worldPos;//vec3.clone(this._parent.position) : vec3.clone(this.position);
			let B = vec3.add(vec3.create(), A, planeNormal);
			let P = camera.position;
			let AP = vec3.sub(vec3.create(), P, A);//P-A;
			let AB = vec3.sub(vec3.create(), B, A);//B-A;

			let projPoint = vec3.add(vec3.create(), A, vec3.scale(AB, AB, vec3.dot(AP, AB) / vec3.dot(AB, AB)));


			planeNormal = vec3.sub(vec3.create(), projPoint, camera.position);
			vec3.normalize(planeNormal, planeNormal);

			if (this.#axis == 0 || this.#axis == 20) {
				vec3.transformQuat(planeNormal, vec3.fromValues(0, 0, 1), camera.quaternion);
			}

			/********************/
			lineIntersection(out, worldPos, planeNormal, this.#near, vec3.sub(vec3.create(), this.#far, this.#near));

			quat.invert(translationManipulatorTempQuat, this.getWorldQuaternion());
			vec3.transformQuat(out, out, translationManipulatorTempQuat);
			return out;
		}
	}

	#computeQuaternion(x: number, y: number) {
		let camera = this.camera;
		if (camera) {
			let projectionMatrix = camera.projectionMatrix;
			let viewMatrix = camera.cameraMatrix;
			let nearPlane = camera.nearPlane;
			let farPlane = camera.farPlane;
			let aspectRatio = camera.aspectRatio;

			let invProjectionMatrix = mat4.invert(mat4.create(), projectionMatrix);
			let invViewMatrix = mat4.invert(mat4.create(), viewMatrix);

			this.#cursorPos[0] = (x / new Graphics().getWidth()) * 2.0 - 1.0;
			this.#cursorPos[1] = 1.0 - (y / new Graphics().getHeight()) * 2.0;

			this.#near[0] = this.#far[0] = this.#cursorPos[0];
			this.#near[1] = this.#far[1] = this.#cursorPos[1];
			this.#near[2] = -1.0;
			this.#far[2] = 1.0;

			vec3.transformMat4(this.#near, this.#near, invProjectionMatrix);
			vec3.transformMat4(this.#far, this.#far, invProjectionMatrix);

			vec3.transformMat4(this.#near, this.#near, invViewMatrix);
			vec3.transformMat4(this.#far, this.#far, invViewMatrix);

			function lineIntersection(planePoint: vec3, planeNormal: vec3, linePoint: vec3, lineDirection: vec3) {
				if (vec3.dot(planeNormal, lineDirection) == 0) {
					return vec3.create();//TODO: optimize
				}

				let t = (vec3.dot(planeNormal, planePoint) - vec3.dot(planeNormal, linePoint)) / vec3.dot(planeNormal, lineDirection);
				return vec3.scaleAndAdd(vec3.create(), linePoint, lineDirection, t);//TODO: optimize pass vec3 as param
			}

			let angle;
			let v4;
			let planeNormal = vec3.create();

			if (this.#axisOrientation == ORIENTATION_WORLD) {
				switch (this.#axis) {
					case 11:
						planeNormal = vec3.copy(planeNormal, xUnitVec3);
						break;
					case 12:
						planeNormal = vec3.copy(planeNormal, yUnitVec3);
						break;
					case 13:
						planeNormal = vec3.copy(planeNormal, zUnitVec3);
						break;
					default:
						this.getPositionFrom(camera, planeNormal);
						planeNormal = vec3.normalize(planeNormal, planeNormal);
						break;
				}
			} else {
				switch (this.#axis) {
					case 11:
						planeNormal = vec3.transformQuat(planeNormal, xUnitVec3, this.#startQuaternion);
						break;
					case 12:
						planeNormal = vec3.transformQuat(planeNormal, yUnitVec3, this.#startQuaternion);
						break;
					case 13:
						planeNormal = vec3.transformQuat(planeNormal, zUnitVec3, this.#startQuaternion);
						break;
					default:
						planeNormal = vec3.sub(vec3.create()/*TODO: optimize*/, this.#far, this.#near);
						break;
				}
			}

			let worldPos = this._parent ? this._parent.getWorldPosition() : this.getWorldPosition();
			v4 = lineIntersection(worldPos, planeNormal, this.#near, vec3.sub(vec3.create(), this.#far, this.#near));
			if (!v4) {
				return vec3.create();//TODO: optimize
			}

			vec3.sub(v4, v4, worldPos);
			quat.invert(translationManipulatorTempQuat, this.#startQuaternion);
			vec3.transformQuat(v4, v4, translationManipulatorTempQuat);
			vec3.normalize(v4, v4);
			return v4;
		}
	}

	setCamera(camera: Camera) {
		this.camera = camera;
	}

	/**
	 * @deprecated Please use `setMode` instead.
	 */
	set mode(mode: ManipulatorMode) {
		console.warn('deprecated, use setMode()');
		this.setMode(mode);
	}

	setMode(mode: ManipulatorMode) {
		this.#translationManipulator.setVisible(false);
		this.#rotationManipulator.setVisible(false);
		this.#scaleManipulator.setVisible(false);
		this.#setAxisSelected(false);
		new Graphics().dragging = false;

		this.#mode = mode;
		switch (mode) {
			case 0:
				this.#translationManipulator.setVisible(undefined);
				break;
			case 1:
				this.#rotationManipulator.setVisible(undefined);
				break;
			case 2:
				this.#scaleManipulator.setVisible(undefined);
				break;
			default:

		}

		this.#setAxisSelected(false);
	}

	set axisOrientation(axisOrientation: number) {
		this.#axisOrientation = axisOrientation;
	}

	getWorldQuaternion(q = quat.create()) {
		if (this.#mode < 2) {
			switch (this.#axisOrientation) {
				case ORIENTATION_WORLD:
					quat.identity(q);
					break;
				default:
					super.getWorldQuaternion(q);
			}
		} else {
			super.getWorldQuaternion(q);
		}
		/*if (this._parent !== null) {
			this._parent.getWorldQuaternion(q);
			quat.mul(q, q, this._quaternion);
		} else {
			quat.copy(q, this._quaternion);
		}*/
		return q;
	}

	getWorldScale(vec = vec3.create()) {
		return vec3.copy(vec, this._scale);
	}

	set enableX(enableX) {
		this.#enableX = enableX;
		let enable = enableX ? undefined : false;
		this.#xArrow.setVisible(enable);
		this.#xCircle.setVisible(enable);
		this.#xScale.setVisible(enable);
	}

	get enableX() {
		return this.#enableX;
	}

	set enableY(enableY) {
		this.#enableY = enableY;
		let enable = enableY ? undefined : false;
		this.#yArrow.setVisible(enable);
		this.#yCircle.setVisible(enable);
		this.#yScale.setVisible(enable);
	}

	get enableY() {
		return this.#enableY;
	}

	set enableZ(enableZ) {
		this.#enableZ = enableZ;
		let enable = enableZ ? undefined : false;
		this.#zArrow.setVisible(enable);
		this.#zCircle.setVisible(enable);
		this.#zScale.setVisible(enable);
	}

	get enableZ() {
		return this.#enableZ;
	}

	#setupAxis() {
		const camera = this.camera;

		if (!camera) {
			return;
		}

		this.getWorldQuaternion(translationManipulatorTempQuat);
		quat.invert(translationManipulatorTempQuat, translationManipulatorTempQuat);
		this.getPositionFrom(camera, tempVec3);
		vec3.normalize(tempVec3, tempVec3);
		vec3.transformQuat(tempVec3, tempVec3, translationManipulatorTempQuat);
		this.#circle.quaternion = quat.rotationTo(tempQuat, zUnitVec3, tempVec3);
		this.#viewCircle.quaternion = tempQuat;

		this.#xCircle.quaternion = quat.setAxisAngle(tempQuat, xUnitVec3, Math.atan2(tempVec3[1], -tempVec3[2]));
		this.#yCircle.quaternion = quat.setAxisAngle(tempQuat, yUnitVec3, Math.atan2(tempVec3[0], tempVec3[2]));
		this.#zCircle.quaternion = quat.setAxisAngle(tempQuat, zUnitVec3, Math.atan2(tempVec3[1], tempVec3[0]));
		this.#xCircle.rotateY(HALF_PI);
		this.#yCircle.rotateX(-HALF_PI);

	}
}

//Set default shortcuts
ShortcutHandler.setShortcuts(
	'3dview,scene-explorer',
	new Map(
		[
			[MANIPULATOR_SHORTCUT_INCREASE, 'PLUS'],
			[MANIPULATOR_SHORTCUT_DECREASE, '-'],
			[MANIPULATOR_SHORTCUT_TRANSLATION, 'ALT+T'],
			[MANIPULATOR_SHORTCUT_ROTATION, 'ALT+R'],
			[MANIPULATOR_SHORTCUT_SCALE, 'ALT+S'],
			[MANIPULATOR_SHORTCUT_AXIS_ORIENTATION, 'ALT+O'],
			[MANIPULATOR_SHORTCUT_TOGGLE_X, 'ALT+X'],
			[MANIPULATOR_SHORTCUT_TOGGLE_Y, 'ALT+Y'],
			[MANIPULATOR_SHORTCUT_TOGGLE_Z, 'ALT+Z'],
		]
	)
);
