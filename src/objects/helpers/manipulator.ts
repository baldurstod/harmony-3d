import { mat4, quat, vec2, vec3, vec4 } from 'gl-matrix';
import { ShortcutHandler } from 'harmony-browser-utils';

import { Camera } from '../../cameras/camera';
import { EngineEntityAttributes, Entity, LAYER_MAX } from '../../entities/entity';
import { Graphics } from '../../graphics/graphics2';
import { GraphicMouseEventData, GraphicsEvent, GraphicsEvents } from '../../graphics/graphicsevents';
import { RenderFace } from '../../materials/constants';
import { LineMaterial } from '../../materials/linematerial';
import { MATERIAL_BLENDING_NORMAL } from '../../materials/material';
import { MeshBasicMaterial } from '../../materials/meshbasicmaterial';
import { DEG_TO_RAD, HALF_PI, PI } from '../../math/constants';
import { Box } from '../../primitives/box';
import { Circle } from '../../primitives/circle';
import { Cone } from '../../primitives/cone';
import { Cylinder } from '../../primitives/cylinder';
import { Plane } from '../../primitives/plane';
import { Sphere } from '../../primitives/sphere';
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

export enum ManipulatorAxis {
	None = 0,
	X,
	Y,
	Z,
	XY,
	XZ,
	YZ,
	XYZ,
	View,
}

export class Manipulator extends Entity {
	#entityAxis = new Map<Entity, ManipulatorAxis>();
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
	#axisOrientation = ORIENTATION_WORLD;// TODO: create enum
	#near = vec3.create();
	#far = vec3.create();
	#startDragPosition = vec3.create();
	#startScalePosition = vec3.create();
	#parentStartScale = vec3.create();
	#mode: ManipulatorMode = ManipulatorMode.Translation;
	enumerable = false;
	camera?: Camera;
	size = 1;
	#axis: ManipulatorAxis = ManipulatorAxis.None;
	#startPosition: vec3 = vec3.create();
	#startQuaternion: quat = quat.create();
	#startLocalQuaternion: quat = quat.create();
	#startDragVector = 0//vec3 = vec3.create();
	#translationManipulator = new Entity({ name: 'Translation manipulator' });
	#rotationManipulator = new Entity({ name: 'Rotation manipulator' });
	#scaleManipulator = new Entity({ name: 'Scale manipulator' });
	#enableX = false;
	#enableY = false;
	#enableZ = false;

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

		this.setMode(ManipulatorMode.Translation);
		this.setAttribute(EngineEntityAttributes.IsTool, true);

		this.enableX = true;
		this.enableY = true;
		this.enableZ = true;


		this.forEach((entity) => entity.setupPickingId());

