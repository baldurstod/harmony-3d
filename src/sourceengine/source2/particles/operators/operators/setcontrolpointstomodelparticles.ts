import { Source2Particle } from '../../source2particle';
import { Operator } from '../operator';
import { OperatorParam } from '../operatorparam';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';


const DEFAULT_FOLLOW_ATTACHMENT = false;// TODO: check default value
const DEFAULT_ATTACHMENT_NAME = '';// TODO: check default value
const DEFAULT_HITBOX_SET_NAME = 'default';// TODO: check default value
const DEFAULT_FIRST_CONTROL_POINT = 0;// TODO: check default value
const DEFAULT_FIRST_SOURCE_POINT = 0;// TODO: check default value
const DEFAULT_NUM_CONTROL_POINT = 1;// TODO: check default value
const DEFAULT_SKIN = false;// TODO: check default value

export class SetControlPointsToModelParticles extends Operator {
	#followAttachment = DEFAULT_FOLLOW_ATTACHMENT;
	#attachmentName = DEFAULT_ATTACHMENT_NAME;
	#hitboxSetName = DEFAULT_HITBOX_SET_NAME;
	#firstControlPoint = DEFAULT_FIRST_CONTROL_POINT;
	#numControlPoints = DEFAULT_NUM_CONTROL_POINT;
	firstSourcePoint = DEFAULT_FIRST_SOURCE_POINT;
	#skin = DEFAULT_SKIN;//TODO: remove ?

	_paramChanged(paramName: string, param: OperatorParam): void {
		switch (paramName) {
			case 'm_HitboxSetName':
				this.#hitboxSetName = param.getValueAsString() ?? DEFAULT_HITBOX_SET_NAME;
				break;
			case 'm_AttachmentName':
				this.#attachmentName = param.getValueAsString() ?? DEFAULT_ATTACHMENT_NAME;
				break;
			case 'm_nFirstControlPoint':
				this.#firstControlPoint = param.getValueAsNumber() ?? DEFAULT_FIRST_CONTROL_POINT;
				break;
			case 'm_nNumControlPoints':
				this.#numControlPoints = param.getValueAsNumber() ?? DEFAULT_NUM_CONTROL_POINT;
				break;
			case 'm_nFirstSourcePoint':
				this.firstSourcePoint = param.getValueAsNumber() ?? DEFAULT_FIRST_SOURCE_POINT;
				break;
			case 'm_bSkin':
				this.#skin = param.getValueAsBool() ?? DEFAULT_SKIN;
				break;
			case 'm_bAttachment':
				this.#followAttachment = param.getValueAsBool() ?? DEFAULT_FOLLOW_ATTACHMENT;
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


		for (let i = 0; i < this.#numControlPoints; ++i) {
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
