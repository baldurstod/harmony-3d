import { OperatorParam } from '../operatorparam';

const DEFAULT_DISTRIBUTE_EVENLY = false;
const DEFAULT_SEED = -1;

export class Source2ParticleRandomParams {
	distributeEvenly = DEFAULT_DISTRIBUTE_EVENLY;
	seed = DEFAULT_SEED;

	static fromOperatorParam(param: OperatorParam, path: Source2ParticleRandomParams): void {
		path.distributeEvenly = param.getSubValueAsBool('m_bDistributeEvenly') ?? DEFAULT_DISTRIBUTE_EVENLY;
		path.seed = param.getSubValueAsNumber('m_nSeed') ?? DEFAULT_SEED;
	}
};
