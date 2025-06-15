import { mat4, quat, vec3 } from 'gl-matrix';
import { DEBUG } from '../buildoptions';
import { Entity, EntityParameters } from '../entities/entity';
import { Scene } from '../scenes/scene';
import { DEG_TO_RAD, RAD_TO_DEG } from '../math/constants';
import { EntityObserver } from '../entities/entityobserver';
import { registerEntity } from '../entities/entities';
import { JSONObject } from '../types';

export enum CameraProjection {
	Perspective = 0,
	Orthographic,
	Mixed,
}

const tempQuat = quat.create();
const tempVec3 = vec3.create();

const proj1 = mat4.create();
const proj2 = mat4.create();

const DEFAULT_NEAR_PLANE = 1;
const DEFAULT_FAR_PLANE = 1000;
const DEFAULT_ORTHO_ZOOM = 1;
const DEFAULT_PROJECTION = CameraProjection.Perspective;
const DEFAULT_PROJECTION_MIX = 0;
const DEFAULT_VERTICAL_FOV = 60;
const DEFAULT_ASPECT_RATIO = 1;
const DEFAULT_UP_VECTOR = vec3.fromValues(0, 0, 1);
const DEFAULT_LEFT = -1;
const DEFAULT_RIGHT = 1;
const DEFAULT_TOP = 1;
const DEFAULT_BOTTOM = -1;

const FrontVector = vec3.fromValues(0, 0, -1);

const LAMBDA = 10;
const LAMBDA_DIVIDOR = 1 - Math.exp(-LAMBDA);

export type CameraParameters = EntityParameters & {
	nearPlane?: number,
	farPlane?: number,
	orthoZoom?: number,
	projectionMix?: number,
	projection?: CameraProjection,
	verticalFov?: number,
	aspectRatio?: number,
	upVector?: vec3,
	left?: number,
	right?: number,
	top?: number,
	bottom?: number,
};

export class Camera extends Entity {
	#nearPlane!: number;
	#farPlane!: number;
	#orthoZoom!: number;
	#projection!: CameraProjection;
	#projectionMix!: number;// 0: full perspective 1: full ortho
	#left!: number;
	#right!: number;
	#top!: number;
	#bottom!: number;
	#cameraMatrix = mat4.create();
	#projectionMatrix = mat4.create();
	#verticalFov!: number;
	#aspectRatio!: number;
	#dirtyCameraMatrix = true;
	#dirtyProjectionMatrix = true;
	#projectionMatrixInverse = mat4.create();
	#worldMatrixInverse = mat4.create();
	#upVector = vec3.create();
	isPerspective!: boolean;
	isOrthographic!: boolean;
	#tanHalfVerticalFov!: number

	constructor(params: CameraParameters = {}) {
		super();
		super.setParameters(params);
		this.nearPlane = params.nearPlane ?? DEFAULT_NEAR_PLANE;
		this.farPlane = params.farPlane ?? DEFAULT_FAR_PLANE;
		this.orthoZoom = params.orthoZoom ?? DEFAULT_ORTHO_ZOOM;
		this.projectionMix = params.projectionMix ?? DEFAULT_PROJECTION_MIX;
		this.setProjection(params.projection ?? DEFAULT_PROJECTION);
		this.verticalFov = params.verticalFov ?? DEFAULT_VERTICAL_FOV;
		this.aspectRatio = params.aspectRatio ?? DEFAULT_ASPECT_RATIO;
		this.upVector = params.upVector ?? DEFAULT_UP_VECTOR;

		this.left = params.left ?? DEFAULT_LEFT;
		this.right = params.right ?? DEFAULT_RIGHT;
		this.top = params.top ?? DEFAULT_TOP;
		this.bottom = params.bottom ?? DEFAULT_BOTTOM;

		this.dirty();
		//this._renderMode = 2;
	}

