import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

export class SetControlPointsToModelParticles extends Operator {
	#followAttachment = false;
	#attachmentName = '';
	hitboxSetName = 'default';
	#firstControlPoint = 0;
	numControlPoints = 1;
	firstSourcePoint = 0;
	skin = false;

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_HitboxSetName':
				console.error('do this param', paramName, param);
				this.hitboxSetName = param;
				break;
			case 'm_AttachmentName':
				this.#attachmentName = param.getValueAsString() ?? '';
				break;
			case 'm_nFirstControlPoint':
				this.#firstControlPoint = param.getValueAsNumber() ?? 0;
				break;
			case 'm_nNumControlPoints':
				console.error('do this param', paramName, param);
				this.numControlPoints = (param);
				break;
			case 'm_nFirstSourcePoint':
				console.error('do this param', paramName, param);
				this.firstSourcePoint = (param);
				break;
			case 'm_bSkin':
				console.error('do this param', paramName, param);
				this.skin = param;
				throw 'TODO: what is this skin param'
				break;
			case 'm_bAttachment':
				this.#followAttachment = param.getValueAsBool() ?? false;
				break;
			default:
				super._paramChanged(paramName, param);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number) {
		//todo: use m_bSkin m_bAttachment m_HitboxSetName m_AttachmentName
		const children = this.system.childSystems;
		const firstControlPoint = this.#firstControlPoint;
		const firstSourcePoint = this.firstSourcePoint;


		for (let i = 0; i < this.numControlPoints; ++i) {
			const particle = this.system.livingParticles[firstSourcePoint + i];
			if (particle) {
				for (const child of children) {
					const childCp = child.getOwnControlPoint(firstControlPoint + i);
					childCp.position = particle.position;

					if (this.#followAttachment) {
						const model = this.system.getParentModel();
						if (model) {
							const attachment = (model as any).getAttachment?.(this.#attachmentName);
							if (attachment) {
								childCp.quaternion = attachment.getWorldQuaternion();
								childCp.quaternion = particle.quaternion;
							}
						}
					}
					if (childCp.lastComputed == -1) {
						// Discard the delta if it's a newly create control point
						childCp.resetDelta();
					}
				}
			}
		}
	}
}
RegisterSource2ParticleOperator('C_OP_SetControlPointsToModelParticles', SetControlPointsToModelParticles);
