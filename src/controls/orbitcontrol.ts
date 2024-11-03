import { quat, vec2, vec3 } from 'gl-matrix';

import { CameraControl } from './cameracontrol';
import { Spherical } from './spherical';
import { Target } from '../objects/target';
import { TESTING } from '../buildoptions';
import { GraphicsEvent, GraphicsEvents } from '../graphics/graphicsevents';
import { Camera } from '../cameras/camera';

// This set of controls performs orbiting, dollying(zooming), and panning.
// Unlike TrackballControls, it maintains the 'up' direction object.up(+Y by default).
//
// Orbit - left mouse / touch: one-finger move
// Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
// Pan - right mouse, or left mouse + ctrl/meta/shiftKey, or arrow keys / touch: two-finger move

const zUnitVec3 = vec3.fromValues(0, 0, 1);
const tempVec3 = vec3.create();
const tempVec3_2 = vec3.create();
const spherical = new Spherical();


// The four arrow keys
const keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

// Mouse buttons
export const MOUSE = { LEFT: 0, MIDDLE: 1, RIGHT: 2, ROTATE: 0, DOLLY: 1, PAN: 2, NONE: -1 };
const mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };

// Touch fingers
const TOUCH = { ROTATE: 0, PAN: 1, DOLLY_PAN: 2, DOLLY_ROTATE: 3 };
const touches = { ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_PAN };

const STATE = {
	NONE: - 1,
	ROTATE: 0,
	DOLLY: 1,
	PAN: 2,
	TOUCH_ROTATE: 3,
	TOUCH_PAN: 4,
	TOUCH_DOLLY_PAN: 5,
	TOUCH_DOLLY_ROTATE: 6
};

export class OrbitControl extends CameraControl {
	#upVector = vec3.fromValues(0, 0, 1);
	#keyRotateHorizontal = 0;
	#keyRotateVertical = 0;
	#autoRotate = false;
	#autoRotateSpeed = 1.0;
	#enableDamping = false;
	#target = new Target({ name: 'Orbit control target' });
	#minDistance = 0;
	#maxDistance = Infinity;
	#minZoom = 0.01;
	#maxZoom = Infinity;
	#minPolarAngle = 0;
	#maxPolarAngle = Math.PI;
	#minAzimuthAngle = -Infinity;
	#maxAzimuthAngle = Infinity;
	#dampingFactor = 0.05;

	#enableDolly = true;
	#dollySpeed = 1.0;

	#enableRotate = true;
	#rotateSpeed = 1.0;

	#enablePan = true;
	#panSpeed = 0.001;

	#screenSpacePanning = false; // if true, pan in screen-space
	#keyPanSpeed = 7.0;	// pixels moved per arrow key push

	#enableKeys = true;

	#position0 = vec3.create();

	#mouseButtons = [MOUSE.ROTATE, MOUSE.DOLLY, MOUSE.PAN];
	#state = STATE.NONE;

	#scale = 1.0;

	#q = quat.create();
	#quatInverse = quat.create();

	#lastPosition = vec3.create();
	#lastQuaternion = quat.create();

	#sphericalDelta = new Spherical();

	#panOffset = vec3.create();
	#zoomChanged = false;

	#rotateStart = vec2.create();
	#rotateEnd = vec2.create();
	#rotateDelta = vec2.create();

	#panStart = vec2.create();
	#panEnd = vec2.create();
	#panDelta = vec2.create();

	#dollyStart = vec2.create();
	#dollyEnd = vec2.create();
	#dollyDelta = vec2.create();