	computeCameraMatrix() {
		mat4.fromRotationTranslation(this.#cameraMatrix, this.getWorldQuaternion(tempQuat), this.getWorldPosition(tempVec3));
		mat4.invert(this.#cameraMatrix, this.#cameraMatrix);
	}

	#computeProjectionMatrix() {
		if (this.#projection == CameraProjection.Perspective) {
			mat4.perspective(this.#projectionMatrix, this.#verticalFov, this.#aspectRatio, this.#nearPlane, this.#farPlane);
		} else if (this.#projection == CameraProjection.Orthographic) {
			const ortho = this.#orthoZoom;
			mat4.ortho(this.#projectionMatrix, this.#left / ortho, this.#right / ortho, this.#bottom / ortho, this.#top / ortho, this.#nearPlane, this.#farPlane);
		} else {
			// Mixed perspective / ortho
			const invOrtho = 1 / this.#orthoZoom;
			mat4.perspective(proj1, this.#verticalFov, this.#aspectRatio, this.#nearPlane, this.#farPlane);
			mat4.ortho(proj2, this.#left * invOrtho, this.#right * invOrtho, this.#bottom * invOrtho, this.#top * invOrtho, this.#nearPlane, this.#farPlane);

			mat4.multiplyScalar(this.#projectionMatrix, proj1, 1 - this.#projectionMix);
			mat4.multiplyScalarAndAdd(this.#projectionMatrix, this.#projectionMatrix, proj2, this.#projectionMix);
		}
	}

	reset() {
	}

	setProjection(projection: CameraProjection) {
		const oldValue = this.#projection;
		this.#projection = projection;
		this.#dirtyProjectionMatrix = true;
		this.isPerspective = projection == CameraProjection.Perspective;
		this.isOrthographic = projection == CameraProjection.Orthographic;

		if (oldValue != projection) {
			EntityObserver.propertyChanged(this, 'projection', oldValue, this.#projection);
		}
	}

	get projection() {
		return this.#projection;
	}

	setProjectionMix(projectionMix: number) {
		this.projectionMix = (1 - Math.exp(-LAMBDA * projectionMix)) / LAMBDA_DIVIDOR;
	}

	set projectionMix(projectionMix) {
		const oldValue = this.#projectionMix;
		this.#projectionMix = projectionMix;
		if (projectionMix == 0) {
			this.setProjection(CameraProjection.Perspective);
		} else if (projectionMix == 1) {
			this.setProjection(CameraProjection.Orthographic);
		} else {
			this.setProjection(CameraProjection.Mixed);
		}
		if (oldValue != projectionMix) {
			EntityObserver.propertyChanged(this, 'projectionmix', oldValue, this.#projectionMix);
		}
	}

	get projectionMix() {
		return this.#projectionMix;
	}

	set nearPlane(nearPlane) {
		const oldValue = this.#nearPlane;
		this.#nearPlane = Number(nearPlane);
		this.#dirtyProjectionMatrix = true;
		if (oldValue != nearPlane) {
			EntityObserver.propertyChanged(this, 'nearplane', oldValue, this.#nearPlane);
		}
	}

	get nearPlane() {
		return this.#nearPlane;
	}

	set farPlane(farPlane) {
		const oldValue = this.#farPlane;
		this.#farPlane = Number(farPlane);
		this.#dirtyProjectionMatrix = true;
		if (oldValue != farPlane) {
			EntityObserver.propertyChanged(this, 'farplane', oldValue, this.#farPlane);
		}
	}

	get farPlane() {
		return this.#farPlane;
	}

	set orthoZoom(orthoZoom) {
		const oldValue = this.#orthoZoom;
		this.#orthoZoom = Number(orthoZoom);
		this.#dirtyProjectionMatrix = true;
		if (oldValue != orthoZoom) {
			EntityObserver.propertyChanged(this, 'orthozoom', oldValue, this.#orthoZoom);
		}
	}

	get orthoZoom() {
		return this.#orthoZoom;
	}

	set verticalFov(verticalFov) {
		const oldValue = this.#verticalFov;
		this.#verticalFov = verticalFov * DEG_TO_RAD;
		this.#tanHalfVerticalFov = Math.tan(this.#verticalFov * 0.5);
		this.#dirtyProjectionMatrix = true;
		if (oldValue != this.#verticalFov) {
			EntityObserver.propertyChanged(this, 'verticalfov', oldValue, this.#verticalFov);
		}
	}

	get verticalFov() {
		return this.#verticalFov * RAD_TO_DEG;
	}

	getTanHalfVerticalFov() {
		return this.#tanHalfVerticalFov;
	}

	set aspectRatio(aspectRatio) {
		const oldValue = this.#aspectRatio;
		this.#aspectRatio = Number(aspectRatio);
		this.#dirtyProjectionMatrix = true;
		if (oldValue != this.#aspectRatio) {
			EntityObserver.propertyChanged(this, 'aspectratio', oldValue, this.#aspectRatio);
		}
	}

	get aspectRatio() {
		return this.#aspectRatio;
	}

	set upVector(upVector) {
		vec3.copy(this.#upVector, upVector);
	}

	get upVector() {
		return this.#upVector;
	}


	set left(left) {
		const oldValue = this.#left;
		this.#left = Number(left);
		this.#dirtyProjectionMatrix = true;
		if (oldValue != this.#left) {
			EntityObserver.propertyChanged(this, 'left', oldValue, this.#left);
		}
	}

	get left() {
		return this.#left;
	}

	set right(right) {
		const oldValue = this.#right;
		this.#right = Number(right);
		this.#dirtyProjectionMatrix = true;
		if (oldValue != this.#right) {
			EntityObserver.propertyChanged(this, 'right', oldValue, this.#right);
		}
	}

	get right() {
		return this.#right;
	}

	set top(top) {
		const oldValue = this.#top;
		this.#top = Number(top);
		this.#dirtyProjectionMatrix = true;
		if (oldValue != this.#top) {
			EntityObserver.propertyChanged(this, 'top', oldValue, this.#top);
		}
	}

	get top() {
		return this.#top;
	}

	set bottom(bottom) {
		const oldValue = this.#bottom;
		this.#bottom = Number(bottom);
		this.#dirtyProjectionMatrix = true;
		if (oldValue != this.#bottom) {
			EntityObserver.propertyChanged(this, 'bottom', oldValue, this.#bottom);
		}
	}

	get bottom() {
		return this.#bottom;
	}

	dirty() {
		this.#dirtyCameraMatrix = true;
		this.#dirtyProjectionMatrix = true;
	}

	get cameraMatrix() {
		if (this.#dirtyCameraMatrix) {
			this.computeCameraMatrix();
			this.#dirtyCameraMatrix = false;
		}
		return this.#cameraMatrix;
	}

	get projectionMatrix() {
		if (this.#dirtyProjectionMatrix) {
			this.#computeProjectionMatrix();
			mat4.invert(this.#projectionMatrixInverse, this.#projectionMatrix);
			this.#dirtyProjectionMatrix = false;
		}
		return this.#projectionMatrix;
	}

	get projectionMatrixInverse() {
		if (this.#dirtyProjectionMatrix) {
			this.#computeProjectionMatrix();
			mat4.invert(this.#projectionMatrixInverse, this.#projectionMatrix);
			this.#dirtyProjectionMatrix = false;
		}
		return this.#projectionMatrixInverse;
	}

	get worldMatrixInverse() {
		//TODO: optimize
		mat4.invert(this.#worldMatrixInverse, this.worldMatrix);
		return this.#worldMatrixInverse;
	}

	distanceFrom(point: vec3) {
		return vec3.distance(this._position, point);
	}

	set position(position) {
		super.position = position;
		this.#dirtyCameraMatrix = true;
	}

	get position() {
		return super.position;
	}

	set quaternion(quaternion) {
		super.quaternion = quaternion;
		this.#dirtyCameraMatrix = true;
	}

	get quaternion() {
		return super.quaternion;
	}
	/*set renderMode(mode) {
		throw 'set renderMode(mode) {';
		if ((mode === 0) || (mode === 1) || (mode === 2) || (mode === 3)) {
			this._renderMode = mode;
		}
	}
	get renderMode() {
		throw 'get renderMode(mode) {';
		return this._renderMode;
	}*/

	toString() {
		return 'Camera ' + super.toString();
	}

	setActiveCamera() {
		const scene = this.root;
		if (scene.is('Scene')) {
			(scene as Scene).activeCamera = this;
		} else {
			if (DEBUG) {
				console.error('Camera is not part of a Scene');
			}
		}
	}

	buildContextMenu() {
		return Object.assign(super.buildContextMenu(), {
			camera1: null,
			cameraPerspective: { i18n: '#perspective_camera', selected: this.isPerspective, f: () => this.setProjection(CameraProjection.Perspective) },
			cameraOrthographic: { i18n: '#orthographic_camera', selected: this.isOrthographic, f: () => this.setProjection(CameraProjection.Orthographic) },
			cameraNearPlane: { i18n: '#near_plane', f: () => { const nearPlane = prompt('Near plane', String(this.nearPlane)); if (nearPlane !== null) { this.nearPlane = Number(nearPlane); } } },
			cameraFarPlane: { i18n: '#far_plane', f: () => { const farPlane = prompt('Far plane', String(this.farPlane)); if (farPlane !== null) { this.farPlane = Number(farPlane); } } },
			cameraOrthoZoom: { i18n: '#zoom', f: () => { const zoom = prompt('Zoom', String(this.orthoZoom)); if (zoom !== null) { this.orthoZoom = Number(zoom); } } },
			cameraFov: { i18n: '#fov', f: () => { const fov = prompt('FOV', String(this.verticalFov)); if (fov !== null) { this.verticalFov = Number(fov); } } },
			cameraSetActiveCamera: { i18n: '#set_active_camera', f: () => this.setActiveCamera() },
		});
	}

	invertProjection(v3: vec3) {
		vec3.transformMat4(v3, v3, this.projectionMatrixInverse);
	}

	getViewDirection(v: vec3 = vec3.create()): vec3 {
		return vec3.transformQuat(v, FrontVector, this.getWorldQuaternion(tempQuat));
	}

	copy(source: Camera) {
		super.copy(source);
		this.nearPlane = source.nearPlane;
		this.farPlane = source.farPlane;
		this.orthoZoom = source.orthoZoom;
		this.setProjection(source.projection);
		this.projectionMix = source.projectionMix;
		this.verticalFov = source.verticalFov;
		this.aspectRatio = source.aspectRatio;
		this.upVector = source.upVector;
		this.left = source.left;
		this.right = source.right;
		this.top = source.top;
		this.bottom = source.bottom;
		this.dirty();
	}

	toJSON() {
		const json = super.toJSON();
		if (this.nearPlane != DEFAULT_NEAR_PLANE) {
			json.nearplane = this.#nearPlane;
		}
		if (this.#farPlane != DEFAULT_FAR_PLANE) {
			json.farplane = this.#farPlane;
		}
		if (this.orthoZoom != DEFAULT_ORTHO_ZOOM) {
			json.orthoZoom = this.orthoZoom;
		}
		if (this.projection != DEFAULT_PROJECTION) {
			json.projection = this.projection;
		}
		if (this.#projectionMix != DEFAULT_PROJECTION_MIX) {
			json.projectionMix = this.#projectionMix;
		}
		if (this.verticalFov != DEFAULT_VERTICAL_FOV) {
			json.verticalFov = this.verticalFov;
		}
		if (this.aspectRatio != DEFAULT_ASPECT_RATIO) {
			json.aspectRatio = this.aspectRatio;
		}
		if (!vec3.equals(this.#upVector, DEFAULT_UP_VECTOR)) {
			json.upVector = this.upVector;
		}
		if (this.left != DEFAULT_LEFT) {
			json.left = this.left;
		}
		if (this.right != DEFAULT_RIGHT) {
			json.right = this.right;
		}
		if (this.top != DEFAULT_TOP) {
			json.top = this.top;
		}
		if (this.bottom != DEFAULT_BOTTOM) {
			json.bottom = this.bottom;
		}
		return json;
	}

	static async constructFromJSON(json: JSONObject) {
		return new Camera(json);
	}

	static getEntityName() {
		return 'Camera';
	}

	is(s: string): boolean {
		if (s == 'Camera') {
			return true;
		} else {
			return super.is(s);
		}
	}
}
registerEntity(Camera);
