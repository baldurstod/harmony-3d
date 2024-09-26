import { mat4, quat, vec3 } from 'gl-matrix';

import { DEBUG } from '../buildoptions';
import { Entity } from '../entities/entity';
import { Scene } from '../scenes/scene';
import { DEG_TO_RAD, RAD_TO_DEG } from '../math/constants';
import { EntityObserver } from '../entities/entityobserver';
import { registerEntity } from '../entities/entities';

export const PERSPECTIVE_CAMERA = 0;
export const ORTHOGRAPHIC_CAMERA = 1;
export const MIXED_CAMERA = 2;

export enum CameraProjection {
	Perspective = 0,
	Orthographic,
	Mixed,
}

const tempQuat = quat.create();
const tempVec3 = vec3.create();
const identityVec3 = vec3.create();

const proj1 = mat4.create();
const proj2 = mat4.create();

const DEFAULT_NEAR_PLANE = 1;
const DEFAULT_FAR_PLANE = 1000;
const DEFAULT_ORTHO_ZOOM = 1;
const DEFAULT_PROJECTION = PERSPECTIVE_CAMERA;
const DEFAULT_PROJECTION_MIX = 0;
const DEFAULT_VERTICAL_FOV = 60;
const DEFAULT_ASPECT_RATIO = 1;
const DEFAULT_UP_VECTOR = vec3.fromValues(0, 0, 1);
const DEFAULT_LEFT = -1;
const DEFAULT_RIGHT = 1;
const DEFAULT_TOP = 1;
const DEFAULT_BOTTOM = -1;


const LAMBDA = 10;
const LAMBDA_DIVIDOR = 1 - Math.exp(-LAMBDA);

