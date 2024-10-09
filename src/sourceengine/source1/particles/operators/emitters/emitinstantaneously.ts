import { SourceEngineParticleOperators } from '../../sourceengineparticleoperators';
import { SourceEngineParticleOperator } from '../operator';
import { PARAM_TYPE_INT, PARAM_TYPE_FLOAT } from '../../constants';
/**
 *TODO
 */
export class EmitInstantaneously extends SourceEngineParticleOperator {
	static functionName = 'emit_instantaneously';
	emitted = false;
	constructor() {
		super();
		//this.setNameId('Emit Instantaneously');
		this.addParam('emission_start_time', PARAM_TYPE_FLOAT, 0.0);
		this.addParam('num_to_emit_minimum', PARAM_TYPE_INT, -1);
		this.addParam('num_to_emit', PARAM_TYPE_INT, 100);
		this.addParam('maximum emission per frame', PARAM_TYPE_INT, -1);
		this.addParam('emission count scale control point', PARAM_TYPE_INT, -1);
		this.addParam('emission count scale control point field', PARAM_TYPE_INT, 0);

	//	DMXELEMENT_UNPACK_FIELD('emission_start_time', '0', float, m_flStartTime)
	//	DMXELEMENT_UNPACK_FIELD('num_to_emit_minimum', '-1', int, m_nMinParticlesToEmit)
	//	DMXELEMENT_UNPACK_FIELD('num_to_emit', '100', int, m_nParticlesToEmit)
	//	DMXELEMENT_UNPACK_FIELD('maximum emission per frame', '-1', int, m_nPerFrameNum)
	//	DMXELEMENT_UNPACK_FIELD('emission count scale control point', '-1', int, m_nScaleControlPoint)
	//	DMXELEMENT_UNPACK_FIELD('emission count scale control point field', '0', int, m_nScaleControlPointField)

	}

	doEmit(elapsedTime) {
		if (this.emitted) {
			return;
		}

		const m_flStartTime = this.getParameter('emission_start_time');
		const num_to_emit = this.getParameter('num_to_emit');

		const currentTime = this.particleSystem.currentTime;
		if (currentTime < m_flStartTime) return;

		for (let i = 0; i<num_to_emit; ++i) {
			const particle = this.emitParticle(currentTime, elapsedTime);//TODO: change particle time ?
			if (particle==null) {
				break; // Break if a particule can't emitted (max reached)
			}
		}
		this.emitted = true;
	}

	reset() {
		this.emitted = false;
	}

	finished() {
		return this.emitted;
	}
}
SourceEngineParticleOperators.registerOperator(EmitInstantaneously);
