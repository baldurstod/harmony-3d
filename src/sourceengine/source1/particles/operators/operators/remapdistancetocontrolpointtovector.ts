import { vec3 } from 'gl-matrix';
import { PARAM_TYPE_BOOL, PARAM_TYPE_FLOAT, PARAM_TYPE_INT, PARAM_TYPE_VECTOR } from '../../constants';
import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleSystem } from '../../sourceengineparticlesystem';
import { SourceEngineParticleOperator } from '../operator';

const tempVec3 = vec3.create();

export class RemapDistanceToControlPointToVector extends SourceEngineParticleOperator {
	static functionName = 'Remap Distance to Control Point to Vector';

	constructor(system: SourceEngineParticleSystem) {
		super(system);
		this.addParam('control point', PARAM_TYPE_INT, 0);
		//this.addParam('distance fade range', PARAM_TYPE_INT, 0);

		this.addParam('distance minimum', PARAM_TYPE_FLOAT, 0);
		this.addParam('distance maximum', PARAM_TYPE_FLOAT, 1);

		this.addParam('output minimum', PARAM_TYPE_VECTOR, vec3.fromValues(0, 0, 0));
		this.addParam('output maximum', PARAM_TYPE_VECTOR, vec3.fromValues(1, 1, 1));

		this.addParam('output field', PARAM_TYPE_INT, 1);
		//this.addParam('output is scalar of initial random range', PARAM_TYPE_BOOL, 0);

		this.addParam('only active within specified distance', PARAM_TYPE_BOOL, 0);
	}

	doOperate(particle) {
		const cpNumber = this.getParameter('control point');
		const distanceMin = this.getParameter('distance minimum');
		const distanceMax = this.getParameter('distance maximum');
		const deltaDistance = distanceMax - distanceMin;

		const outputMin = this.getParameter('output minimum');
		const outputMax = this.getParameter('output maximum');

		const field = this.getParameter('output field');
		const activeDistance = this.getParameter('only active within specified distance');

		const cp = this.particleSystem.getControlPoint(cpNumber);
		if (cp == undefined) {
			return;
		}


		vec3.subtract(tempVec3, particle.cpPosition, particle.position);
		const deltaL = vec3.length(tempVec3);
		if (activeDistance && (deltaL < distanceMin || deltaL > distanceMax)) {
			// Outside distance window
			return;
		}

		vec3.lerp(tempVec3, outputMin, outputMax, (deltaL - distanceMin) / deltaDistance);

		particle.setField(field, tempVec3);
	}
}

SourceEngineParticleOperators.registerOperator(RemapDistanceToControlPointToVector);


/*
		"DmeParticleOperator"
		{
			"id" "elementid" "0d3d4ec1-b821-4970-a69d-57c97da97915"
			"name" "string" "Remap Distance to Control Point to Vector"
			"functionName" "string" "Remap Distance to Control Point to Vector"
			"operator start fadein" "float" "0"
			"operator end fadein" "float" "0"
			"operator start fadeout" "float" "0"
			"operator end fadeout" "float" "0"
			"operator fade oscillate" "float" "0"
			"distance minimum" "float" "0"
			"distance maximum" "float" "64"
			"output field" "int" "6"
			"output minimum" "vector3" "0 1 0"
			"output maximum" "vector3" "1.5 0 3"
			"control point" "int" "0"
			"only active within specified distance" "bool" "1"
			"local space CP" "int" "-1"
		}
	]
					*/