export class Camera extends Entity {
	#nearPlane: number;
	#farPlane: number;
	#orthoZoom: number;
	#projectionType: CameraProjection;
	#projectionMix: number;// 0: full perspective 1: full ortho
	#left: number;
	#right: number;
	#top: number;
	#bottom: number;
	#cameraMatrix = mat4.create();
	#projectionMatrix = mat4.create();
	#verticalFov: number;
	#aspectRatio: number;
	#dirtyCameraMatrix: boolean = true;
	#dirtyProjectionMatrix: boolean = true;
	#projectionMatrixInverse = mat4.create();
	#worldMatrixInverse = mat4.create();
	#upVector = vec3.create();
	isPerspective: boolean;
	isOrthographic: boolean;
	#tanHalfVerticalFov: number
	constructor(params: any = {}) {
		super();
		super.setParameters(params);
		this.nearPlane = params.nearPlane ?? params.near ?? DEFAULT_NEAR_PLANE;
		this.farPlane = params.farPlane ?? params.far ?? DEFAULT_FAR_PLANE;
		this.orthoZoom = params.orthoZoom ?? DEFAULT_ORTHO_ZOOM;
		this.projectionMix = params.projectionMix ?? DEFAULT_PROJECTION_MIX;
		this.projectionType = params.projectionType ?? params.projection ?? DEFAULT_PROJECTION;
		this.verticalFov = params.verticalFov ?? params.fov ?? DEFAULT_VERTICAL_FOV;
		this.aspectRatio = params.aspectRatio ?? params.aspect ?? DEFAULT_ASPECT_RATIO;
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
		if (this.#projectionType == PERSPECTIVE_CAMERA) {
			mat4.perspective(this.#projectionMatrix, this.#verticalFov, this.#aspectRatio, this.#nearPlane, this.#farPlane);
		} else if (this.#projectionType == ORTHOGRAPHIC_CAMERA) {
			let ortho = this.#orthoZoom;
			mat4.ortho(this.#projectionMatrix, this.#left / ortho, this.#right / ortho, this.#bottom / ortho, this.#top / ortho, this.#nearPlane, this.#farPlane);
		} else {
			let invOrtho = 1 / this.#orthoZoom;
			mat4.perspective(proj1, this.#verticalFov, this.#aspectRatio, this.#nearPlane, this.#farPlane);
			mat4.ortho(proj2, this.#left * invOrtho, this.#right * invOrtho, this.#bottom * invOrtho, this.#top * invOrtho, this.#nearPlane, this.#farPlane);

			mat4.multiplyScalar(this.#projectionMatrix, proj1, 1 - this.#projectionMix);
			mat4.multiplyScalarAndAdd(this.#projectionMatrix, this.#projectionMatrix, proj2, this.#projectionMix);
		}
	}

	reset() {
	}

	set projectionType(projectionType) {
		this.#projectionType = projectionType;
		this.#dirtyProjectionMatrix = true;
		this.isPerspective = projectionType == PERSPECTIVE_CAMERA;
		this.isOrthographic = projectionType == ORTHOGRAPHIC_CAMERA;

		EntityObserver.propertyChanged(this, 'projectiontype', this.#projectionType);
	}

	get projectionType() {
		return this.#projectionType;
	}

	setProjectionMix(projectionMix) {
		this.projectionMix = (1 - Math.exp(-LAMBDA * projectionMix)) / LAMBDA_DIVIDOR;
	}

	set projectionMix(projectionMix) {
		this.#projectionMix = projectionMix;
		if (projectionMix == 0) {
			this.projectionType = PERSPECTIVE_CAMERA;
		} else if (projectionMix == 1) {
			this.projectionType = ORTHOGRAPHIC_CAMERA;
		} else {
			this.projectionType = MIXED_CAMERA;
		}
		EntityObserver.propertyChanged(this, 'projectionmix', this.#projectionMix);
	}

	get projectionMix() {
		return this.#projectionMix;
	}

	set nearPlane(nearPlane) {
		this.#nearPlane = Number(nearPlane);
		this.#dirtyProjectionMatrix = true;
		EntityObserver.propertyChanged(this, 'nearplane', this.#nearPlane);
	}

	get nearPlane() {
		return this.#nearPlane;
	}

	set farPlane(farPlane) {
		this.#farPlane = Number(farPlane);
		this.#dirtyProjectionMatrix = true;
		EntityObserver.propertyChanged(this, 'farplane', this.#farPlane);
	}

	get farPlane() {
		return this.#farPlane;
	}

	set orthoZoom(orthoZoom) {
		this.#orthoZoom = Number(orthoZoom);
		this.#dirtyProjectionMatrix = true;
		EntityObserver.propertyChanged(this, 'orthozoom', this.#orthoZoom);
	}

	get orthoZoom() {
		return this.#orthoZoom;
	}

	set verticalFov(verticalFov) {
		this.#verticalFov = verticalFov * DEG_TO_RAD;
		this.#tanHalfVerticalFov = Math.tan(this.#verticalFov * 0.5);
		this.#dirtyProjectionMatrix = true;
		EntityObserver.propertyChanged(this, 'verticalfov', this.#verticalFov);
	}

	get verticalFov() {
		return this.#verticalFov * RAD_TO_DEG;
	}

	getTanHalfVerticalFov() {
		return this.#tanHalfVerticalFov;
	}

	set aspectRatio(aspectRatio) {
		this.#aspectRatio = Number(aspectRatio);
		this.#dirtyProjectionMatrix = true;
		EntityObserver.propertyChanged(this, 'aspectratio', this.#aspectRatio);
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
		this.#left = Number(left);
		this.#dirtyProjectionMatrix = true;
		EntityObserver.propertyChanged(this, 'left', this.#left);
	}

	get left() {
		return this.#left;
	}

	set right(right) {
		this.#right = Number(right);
		this.#dirtyProjectionMatrix = true;
		EntityObserver.propertyChanged(this, 'right', this.#right);
	}

	get right() {
		return this.#right;
	}

	set top(top) {
		this.#top = Number(top);
		this.#dirtyProjectionMatrix = true;
		EntityObserver.propertyChanged(this, 'top', this.#top);
	}

	get top() {
		return this.#top;
	}

	set bottom(bottom) {
		this.#bottom = Number(bottom);
		this.#dirtyProjectionMatrix = true;
		EntityObserver.propertyChanged(this, 'bottom', this.#bottom);
	}

	get bottom() {
		return this.#bottom;
	}

	dirty() {
		this.#dirtyCameraMatrix = true;
		this.#dirtyProjectionMatrix = true;
	}

	/**
	* Get camera matrix
	* @return TODO
	*/
	get matrix() {
		throw 'deprecated';
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

	distanceFrom(point) {
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
		let scene = this.root;
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
			cameraPerspective: { i18n: '#perspective_camera', selected: this.isPerspective, f: () => this.projectionType = PERSPECTIVE_CAMERA },
			cameraOrthographic: { i18n: '#orthographic_camera', selected: this.isOrthographic, f: () => this.projectionType = ORTHOGRAPHIC_CAMERA },
			cameraNearPlane: { i18n: '#near_plane', f: () => { let nearPlane = prompt('Near plane', String(this.nearPlane)); if (nearPlane !== null) { this.nearPlane = Number(nearPlane); } } },
			cameraFarPlane: { i18n: '#far_plane', f: () => { let farPlane = prompt('Far plane', String(this.farPlane)); if (farPlane !== null) { this.farPlane = Number(farPlane); } } },
			cameraOrthoZoom: { i18n: '#zoom', f: () => { let zoom = prompt('Zoom', String(this.orthoZoom)); if (zoom !== null) { this.orthoZoom = Number(zoom); } } },
			cameraFov: { i18n: '#fov', f: () => { let fov = prompt('FOV', String(this.verticalFov)); if (fov !== null) { this.verticalFov = Number(fov); } } },
			cameraSetActiveCamera: { i18n: '#set_active_camera', f: () => this.setActiveCamera() },
		});
	}

	invertProjection(v3) {
		vec3.transformMat4(v3, v3, this.projectionMatrixInverse);
	}

	copy(source) {
		super.copy(source);
		this.nearPlane = source.nearPlane;
		this.farPlane = source.farPlane;
		this.orthoZoom = source.orthoZoom;
		this.projectionType = source.projectionType;
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
		let json = super.toJSON();
		if (this.nearPlane != DEFAULT_NEAR_PLANE) {
			json.nearplane = this.#nearPlane;
		}
		if (this.#farPlane != DEFAULT_FAR_PLANE) {
			json.farplane = this.#farPlane;
		}
		if (this.orthoZoom != DEFAULT_ORTHO_ZOOM) {
			json.orthoZoom = this.orthoZoom;
		}
		if (this.projectionType != DEFAULT_PROJECTION) {
			json.projectionType = this.projectionType;
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

	static async constructFromJSON(json) {
		return new Camera(json);
	}

	get entityName() {
		return 'Camera';
	}

	static get entityName() {
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