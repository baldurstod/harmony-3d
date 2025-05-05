import { RegisterSource2ParticleOperator } from '../source2particleoperators';
import { Operator, Source2OperatorParamValue } from '../operator';
import { Source2Particle } from '../../source2particle';

export class SetControlPointsToModelParticles extends Operator {
	#followAttachement = false;
	#attachmentName = '';
	hitboxSetName = 'default';
	firstControlPoint = 0;
	numControlPoints = 1;
	firstSourcePoint = 0;
	skin = false;

	_paramChanged(paramName: string, value: Source2OperatorParamValue) {
		switch (paramName) {
			case 'm_HitboxSetName':
				this.hitboxSetName = value;
				break;
			case 'm_AttachmentName':
				this.#attachmentName = value;
				break;
			case 'm_nFirstControlPoint':
				this.firstControlPoint = Number(value);
				break;
			case 'm_nNumControlPoints':
				this.numControlPoints = Number(value);
				break;
			case 'm_nFirstSourcePoint':
				this.firstSourcePoint = Number(value);
				break;
			case 'm_bSkin':
				this.skin = value;
				break;
			case 'm_bAttachment':
				this.#followAttachement = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	doOperate(particle: Source2Particle, elapsedTime: number) {
		//todo: use m_bSkin m_bAttachment m_HitboxSetName m_AttachmentName
		let children = this.system.childSystems;
		let firstControlPoint = this.firstControlPoint;
		let firstSourcePoint = this.firstSourcePoint;


		for (let i = 0; i < this.numControlPoints; ++i) {
			let particle = this.system.livingParticles[firstSourcePoint + i];
			if (particle) {
				for (let child of children) {
					let childCp = child.getOwnControlPoint(firstControlPoint + i);
					childCp.position = particle.position;

					if (this.#followAttachement) {
						const model = this.system.getParentModel();
						if (model) {
							const attachement = (model as any).getAttachement?.(this.#attachmentName);
							if (attachement) {
								childCp.quaternion = attachement.getWorldQuaternion();
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
