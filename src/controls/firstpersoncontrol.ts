import { quat, vec2, vec3 } from 'gl-matrix';
import { CameraControl } from './cameracontrol'
import { Spherical } from './spherical'
import { DEG_TO_RAD, RAD_TO_DEG } from '../math/constants';
import { clamp } from '../math/functions';
import { Camera } from '../cameras/camera';
import { GraphicKeyboardEventData, GraphicMouseEventData, GraphicsEvent, GraphicsEvents } from '../graphics/graphicsevents';

const xUnitVec3 = vec3.fromValues(1, 0, 0);
const yUnitVec3 = vec3.fromValues(0, 1, 0);
const zUnitVec3 = vec3.fromValues(0, 0, 1);
const minusZUnitVec3 = vec3.fromValues(0, 0, -1);
const tempVec3 = vec3.create();
const spherical = new Spherical();

export class FirstPersonControl extends CameraControl {
	#enableDamping = false;
	#dampingFactor = 0.05;
	#sphericalDelta = new Spherical();
	#rotateDelta = vec2.create();
	movementSpeed = 1.0;
	lookSpeed = 0.005;
	#rotateSpeed = 0.3;
	lookVertical = true;
	autoForward = false;
	activeLook = true;
	heightSpeed = false;
	heightCoef = 1.0;
	heightMin = 0.0;
	heightMax = 1.0;
	constrainVertical = false;
	verticalMin = 0;
	verticalMax = Math.PI;
	#mouseDragOn = false;
	#autoSpeedFactor = 0.0;
	#mouseX = 0;
	#mouseY = 0;
	#moveForward = false;
	#moveBackward = false;
	#moveLeft = false;
	#moveRight = false;
	#moveUp = false;
	#moveDown = false;
	#viewHalfX = 0;
	#viewHalfY = 0;
	#lat = 0;
	#lon = 0;
	#startLat = 0;
	#startLon = 0;
	#click = false;
	#q = quat.create();
	#quatInverse = quat.create();
	//#clickOffsetX: number;
	//#clickOffsetY: number;

	constructor(camera: Camera) {
		super(camera);




		//private


		//var target = vec3.create();


		//todo: set in webglcanvas
		/*if (this.htmlElement !== document) {
			this.htmlElement.setAttribute('tabindex', - 1);
		}*/

		this.#setupEventsListeners();
		this.#handleResize();
		//this.update();
		quat.invert(this.#quatInverse, this.#q);

		this.#setOrientation();
	}

	#handleResize() {
		return;
		/*
		if (this.htmlElement === document) {
			this.viewHalfX = window.innerWidth / 2;
			this.viewHalfY = window.innerHeight / 2;
		} else {
			this.viewHalfX = this.htmlElement.offsetWidth / 2;
			this.viewHalfY = this.htmlElement.offsetHeight / 2;
		}
			*/
	}

	#onMouseDown(event: CustomEvent<GraphicMouseEventData>) {
		if (!this.enabled) {
			return;
		}
		//if (this.htmlElement !== document) {
		//this.htmlElement.focus();
		//}

		//event.preventDefault();
		//event.stopPropagation();
		const mouseEvent = event.detail.mouseEvent;

