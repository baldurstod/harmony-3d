import { Operator } from './operator';

const Source2ParticleOperators = new Map<string, typeof Operator>;


export function RegisterSource2ParticleOperator(operatorName: string, operator: typeof Operator) {
	Source2ParticleOperators.set(operatorName, operator);
}

export function GetSource2ParticleOperator(operatorName: string): typeof Operator | undefined {
	return Source2ParticleOperators.get(operatorName);
}