	constructor(camera?: Camera, htmlElement?: HTMLElement) {
		super(camera, htmlElement);

		//TODO end
		if (camera) {
			vec3.copy(this.#position0, camera.position);
		}

		this.setupCamera();
		this.#setupEventsListeners();
		this.update();
	}

	set target(target) {
		this.#target = target;
		this.update();
	}

	get target() {
		return this.#target;
	}

	setTargetPosition(position) {
		this.#target.position = position;
		this.update();
	}

	set upVector(upVector) {
		vec3.copy(this.#upVector, upVector);
		this.update();
	}

	get upVector() {
		return this.#upVector;
	}

	set minPolarAngle(minPolarAngle) {
		this.#minPolarAngle = minPolarAngle;
	}

	get minPolarAngle() {
		return this.#minPolarAngle;
	}

	set maxPolarAngle(maxPolarAngle) {
		this.#maxPolarAngle = maxPolarAngle;
	}

	get maxPolarAngle() {
		return this.#maxPolarAngle;
	}

	set dampingFactor(dampingFactor) {
		this.#dampingFactor = dampingFactor;
	}

	get dampingFactor() {
		return this.#dampingFactor;
	}

	setupCamera() {
		if (this.camera) {
			quat.rotationTo(this.#q, this.#upVector, zUnitVec3);
			this.#quatInverse = quat.invert(this.#quatInverse, this.#q);
		}
	}

	update(delta = 1) {
		if (this.enabled === false) {
			return;
		}
		var position = this.camera._position;

		//offset.copy(position).sub(this.target);
		vec3.sub(tempVec3, position, this.#target.getWorldPosition());//TODO: optimise

		// rotate offset to 'y-axis-is-up' space
		//offset.applyQuaternion(q);
		vec3.transformQuat(tempVec3, tempVec3, this.#q);

		// angle from z-axis around y-axis
		spherical.setFromVector3(tempVec3);



		if (this.#autoRotate && this.#state === STATE.NONE) {

			this.#rotateLeft(this.#autoRotateSpeed);

		}

		if (this.#keyRotateVertical) {
			this.#rotateUp(this.#keyRotateVertical * 2 * Math.PI * delta);
		}
		if (this.#keyRotateHorizontal) {
			this.#rotateLeft(this.#keyRotateHorizontal * 2 * Math.PI * delta);
		}


		if (this.#enableDamping) {
			spherical.theta += this.#sphericalDelta.theta * this.#dampingFactor;
			spherical.phi += this.#sphericalDelta.phi * this.#dampingFactor;
		} else {
			spherical.theta += this.#sphericalDelta.theta;
			spherical.phi += this.#sphericalDelta.phi;
		}

		// restrict theta to be between desired limits
		spherical.theta = Math.max(this.#minAzimuthAngle, Math.min(this.#maxAzimuthAngle, spherical.theta));

		// restrict phi to be between desired limits
		spherical.phi = Math.max(this.#minPolarAngle, Math.min(this.#maxPolarAngle, spherical.phi));

		spherical.makeSafe();

		spherical.radius *= this.#scale;

		// restrict radius to be between desired limits
		spherical.radius = Math.max(this.#minDistance, Math.min(this.#maxDistance, spherical.radius));

		// move target to panned location

		if (this.#enableDamping === true) {
			vec3.scaleAndAdd(tempVec3_2, this.#target._position, this.#panOffset, this.#dampingFactor);
			this.#target.setPosition(tempVec3_2);
		} else {
			//this.target.add(this.#panOffset);
			vec3.add(tempVec3_2, this.#target._position, this.#panOffset);
			this.#target.setPosition(tempVec3_2);
		}
		spherical.toCartesian(tempVec3);

		// rotate offset back to 'camera-up-vector-is-up' space
		//offset.applyQuaternion(quatInverse);
		vec3.transformQuat(tempVec3, tempVec3, this.#quatInverse);

		//position.copy(this.target).add(offset);
		vec3.add(tempVec3, this.#target.getWorldPosition(), tempVec3);
		this.camera.setPosition(tempVec3);

		this.camera.lookAt(this.#target.getWorldPosition(), this.#upVector);//TODO: optimize

		if (this.#enableDamping === true) {
			this.#sphericalDelta.theta *= (1 - this.#dampingFactor);
			this.#sphericalDelta.phi *= (1 - this.#dampingFactor);
			vec3.scale(this.#panOffset, this.#panOffset, 1 - this.#dampingFactor);
		} else {
			this.#sphericalDelta.set(0, 0, 0);
			vec3.set(this.#panOffset, 0, 0, 0);
		}

		this.#scale = 1;

		// update condition is:
		// min(camera displacement, camera rotation in radians)^2 > Number.EPSILON
		// using small-angle approximation cos(x/2)= 1 - x^2 / 8

		if (this.#zoomChanged ||
			vec3.squaredDistance(this.#lastPosition, this.camera._position) > Number.EPSILON ||
			8 * (1 - quat.dot(this.#lastQuaternion, this.camera._quaternion)) > Number.EPSILON) {

			//this.dispatchEvent(changeEvent);

			vec3.copy(this.#lastPosition, this.camera._position);
			quat.copy(this.#lastQuaternion, this.camera._quaternion);
			this.#zoomChanged = false;
			//this.camera.dirtyCameraMatrix = true;

			return true;
		}
		return false;
	}

	set autoRotateSpeed(speed) {
		this.#autoRotateSpeed = 2 * Math.PI / 60 / 60 * speed;
	}

	get zoomScale() {//TODO rename
		return Math.pow(0.95, this.#dollySpeed);
	}

	#rotateLeft(angle) {
		this.#sphericalDelta.theta -= angle;
	}

	#rotateUp(angle) {
		this.#sphericalDelta.phi -= angle;
	}

	#panLeft(distance, rotation) {
		vec3.transformQuat(tempVec3, [1, 0, 0], rotation);
		vec3.scale(tempVec3, tempVec3, -distance);
		vec3.add(this.#panOffset, this.#panOffset, tempVec3);
	}

	#panUp(distance, rotation) {
		vec3.transformQuat(tempVec3, [0, 1, 0], rotation);
		vec3.scale(tempVec3, tempVec3, distance);
		vec3.add(this.#panOffset, this.#panOffset, tempVec3);
	}

	#pan(deltaX, deltaY) {
		var element = this.htmlElement;

		if (this.camera.isPerspective) {

			// perspective
			var position = this.camera.position;
			//offset.copy(position).sub(this.target);
			vec3.sub(tempVec3, position, this.#target.getWorldPosition());//todo // OPTIMIZE:
			var targetDistance = vec3.len(tempVec3);

			// half of the fov is center to top of screen
			targetDistance *= this.camera.getTanHalfVerticalFov();//Math.tan((this.camera.fov / 2)* Math.PI / 180.0);

			// we use only clientHeight here so aspect ratio does not distort speed
			this.#panLeft(2 * deltaX * targetDistance / element.clientHeight, this.camera._quaternion);
			this.#panUp(2 * deltaY * targetDistance / element.clientHeight, this.camera._quaternion);

		} else if (this.camera.isOrthographic) {

			// orthographic
			this.#panLeft(deltaX * (this.camera.right - this.camera.left) / this.camera.orthoZoom / element.clientWidth, this.camera._quaternion);
			this.#panUp(deltaY * (this.camera.top - this.camera.bottom) / this.camera.orthoZoom / element.clientHeight, this.camera._quaternion);

		} else {
			// camera neither orthographic nor perspective
			if (TESTING) {
				console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
			}
			this.#enablePan = false;
		}
	}

	#dollyIn(dollyScale) {
		if (this.camera.isPerspective) {
			this.#scale /= dollyScale;
		} else if (this.camera.isOrthographic) {
			this.camera.orthoZoom = Math.max(this.#minZoom, Math.min(this.#maxZoom, this.camera.orthoZoom * dollyScale));
			this.#zoomChanged = true;

		} else {
			//TODO
			if (TESTING) {
				console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
			}
			this.#enableDolly = false;
		}
	}

	#dollyOut(dollyScale) {
		if (this.camera.isPerspective) {
			this.#scale *= dollyScale;
		} else if (this.camera.isOrthographic) {
			this.camera.orthoZoom = Math.max(this.#minZoom, Math.min(this.#maxZoom, this.camera.orthoZoom / dollyScale));
			this.#zoomChanged = true;
		} else {
			//TODO
			if (TESTING) {
				console.warn('WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.');
			}
			this.#enableDolly = false;
		}
	}

	#handleMouseDownRotate(event) {
		vec2.set(this.#rotateStart, event.clientX, event.clientY);
	}

	#handleMouseDownDolly(event) {
		vec2.set(this.#dollyStart, event.clientX, event.clientY);
	}

	#handleMouseDownPan(event) {
		vec2.set(this.#panStart, event.clientX, event.clientY);
	}

	#handleMouseMoveRotate(event) {
		vec2.set(this.#rotateEnd, event.clientX, event.clientY);
		this.#rotateDelta[0] = event.movementX * this.#rotateSpeed;
		this.#rotateDelta[1] = event.movementY * this.#rotateSpeed;
		//console.error(event.movementX, event.movementY, ...this.#rotateDelta);

		var element = this.htmlElement;

		this.#rotateLeft(2 * Math.PI * this.#rotateDelta[0] / element.clientHeight); // yes, height

		this.#rotateUp(2 * Math.PI * this.#rotateDelta[1] / element.clientHeight);

		vec2.copy(this.#rotateStart, this.#rotateEnd);
		this.update();
	}

	#handleMouseMoveDolly(event) {
		//console.error(event.movementX, event.movementY, ...this.#dollyDelta);
		//dollyEnd.set(event.clientX, event.clientY);
		vec2.set(this.#dollyEnd, event.movementX, event.movementY)

		//dollyDelta.subVectors(dollyEnd, dollyStart);
		//vec2.sub(this.#dollyDelta, this.#dollyEnd, this.#dollyStart);
		vec2.sub(this.#dollyDelta, this.#dollyDelta, this.#dollyEnd);

		if (this.#dollyDelta[1] > 0) {

			this.#dollyIn(this.zoomScale);

		} else if (this.#dollyDelta[1] < 0) {

			this.#dollyOut(this.zoomScale);

		}

		//dollyStart.copy(dollyEnd);
		//vec2.copy(this.#dollyStart, this.#dollyEnd);

		this.update();

	}

	handleMouseMovePan(event) {
		this.#panSpeed = 1.0;
		this.#panDelta[0] = event.movementX * this.#panSpeed;
		this.#panDelta[1] = event.movementY * this.#panSpeed;
		this.#pan(this.#panDelta[0], this.#panDelta[1]);
		this.update();
	}

	handleMouseWheel(event) {
		//console.error(event.deltaY, this.zoomScale);

		if (event.deltaY < 0) {

			this.#dollyOut(this.zoomScale);

		} else if (event.deltaY > 0) {

			this.#dollyIn(this.zoomScale);

		}

		this.update();

	}

	#handleKeyDown(event) {

		var needsUpdate = false;
		if (event.ctrlKey || event.metaKey || event.altKey) {
			return;
		}

		if (event.shiftKey) {
			switch (event.code) {
				case 'ArrowUp':
				case 'KeyW':
					this.#keyRotateVertical = 1;
					break;
				case 'ArrowDown':
				case 'KeyS':
					this.#keyRotateVertical = -1;
					break;
				case 'ArrowLeft':
				case 'KeyA':
					this.#keyRotateHorizontal = 1;
					break;
				case 'ArrowRight':
				case 'KeyD':
					this.#keyRotateHorizontal = -1;
					break;
			}
			return;
		}

		switch (event.code) {

			case 'ArrowUp':
			case 'KeyW':
				this.#pan(0, this.#keyPanSpeed);
				needsUpdate = true;
				break;
			case 'ArrowDown':
			case 'KeyS':
				this.#pan(0, - this.#keyPanSpeed);
				needsUpdate = true;
				break;
			case 'ArrowLeft':
			case 'KeyA':
				this.#pan(this.#keyPanSpeed, 0);
				needsUpdate = true;
				break;
			case 'ArrowRight':
			case 'KeyD':
				this.#pan(- this.#keyPanSpeed, 0);
				needsUpdate = true;
				break;
			/*


			case 'ArrowUp':
			case 'KeyW': /*W* / this.moveForward = true; break;

			case 'ArrowLeft': /*left* /
			case 'KeyA': /*A* / this.moveLeft = true; break;

			case 'ArrowDown': /*down* /
			case 'KeyS': /*S* / this.moveBackward = true; break;

			case 'ArrowRight': /*right* /
			case 'KeyD': /*D* / this.moveRight = true; break;

			case 'KeyR': /*R* / this.moveUp = true; break;
			case 'KeyF': /*F* / this.moveDown = true; break;
			*/


		}

		if (needsUpdate) {

			// prevent the browser from scrolling on cursor keys
			event.preventDefault();

			this.update();
		}
	}

	#handleKeyUp(event) {
		switch (event.code) {
			case 'ArrowUp':
			case 'KeyW':
			case 'ArrowDown':
			case 'KeyS':
				this.#keyRotateVertical = 0;
				break;
			case 'ArrowLeft':
			case 'KeyA':
			case 'ArrowRight':
			case 'KeyD':
				this.#keyRotateHorizontal = 0;
				break;
		}
	}

	#handleTouchStartRotate(event) {

		if (event.touches.length == 1) {
			vec2.set(this.#rotateStart, event.touches[0].pageX, event.touches[0].pageY);

		} else {

			var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
			var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

			vec2.set(this.#rotateStart, x, y);

		}

	}

	#handleTouchStartPan(event) {

		if (event.touches.length == 1) {

			vec2.set(this.#panStart, event.touches[0].pageX, event.touches[0].pageY);

		} else {

			var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
			var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

			vec2.set(this.#panStart, x, y);

		}

	}

	#handleTouchStartDolly(event) {

		var dx = event.touches[0].pageX - event.touches[1].pageX;
		var dy = event.touches[0].pageY - event.touches[1].pageY;

		var distance = Math.sqrt(dx * dx + dy * dy);

		vec2.set(this.#dollyStart, 0, distance);

	}

	#handleTouchStartDollyPan(event) {

		if (this.#enableDolly) this.#handleTouchStartDolly(event);

		if (this.#enablePan) this.#handleTouchStartPan(event);

	}

	#handleTouchStartDollyRotate(event) {

		if (this.#enableDolly) this.#handleTouchStartDolly(event);

		if (this.#enableRotate) this.#handleTouchStartRotate(event);

	}

	#handleTouchMoveRotate(event) {

		if (event.touches.length == 1) {

			vec2.set(this.#rotateEnd, event.touches[0].pageX, event.touches[0].pageY);

		} else {

			var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
			var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

			vec2.set(this.#rotateEnd, x, y);

		}

		vec2.sub(this.#rotateDelta, this.#rotateEnd, this.#rotateStart);
		vec2.scale(this.#rotateDelta, this.#rotateDelta, this.#rotateSpeed);

		var element = this.htmlElement;

		this.#rotateLeft(2 * Math.PI * this.#rotateDelta[0] / element.clientHeight); // yes, height

		this.#rotateUp(2 * Math.PI * this.#rotateDelta[1] / element.clientHeight);

		vec2.copy(this.#rotateStart, this.#rotateEnd);

	}

	#handleTouchMovePan(event) {

		if (event.touches.length == 1) {

			//panEnd.set(event.touches[ 0 ].pageX, event.touches[ 0 ].pageY);
			vec2.set(this.#panEnd, event.touches[0].pageX, event.touches[0].pageY);

		} else {

			var x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
			var y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

			//panEnd.set(x, y);
			vec2.set(this.#panEnd, x, y);
		}

		//panDelta.subVectors(panEnd, panStart).multiplyScalar(this.#panSpeed);
		vec2.scale(this.#panDelta, vec2.sub(this.#panDelta, this.#panEnd, this.#panStart), this.#panSpeed);

		this.#pan(this.#panDelta[0], this.#panDelta[1]);

		vec2.copy(this.#panStart, this.#panEnd);

	}

	#handleTouchMoveDolly(event) {

		var dx = event.touches[0].pageX - event.touches[1].pageX;
		var dy = event.touches[0].pageY - event.touches[1].pageY;

		var distance = Math.sqrt(dx * dx + dy * dy);

		//dollyEnd.set(0, distance);
		vec2.set(this.#dollyEnd, 0, distance);

		vec2.set(this.#dollyDelta, 0, Math.pow(this.#dollyEnd[1] / this.#dollyStart[1], this.#dollySpeed));

		this.#dollyIn(this.#dollyDelta[1]);

		//dollyStart.copy(this.#dollyEnd);
		vec2.copy(this.#dollyStart, this.#dollyEnd);

	}

	#handleTouchMoveDollyPan(event) {

		if (this.#enableDolly) this.#handleTouchMoveDolly(event);

		if (this.#enablePan) this.#handleTouchMovePan(event);

	}

	#handleTouchMoveDollyRotate(event) {

		if (this.#enableDolly) this.#handleTouchMoveDolly(event);

		if (this.#enableRotate) this.#handleTouchMoveRotate(event);

	}

	#onMouseDown(event) {
		if (this.enabled === false) {
			return;
		}

		// Prevent the browser from scrolling.
		event.preventDefault();

		// Manually set the focus since calling preventDefault above
		// prevents the browser from setting it automatically.

		//this.htmlElement.focus ? this.htmlElement.focus(): window.focus();

		let action = this.#mouseButtons[event.button];

		const MOUSE = { LEFT: 0, MIDDLE: 1, RIGHT: 2, ROTATE: 0, DOLLY: 1, PAN: 2, NONE: -1 };
		const mouseButtons = { LEFT: MOUSE.ROTATE, MIDDLE: MOUSE.DOLLY, RIGHT: MOUSE.PAN };

		switch (action) {
			case MOUSE.ROTATE:
				if (this.#enableRotate) {
					this.#handleMouseDownRotate(event);
					this.#state = STATE.ROTATE;
					event.target.requestPointerLock();
				}
				break;
			case MOUSE.DOLLY:
				if (this.#enableDolly) {
					this.#handleMouseDownDolly(event);
					this.#state = STATE.DOLLY;
					event.target.requestPointerLock();
				}
				break;
			case MOUSE.PAN:
				if (this.#enablePan) {
					this.#handleMouseDownPan(event);
					this.#state = STATE.PAN;
					event.target.requestPointerLock();
				}
				break;
		}
	}

	#onMouseMove(event) {
		if (this.enabled === false) {
			return;
		}

		event.preventDefault();
		switch (this.#state) {
			case STATE.ROTATE:
				if (this.#enableRotate === false) return;
				this.#handleMouseMoveRotate(event);
				break;
			case STATE.DOLLY:
				if (this.#enableDolly === false) return;
				this.#handleMouseMoveDolly(event);
				break;
			case STATE.PAN:
				if (this.#enablePan === false) return;
				this.handleMouseMovePan(event);
				break;
		}
	}

	#onMouseUp(event) {
		document.exitPointerLock();

		if (this.enabled === false) {
			return;
		}

		this.#state = STATE.NONE;
	}

	#onMouseWheel(event) {
		if (this.enabled === false || this.#enableDolly === false || (this.#state !== STATE.NONE && this.#state !== STATE.ROTATE)) return;

		event.preventDefault();
		event.stopPropagation();

		this.handleMouseWheel(event);
	}

	#onKeyDown(event) {
		if (event.target instanceof HTMLInputElement ||
			event.target instanceof HTMLTextAreaElement
		) {
			return;
		}
		if (this.enabled === false || this.#enableKeys === false || this.#enablePan === false) return;
		this.#handleKeyDown(event);
	}

	#onKeyUp(event) {
		if (event.target instanceof HTMLInputElement ||
			event.target instanceof HTMLTextAreaElement
		) {
			return;
		}
		if (this.enabled === false || this.#enableKeys === false || this.#enablePan === false) return;
		this.#handleKeyUp(event);
	}

	#onTouchStart(event) {

		if (this.enabled === false) return;

		event.preventDefault();

		switch (event.touches.length) {

			case 1:

				switch (touches.ONE) {

					case TOUCH.ROTATE:

						if (this.#enableRotate === false) return;

						this.#handleTouchStartRotate(event);

						this.#state = STATE.TOUCH_ROTATE;

						break;

					case TOUCH.PAN:

						if (this.#enablePan === false) return;

						this.#handleTouchStartPan(event);

						this.#state = STATE.TOUCH_PAN;

						break;

					default:

						this.#state = STATE.NONE;

				}

				break;

			case 2:

				switch (touches.TWO) {

					case TOUCH.DOLLY_PAN:

						if (this.#enableDolly === false && this.#enablePan === false) return;

						this.#handleTouchStartDollyPan(event);

						this.#state = STATE.TOUCH_DOLLY_PAN;

						break;

					case TOUCH.DOLLY_ROTATE:

						if (this.#enableDolly === false && this.#enableRotate === false) return;

						this.#handleTouchStartDollyRotate(event);

						this.#state = STATE.TOUCH_DOLLY_ROTATE;

						break;

					default:

						this.#state = STATE.NONE;

				}

				break;

			default:

				this.#state = STATE.NONE;

		}

		if (this.#state !== STATE.NONE) {

			//this.dispatchEvent(startEvent);

		}

	}

	#onTouchMove(event) {
		if (this.enabled === false) return;

		event.preventDefault();
		event.stopPropagation();

		switch (this.#state) {
			case STATE.TOUCH_ROTATE:
				if (this.#enableRotate === false) return;
				this.#handleTouchMoveRotate(event);
				this.update();
				break;
			case STATE.TOUCH_PAN:
				if (this.#enablePan === false) return;
				this.#handleTouchMovePan(event);
				this.update();
				break;
			case STATE.TOUCH_DOLLY_PAN:
				if (this.#enableDolly === false && this.#enablePan === false) return;
				this.#handleTouchMoveDollyPan(event);
				this.update();
				break;
			case STATE.TOUCH_DOLLY_ROTATE:
				if (this.#enableDolly === false && this.#enableRotate === false) return;
				this.#handleTouchMoveDollyRotate(event);
				this.update();
				break;
			default:
				this.#state = STATE.NONE;
		}
	}

	#onTouchCancel(event) {
		if (this.enabled === false) {
			return;
		}
		this.#state = STATE.NONE;
	}

	#onContextMenu(event) {
		if (this.enabled === false) return;
		event.preventDefault();
	}

	#setupEventsListeners() {
		this.htmlElement.addEventListener('contextmenu', event => this.#onContextMenu(event), false);

		this.htmlElement.addEventListener('mousedown', event => this.#onMouseDown(event), false);
		this.htmlElement.addEventListener('mousemove', event => this.#onMouseMove(event), false);
		this.htmlElement.addEventListener('mouseup', event => this.#onMouseUp(event), false);
		this.htmlElement.addEventListener('wheel', event => this.#onMouseWheel(event), false);

		this.htmlElement.addEventListener('touchstart', event => this.#onTouchStart(event), false);
		this.htmlElement.addEventListener('touchmove', event => this.#onTouchMove(event), false);
		this.htmlElement.addEventListener('touchcancel', event => this.#onTouchCancel(event));

		this.htmlElement.addEventListener('keydown', event => this.#onKeyDown(event), false);
		this.htmlElement.addEventListener('keyup', event => this.#onKeyUp(event), false);

		GraphicsEvents.addEventListener(GraphicsEvent.Tick, (event: CustomEvent) => this.update(event.detail.delta));
		// make sure element can receive keys.

		/*if(this.htmlElement.tabIndex === - 1) {
			this.htmlElement.tabIndex = 0;
		}*/
	}

	handleEnabled() {
		if (this.enabled) {
			this.update();
		}
	}
}

/*OrbitControls.prototype = Object.create(EventTarget.prototype);
OrbitControls.prototype.constructor = OrbitControls;*/


// This set of controls performs orbiting, dollying(zooming), and panning.
// Unlike TrackballControls, it maintains the 'up' direction object.up(+Y by default).
// This is very similar to OrbitControls, another set of touch behavior
//
// Orbit - right mouse, or left mouse + ctrl/meta/shiftKey / touch: two-finger rotate
// Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
// Pan - left mouse, or arrow keys / touch: one-finger move

/*var MapControls = function(object, htmlElement) {

	OrbitControls.call(this, object, htmlElement);

	this.#mouseButtons.LEFT = MOUSE.PAN;
	this.#mouseButtons.RIGHT = MOUSE.ROTATE;

	this.touches.ONE = TOUCH.PAN;
	this.touches.TWO = TOUCH.DOLLY_ROTATE;

};

MapControls.prototype = Object.create(EventTarget.prototype);
MapControls.prototype.constructor = MapControls;*/