		if (this.activeLook) {
			switch (mouseEvent.button) {
				case 0:
					this.#click = true;
					//this.#clickOffsetX = mouseEvent.offsetX;
					//this.#clickOffsetY = mouseEvent.offsetY;
					this.#startLat = this.#lat;
					this.#startLon = this.#lon;
					this.#mouseX = 0;
					this.#mouseY = 0;
					break;
				//case 0: this.#moveForward = true; break;
				//case 2: this.#moveBackward = true; break;
			}
		}
		(event.target as Element).requestPointerLock();
		this.#mouseDragOn = true;
	}

	#onMouseUp(event: CustomEvent<GraphicMouseEventData>) {
		document.exitPointerLock();
		const mouseEvent = event.detail.mouseEvent;
		mouseEvent.preventDefault();
		//event.stopPropagation();
		if (this.activeLook) {
			switch (mouseEvent.button) {
				case 0:
					this.#click = false;

					this.#startLat = this.#lat;
					this.#startLon = this.#lon;
					break;
				case 0: this.#moveForward = false; break;
				case 2: this.#moveBackward = false; break;
			}
		}
		this.#mouseDragOn = false;
	}

	#onMouseMove(event: CustomEvent<GraphicMouseEventData>) {
		const mouseEvent = event.detail.mouseEvent;
		if (this.#mouseDragOn) {
			if (false/*this.htmlElement === document*/) {
				/*
				this.#mouseX = (event.pageX - this.viewHalfX);
				this.#mouseY = (event.pageY - this.viewHalfY);
				*/
			} else {
				/*this.#mouseX = (event.offsetX - this.viewHalfX - this.#clickOffsetX);
				this.#mouseY = (event.offsetY - this.viewHalfY - this.#clickOffsetY);
				this.#mouseX = (event.offsetX - this.#clickOffsetX);
				this.#mouseY = (event.offsetY - this.#clickOffsetY);*/

				this.#mouseX += mouseEvent.movementX;
				this.#mouseY += mouseEvent.movementY;
				//console.error(event, this.#clickOffsetX, this.#clickOffsetY);
			}
			//console.error(this.#mouseX, this.#mouseY);


			this.#rotateDelta[0] = mouseEvent.movementX * this.#rotateSpeed;
			this.#rotateDelta[1] = mouseEvent.movementY * this.#rotateSpeed;
			//console.error(event.movementX, event.movementY, ...this.#rotateDelta);

			const element = mouseEvent.target as Element;

			this.#rotateLeft(2 * Math.PI * this.#rotateDelta[0] / element.clientHeight); // yes, height

			this.#rotateUp(-2 * Math.PI * this.#rotateDelta[1] / element.clientHeight);

		}
	}
	#onKeyDown(event: CustomEvent<GraphicKeyboardEventData>) {
		//event.preventDefault();

		switch (event.detail.keyboardEvent.code) {
			case 'ArrowUp':
			case 'KeyW':
				this.#moveForward = true;
				break;
			case 'ArrowLeft':
			case 'KeyA':
				this.#moveLeft = true;
				break;
			case 'ArrowDown':
			case 'KeyS':
				this.#moveBackward = true;
				break;
			case 'ArrowRight':
			case 'KeyD':
				this.#moveRight = true;
				break;
			case 'Space':
				this.#moveUp = true;
				break;
			case 'KeyC':
				this.#moveDown = true;
				break;

		}
		//console.error(event.code);//removeme
	}

	#onKeyUp(event: CustomEvent<GraphicKeyboardEventData>) {
		switch (event.detail.keyboardEvent.code) {
			case 'ArrowUp':
			case 'KeyW':
				this.#moveForward = false;
				break;
			case 'ArrowLeft':
			case 'KeyA':
				this.#moveLeft = false;
				break;
			case 'ArrowDown':
			case 'KeyS':
				this.#moveBackward = false;
				break;
			case 'ArrowRight':
			case 'KeyD':
				this.#moveRight = false;
				break;
			case 'Space':
				this.#moveUp = false;
				break;
			case 'KeyC':
				this.#moveDown = false;
				break;
		}
	}

	update(delta = 0) {
		if (this.enabled === false) {
			return;
		}

		if (this.heightSpeed) {
			const y = clamp(this.camera?.position[1] ?? 0, this.heightMin, this.heightMax);//TODO
			const heightDelta = y - this.heightMin;

			this.#autoSpeedFactor = delta * (heightDelta * this.heightCoef);
		} else {
			this.#autoSpeedFactor = 0.0;
		}

		const actualMoveSpeed = delta * this.movementSpeed;

		if (this.#moveForward || (this.autoForward && !this.#moveBackward)) {
			this.camera?.translateZ(-(actualMoveSpeed + this.#autoSpeedFactor));
		}
		if (this.#moveBackward) {
			this.camera?.translateZ(actualMoveSpeed);
		}

		if (this.#moveLeft) {
			this.camera?.translateX(- actualMoveSpeed);
		}
		if (this.#moveRight) {
			this.camera?.translateX(actualMoveSpeed);
		}

		if (this.#moveUp) {
			this.camera?.translateY(actualMoveSpeed);
		}
		if (this.#moveDown) {
			this.camera?.translateY(- actualMoveSpeed);
		}

		let actualLookSpeed = this.lookSpeed;

		if (!this.activeLook) {
			actualLookSpeed = 0;
		}

		if (!this.#click) {

			actualLookSpeed = 0;

		}

		let verticalLookRatio = 1;

		if (this.constrainVertical) {

			verticalLookRatio = Math.PI / (this.verticalMax - this.verticalMin);

		}

		//this.#lon -= this.#mouseX * actualLookSpeed;
		this.#lon = this.#startLon - this.#mouseX * actualLookSpeed;
		if (this.#click) {
			//console.error(this.#lon, this.#lat, this.#mouseX, this.#mouseY , actualLookSpeed , verticalLookRatio);
		}
		if (this.lookVertical) {
			this.#lat = this.#startLat - this.#mouseY * actualLookSpeed * verticalLookRatio;
		}
		if (this.#click) {
			//console.error(this.#lat);
		}


		if (this.#enableDamping) {
			spherical.theta += this.#sphericalDelta.theta * this.#dampingFactor;
			spherical.phi += this.#sphericalDelta.phi * this.#dampingFactor;
		} else {
			spherical.theta += this.#sphericalDelta.theta;
			spherical.phi += this.#sphericalDelta.phi;
		}

		//this.#lat = Math.max(- 85, Math.min(85, this.#lat));
		//this.#lat = 90;//removeme

		let phi = DEG_TO_RAD * (90 - this.#lat);
		const theta = DEG_TO_RAD * (this.#lon);


		if (this.#click) {
			//console.error(this.#lon, this.#lat, this.#mouseX, this.#mouseY , phi , theta);
		}

		function mapLinear(x: number, a1: number, a2: number, b1: number, b2: number) {
			return b1 + (x - a1) * (b2 - b1) / (a2 - a1);
		}
		if (this.constrainVertical) {
			phi = mapLinear(phi, 0, Math.PI, this.verticalMin, this.verticalMax);
		}

		const position = this.camera?.position ?? vec3.create()/*TODO: optimize*/;

		spherical.toCartesian(tempVec3);

		// rotate offset back to 'camera-up-vector-is-up' space
		//offset.applyQuaternion(quatInverse);
		//vec3.transformQuat(tempVec3, tempVec3, this.#quatInverse);

		//position.copy(this.target).add(offset);
		vec3.add(position, position, tempVec3);

		this.camera?.lookAt(position);//TODO: optimize

		if (this.#enableDamping === true) {
			this.#sphericalDelta.theta *= (1 - this.#dampingFactor);
			this.#sphericalDelta.phi *= (1 - this.#dampingFactor);
			//this.panOffset.multiplyScalar(1 - this.#dampingFactor);
		} else {
			this.#sphericalDelta.set(0, 0, 0);
			//vec3.set(this.panOffset, 0, 0, 0);
		}
		return;




		/*

		def from_spherical_coords(theta_phi, phi=None):
		"""Return the quaternion corresponding to these spherical coordinates

		Assumes the spherical coordinates correspond to the quaternion R via

			R = exp(phi*z/2) * exp(theta*y/2)

		The angles naturally must be in radians for this to make any sense.

		Note that this quaternion rotates `z` onto the point with the given
		spherical coordinates, but also rotates `x` and `y` onto the usual basis
		vectors (theta and phi, respectively) at that point.

		Parameters
		----------
		theta_phi: float or array of floats
			This argument may either contain an array with last dimension of
			size 2, where those two elements describe the (theta, phi) values in
			radians for each point; or it may contain just the theta values in
			radians, in which case the next argument must also be given.
		phi: None, float, or array of floats
			If this array is given, it must be able to broadcast against the
			first argument.

		Returns
		-------
		R: quaternion array
			If the second argument is not given to this function, the shape
			will be the same as the input shape except for the last dimension,
			which will be removed.If the second argument is given, this
			output array will have the shape resulting from broadcasting the
			two input arrays against each other.

		"""
		# Figure out the input angles from either type of input
		if phi is None:
			theta_phi = np.asarray(theta_phi, dtype=np.double)
			theta = theta_phi[..., 0]
			phi = theta_phi[..., 1]
		else:
			theta = np.asarray(theta_phi, dtype=np.double)
			phi = np.asarray(phi, dtype=np.double)

		# Set up the output array
		R = np.empty(np.broadcast(theta, phi).shape + (4,), dtype=np.double)

		# Compute the actual values of the quaternion components
		R[..., 0] = np.cos(phi/2)*np.cos(theta/2) # scalar quaternion components
		R[..., 1] = -np.sin(phi/2)*np.sin(theta/2) # x quaternion components
		R[..., 2] = np.cos(phi/2)*np.sin(theta/2) # y quaternion components
		R[..., 3] = np.sin(phi/2)*np.cos(theta/2) # z quaternion components

		return as_quat_array(R)
		*/

	}
	/*
	contextmenu(event) {
		event.preventDefault();
	}
	*/

	#setOrientation() {
		/*

		var position = this.camera._position;

		//offset.copy(position).sub(this.target);
		vec3.sub(tempVec3, position, this._target);

		// rotate offset to 'y-axis-is-up' space
		//offset.applyQuaternion(q);
		vec3.transformQuat(tempVec3, tempVec3, this.#q);

		// angle from z-axis around y-axis
		spherical.setFromVector3(tempVec3);
		*/


		vec3.copy(tempVec3, xUnitVec3/*minusZUnitVec3*/);
		vec3.transformQuat(tempVec3, tempVec3, this.camera?._quaternion ?? quat.create()/*TODO: optimize*/);
		spherical.setFromVector3(tempVec3);

		this.#lat = -(90 - RAD_TO_DEG * (spherical.phi));
		this.#lon = -RAD_TO_DEG * (spherical.theta);
		this.#startLat = this.#lat;
		this.#startLon = this.#lon;
		this.update();
	}

	/*
	#onContextMenu(event) {
		if (this.enabled === false) return;
		event.preventDefault();
	}
	*/

	#setupEventsListeners() {
		//this.htmlElement.addEventListener('contextmenu', event => this.#onContextMenu(event));
		//this.htmlElement.addEventListener('mousemove', event => this.#onMouseMove(event));
		GraphicsEvents.addEventListener(GraphicsEvent.MouseMove, (event: Event) => this.#onMouseMove(event as CustomEvent<GraphicMouseEventData>));
		//this.htmlElement.addEventListener('mousedown', event => this.#onMouseDown(event));
		GraphicsEvents.addEventListener(GraphicsEvent.MouseDown, (event: Event) => this.#onMouseDown(event as CustomEvent<GraphicMouseEventData>));
		//this.htmlElement.addEventListener('mouseup', event => this.#onMouseUp(event));
		GraphicsEvents.addEventListener(GraphicsEvent.MouseUp, (event: Event) => this.#onMouseUp(event as CustomEvent<GraphicMouseEventData>));

		//this.htmlElement.addEventListener('keydown', event => this.#onKeyDown(event), false);
		GraphicsEvents.addEventListener(GraphicsEvent.KeyDown, (event: Event) => this.#onKeyDown(event as CustomEvent<GraphicKeyboardEventData>));
		//this.htmlElement.addEventListener('keyup', event => this.#onKeyUp(event), false);
		GraphicsEvents.addEventListener(GraphicsEvent.KeyUp, (event: Event) => this.#onKeyUp(event as CustomEvent<GraphicKeyboardEventData>));
	}

	setupCamera() {
		if (this.camera) {
			quat.rotationTo(this.#q, this.camera.upVector, zUnitVec3);
			this.#quatInverse = quat.invert(this.#quatInverse, this.#q);

			vec3.transformQuat(tempVec3, minusZUnitVec3, this.camera.quaternion);
			spherical.setFromVector3(tempVec3);
		}
	}

	handleEnabled() {
		if (this.enabled) {
			this.setupCamera();
		}
	}

	#rotateLeft(angle: number) {
		this.#sphericalDelta.theta -= angle;
	}

	#rotateUp(angle: number) {
		this.#sphericalDelta.phi -= angle;
	}
}
