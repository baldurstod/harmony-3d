import { mat4, quat, vec3, vec4 } from 'gl-matrix';
import { Camera } from '../cameras/camera';
import { LightShadow } from './lightshadow';
import { PointLight } from './pointlight';

const worldPos = vec3.create();

const cubeDirections = [
	vec3.fromValues(1, 0, 0), vec3.fromValues(- 1, 0, 0), vec3.fromValues(0, 0, 1),
	vec3.fromValues(0, 0, - 1), vec3.fromValues(0, 1, 0), vec3.fromValues(0, - 1, 0)
];

const cubeUps = [
	vec3.fromValues(0, 1, 0), vec3.fromValues(0, 1, 0), vec3.fromValues(0, 1, 0),
	vec3.fromValues(0, 1, 0), vec3.fromValues(0, 0, 1), vec3.fromValues(0, 0, - 1)
];

const S2 = Math.SQRT1_2;
const DIRECTIONS = [
	quat.fromValues(0, -S2, 0, S2),//+x
	quat.fromValues(0, S2, 0, S2),//-x
	quat.fromValues(0, 1, 0, 0),//+z
	quat.fromValues(0, 0, 0, 1),//-z
	quat.fromValues(S2, 0, 0, S2),//+y
	quat.fromValues(-S2, 0, 0, S2),//-y
]


export class PointLightShadow extends LightShadow {
	constructor(light: PointLight) {
		super(light, new Camera({ nearPlane: 1, farPlane: 1000, verticalFov: 90 }));//TODO: adjust default variables
		this.range = this.light.range;
		this.viewPorts = [
			vec4.fromValues(0.5, 0.5, 0.25, 0.5),
			vec4.fromValues(0, 0.5, 0.25, 0.5),
			vec4.fromValues(0.75, 0.5, 0.25, 0.5),
			vec4.fromValues(0.25, 0.5, 0.25, 0.5),
			vec4.fromValues(0.75, 0, 0.25, 0.5),
			vec4.fromValues(0.25, 0, 0.25, 0.5),
			/*vec4.fromValues(2, 1, 1, 1),
			vec4.fromValues(0, 1, 1, 1),
			vec4.fromValues(3, 1, 1, 1),
			vec4.fromValues(1, 1, 1, 1),
			vec4.fromValues(3, 0, 1, 1),
			vec4.fromValues(1, 0, 1, 1),*/
		];
		this.viewPortsLength = 6;
	}

	computeShadowMatrix(mapIndex: number): void {
		const shadowCamera = this.camera;
		const shadowMatrix = this.shadowMatrix;

		const direction = DIRECTIONS[mapIndex];
		if (direction) {
			shadowCamera.setWorldQuaternion(direction);
		}
		shadowCamera.dirty();

		shadowCamera.getWorldPosition(worldPos);
		vec3.scale(worldPos, worldPos, -1);
		mat4.fromTranslation(shadowMatrix, worldPos);
	}
}
