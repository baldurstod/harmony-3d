import { Operator } from './operator';

// TODO: remove me when particle are finished
const messagePerOperator = new Set<string>();

const Source2ParticleOperators = new Map<string, typeof Operator>;

export function RegisterSource2ParticleOperator(operatorName: string, operator: typeof Operator): void {
	Source2ParticleOperators.set(operatorName, operator);
}

export function GetSource2ParticleOperator(operatorName: string): typeof Operator | null {
	const operator = Source2ParticleOperators.get(operatorName);
	if (operator) {
		return operator;
	}

	if (!messagePerOperator.has(operatorName)) {
		console.error('do operator ', operatorName);
		messagePerOperator.add(operatorName);
	}

	return null;
}