		GraphicsEvents.addEventListener(GraphicsEvent.Tick, () => this.#resize((this.root as Scene)?.activeCamera));

		GraphicsEvents.addEventListener(GraphicsEvent.MouseDown, (event: Event) => {
			const detail = (event as CustomEvent<GraphicMouseEventData>).detail;
			if (this.#entityAxis.has(detail.entity!)) {
				this.#axis = this.#entityAxis.get(detail.entity!)!;
				switch (this.#mode) {
					case ManipulatorMode.Translation:
						this.#startTranslate(detail.x, detail.y, detail.width, detail.height);
						break;
					case ManipulatorMode.Rotation:
						this.#startRotate(detail.x, detail.y, detail.width, detail.height);
						break;
					case ManipulatorMode.Scale:
						this.#startScale(detail.x, detail.y, detail.width, detail.height);
						break;
				}
				Graphics.dragging = true;
				this.#setAxisSelected(true);
			}
		});
		GraphicsEvents.addEventListener(GraphicsEvent.MouseMove, (event: Event) => {
			const detail = (event as CustomEvent<GraphicMouseEventData>).detail;
			if (!detail.entity?.isVisible()) {
				return;
			}
			if (this.#entityAxis.has(detail.entity)) {
				switch (this.#mode) {
					case ManipulatorMode.Translation:
						this.#translationMoveHandler(detail.x, detail.y, detail.width, detail.height);
						break;
					case ManipulatorMode.Rotation:
						this.#rotationMoveHandler(detail.x, detail.y, detail.width, detail.height);
						break;
					case ManipulatorMode.Scale:
						this.#scaleMoveHandler(detail.x, detail.y, detail.width, detail.height);
						break;
				}
			}
		});
		GraphicsEvents.addEventListener(GraphicsEvent.MouseUp, (event: Event) => {
			if (this.#entityAxis.has((event as CustomEvent<GraphicMouseEventData>).detail.entity!)) {
				Graphics.dragging = false;
				this.#setAxisSelected(false);
			}
		});

		ShortcutHandler.addEventListener(MANIPULATOR_SHORTCUT_INCREASE, () => this.size *= 1.1);
		ShortcutHandler.addEventListener(MANIPULATOR_SHORTCUT_DECREASE, () => this.size *= 0.9);
		ShortcutHandler.addEventListener(MANIPULATOR_SHORTCUT_TRANSLATION, () => this.setMode(ManipulatorMode.Translation));
		ShortcutHandler.addEventListener(MANIPULATOR_SHORTCUT_ROTATION, () => this.setMode(ManipulatorMode.Rotation));
		ShortcutHandler.addEventListener(MANIPULATOR_SHORTCUT_SCALE, () => this.setMode(ManipulatorMode.Scale));
		ShortcutHandler.addEventListener(MANIPULATOR_SHORTCUT_AXIS_ORIENTATION, () => this.#axisOrientation = (++this.#axisOrientation) % 2);
		ShortcutHandler.addEventListener(MANIPULATOR_SHORTCUT_TOGGLE_X, () => this.enableX = !this.enableX);
		ShortcutHandler.addEventListener(MANIPULATOR_SHORTCUT_TOGGLE_Y, () => this.enableY = !this.enableY);
		ShortcutHandler.addEventListener(MANIPULATOR_SHORTCUT_TOGGLE_Z, () => this.enableZ = !this.enableZ);
	}

	#resize(camera?: Camera | null) {
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

		const xTip = new Cone({ radius: ARROW_RADIUS * 2, height: TIP_LENGTH, material: this.#xMaterial, name: 'Manipulator X tip' });
		xTip.translateZ(ARROW_LENGTH / 2);
		const yTip = new Cone({ radius: ARROW_RADIUS * 2, height: TIP_LENGTH, material: this.#yMaterial, name: 'Manipulator Y tip' });
		yTip.translateZ(ARROW_LENGTH / 2);
		const zTip = new Cone({ radius: ARROW_RADIUS * 2, height: TIP_LENGTH, material: this.#zMaterial, name: 'Manipulator Z tip' });
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

		this.#entityAxis.set(this.#xyzSphere, ManipulatorAxis.XYZ);
		this.#entityAxis.set(this.#xArrow, ManipulatorAxis.X);
		this.#entityAxis.set(xTip, ManipulatorAxis.X);
		this.#entityAxis.set(this.#yArrow, ManipulatorAxis.Y);
		this.#entityAxis.set(yTip, ManipulatorAxis.Y);
		this.#entityAxis.set(this.#zArrow, ManipulatorAxis.Z);
		this.#entityAxis.set(zTip, ManipulatorAxis.Z);
		this.#entityAxis.set(this.#xyPlane, ManipulatorAxis.XY);
		this.#entityAxis.set(this.#xzPlane, ManipulatorAxis.XZ);
		this.#entityAxis.set(this.#yzPlane, ManipulatorAxis.YZ);
	}

	#initRotationManipulator() {
		this.addChild(this.#rotationManipulator);

		this.#rotationManipulator.addChild(this.#xCircle);
		this.#rotationManipulator.addChild(this.#yCircle);
		this.#rotationManipulator.addChild(this.#zCircle);
		this.#rotationManipulator.addChild(this.#viewCircle);
		this.#rotationManipulator.addChild(this.#circle);

		this.#entityAxis.set(this.#xCircle, ManipulatorAxis.X);
		this.#entityAxis.set(this.#yCircle, ManipulatorAxis.Y);
		this.#entityAxis.set(this.#zCircle, ManipulatorAxis.Z);
		this.#entityAxis.set(this.#viewCircle, ManipulatorAxis.View);
	}

	#initScaleManipulator() {
		this.addChild(this.#scaleManipulator);
		//let _xyzSphere = new Sphere(ARROW_RADIUS * 6.0, this.#xyzMaterial, 32, 32);

		this.#xScale.rotateY(HALF_PI);
		this.#xScale.translateZ(ARROW_LENGTH / 2);
		this.#yScale.rotateX(-HALF_PI);
		this.#yScale.translateZ(ARROW_LENGTH / 2);
		this.#zScale.translateZ(ARROW_LENGTH / 2);

		const xScaleTip = new Box({ width: TIP_LENGTH, height: TIP_LENGTH, depth: TIP_LENGTH, material: this.#xMaterial });
		xScaleTip.translateZ(ARROW_LENGTH / 2);
		const yScaleTip = new Box({ width: TIP_LENGTH, height: TIP_LENGTH, depth: TIP_LENGTH, material: this.#yMaterial });
		yScaleTip.translateZ(ARROW_LENGTH / 2);
		const zScaleTip = new Box({ width: TIP_LENGTH, height: TIP_LENGTH, depth: TIP_LENGTH, material: this.#zMaterial });
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
		this.#entityAxis.set(this.#xScale, ManipulatorAxis.X);
		this.#entityAxis.set(xScaleTip, ManipulatorAxis.X);
		this.#entityAxis.set(this.#yScale, ManipulatorAxis.Y);
		this.#entityAxis.set(yScaleTip, ManipulatorAxis.Y);
		this.#entityAxis.set(this.#zScale, ManipulatorAxis.Z);
		this.#entityAxis.set(zScaleTip, ManipulatorAxis.Z);
	}

	#startTranslate(x: number, y: number, width: number, height: number) {
		if (this._parent) {
			this._parent.getWorldPosition(this.#startPosition);
		} else {
			this.getWorldPosition(this.#startPosition);
		}
		this.#computeTranslationPosition(this.#startDragPosition, x, y, width, height);
	}

	#startRotate(x: number, y: number, width: number, height: number) {
		if (this._parent) {
			this._parent.getWorldQuaternion(this.#startQuaternion);
			this._parent.getQuaternion(this.#startLocalQuaternion);
		} else {
			this.getWorldQuaternion(this.#startQuaternion);
			this.getQuaternion(this.#startLocalQuaternion);
		}
		this.#startDragVector = this.#computeQuaternion(x, y, width, height);
	}

	#startScale(x: number, y: number, width: number, height: number) {
		const startScalePosition = this.#startScalePosition;
		if (this._parent) {
			this._parent.getWorldPosition(this.#startPosition);
		} else {
			this.getWorldPosition(this.#startPosition);
		}
		this.#computeTranslationPosition(this.#startScalePosition, x, y, width, height);
		vec3.div(startScalePosition, startScalePosition, this.scale);
		vec3.scale(startScalePosition, startScalePosition, 2 / ARROW_LENGTH);
		if (this._parent) {
			vec3.copy(this.#parentStartScale, this._parent._scale);
		}
	}

	#translationMoveHandler(x: number, y: number, width: number, height: number) {
		this.#computeTranslationPosition(tempVec3, x, y, width, height);

		vec3.sub(tempVec3, tempVec3, this.#startDragPosition);
		switch (this.#axis) {
			case ManipulatorAxis.None:
				break;
			case ManipulatorAxis.X:
				tempVec3[1] = 0;
				tempVec3[2] = 0;
				break;
			case ManipulatorAxis.Y:
				tempVec3[0] = 0;
				tempVec3[2] = 0;
				break;
			case ManipulatorAxis.Z:
				tempVec3[0] = 0;
				tempVec3[1] = 0;
				break;
			case ManipulatorAxis.XY:
				tempVec3[2] = 0;
				break;
			case ManipulatorAxis.XZ:
				tempVec3[1] = 0;
				break;
			case ManipulatorAxis.YZ:
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

	#rotationMoveHandler(x: number, y: number, width: number, height: number): void {//TODO: rename this func
		if (!this.camera) {
			return;
		}

		const v3 = this.#computeQuaternion(x, y, width, height);
		quat.rotationTo(translationManipulatorTempQuat, this.#startDragVector, v3);
		quat.mul(translationManipulatorTempQuat, this.#startLocalQuaternion, translationManipulatorTempQuat);

		const viewDirection = this.camera.getViewDirection(vec3.create()/*TODO: optimize*/);

		let rotateAxis = xUnitVec3;
		switch (this.#axis) {
			case ManipulatorAxis.Y:
				rotateAxis = yUnitVec3;
				break;
			case ManipulatorAxis.Z:
				rotateAxis = zUnitVec3;
				break;
			case ManipulatorAxis.View:
				rotateAxis = viewDirection;
				break;
		}

		let invert = Math.sign(vec3.dot(rotateAxis, viewDirection));
		if (invert == 0) {
			invert = 1;
		}

		const angleDelta = this.#startDragVector - v3;
		quat.setAxisAngle(translationManipulatorTempQuat, rotateAxis, angleDelta * invert);
		quat.mul(translationManipulatorTempQuat, translationManipulatorTempQuat, this.#startLocalQuaternion);

		if (this._parent) {
			this._parent.quaternion = translationManipulatorTempQuat;
			this._parent.locked = true;
		} else {
			this.quaternion = translationManipulatorTempQuat;
		}
	}

	#scaleMoveHandler(x: number, y: number, width: number, height: number) {
		const v3 = this.#computeTranslationPosition(tempVec3, x, y, width, height);
		if (!v3) {
			return;
		}

		//vec3.sub(v3, v3, this.#startScalePosition);
		vec3.div(v3, v3, this.scale);
		vec3.div(v3, v3, this.#startScalePosition);
		vec3.scale(v3, v3, 2 / ARROW_LENGTH);

		switch (this.#axis) {
			case ManipulatorAxis.None:
				break;
			case ManipulatorAxis.X:
				v3[1] = 1;
				v3[2] = 1;
				break;
			case ManipulatorAxis.Y:
				v3[0] = 1;
				v3[2] = 1;
				break;
			case ManipulatorAxis.Z:
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

	#computeTranslationPosition(out: vec3, x: number, y: number, width: number, height: number) {
		const camera = this.camera;
		if (camera) {
			const projectionMatrix = camera.projectionMatrix;
			const viewMatrix = camera.cameraMatrix;
			const nearPlane = camera.nearPlane;
			const farPlane = camera.farPlane;
			const aspectRatio = camera.aspectRatio;

			const invProjectionMatrix = mat4.invert(mat4.create(), projectionMatrix);
			const invViewMatrix = mat4.invert(mat4.create(), viewMatrix);

			// transform the screen coordinates to normalized coordinates
			this.#cursorPos[0] = (x / width) * 2.0 - 1.0;
			this.#cursorPos[1] = 1.0 - (y / height) * 2.0;

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

				const t = (vec3.dot(planeNormal, planePoint) - vec3.dot(planeNormal, linePoint)) / vec3.dot(planeNormal, lineDirection);
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
			const worldPos = this._parent ? this._parent.getWorldPosition() : this.getWorldPosition();
			const A = worldPos;//vec3.clone(this._parent.position) : vec3.clone(this.position);
			const B = vec3.add(vec3.create(), A, planeNormal);
			const P = camera.position;
			const AP = vec3.sub(vec3.create(), P, A);//P-A;
			const AB = vec3.sub(vec3.create(), B, A);//B-A;

			const projPoint = vec3.add(vec3.create(), A, vec3.scale(AB, AB, vec3.dot(AP, AB) / vec3.dot(AB, AB)));


			planeNormal = vec3.sub(vec3.create(), projPoint, camera.position);
			vec3.normalize(planeNormal, planeNormal);

			if (this.#axis == ManipulatorAxis.XYZ) {
				vec3.transformQuat(planeNormal, vec3.fromValues(0, 0, 1), camera.quaternion);
			}

			/********************/
			lineIntersection(out, worldPos, planeNormal, this.#near, vec3.sub(vec3.create(), this.#far, this.#near));

			quat.invert(translationManipulatorTempQuat, this.getWorldQuaternion());
			vec3.transformQuat(out, out, translationManipulatorTempQuat);
			return out;
		}
	}

	#computeQuaternion(x: number, y: number, width: number, height: number) {
		const camera = this.camera;
		if (!camera) {
			return 0;
		}

		// transform the screen coordinates to normalized coordinates
		const normalizedX = (x / width) * 2.0 - 1.0;
		const normalizedY = 1.0 - (y / height) * 2.0;

		this.getWorldPosition(tempVec3);
		vec3.transformMat4(tempVec3, tempVec3, camera.cameraMatrix);
		vec3.transformMat4(tempVec3, tempVec3, camera.projectionMatrix);

		return Math.atan2(normalizedY - tempVec3[1], normalizedX - tempVec3[0]);
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
		Graphics.dragging = false;

		this.#mode = mode;
		switch (mode) {
			case ManipulatorMode.Translation:
				this.#translationManipulator.setVisible(undefined);
				break;
			case ManipulatorMode.Rotation:
				this.#rotationManipulator.setVisible(undefined);
				break;
			case ManipulatorMode.Scale:
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
		if (this.#mode < ManipulatorMode.Scale) {
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
		const enable = enableX ? undefined : false;
		this.#xArrow.setVisible(enable);
		this.#xCircle.setVisible(enable);
		this.#xScale.setVisible(enable);
	}

	get enableX() {
		return this.#enableX;
	}

	set enableY(enableY) {
		this.#enableY = enableY;
		const enable = enableY ? undefined : false;
		this.#yArrow.setVisible(enable);
		this.#yCircle.setVisible(enable);
		this.#yScale.setVisible(enable);
	}

	get enableY() {
		return this.#enableY;
	}

	set enableZ(enableZ) {
		this.#enableZ = enableZ;
		const enable = enableZ ? undefined : false;
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
