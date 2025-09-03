import { LOG, WARN } from '../../../buildoptions';
import { generateRandomUUID } from '../../../math/functions';
import { ELEMENT_TYPES } from '../particles/constants';
import { Source1ParticleOperator } from '../particles/operators/operator';
import { Source1ParticleOperators } from '../particles/source1particleoperators';
import { Source1ParticleSystem } from '../particles/source1particlesystem';
import { CDmxAttribute, CDmxAttributeValue, CDmxElement } from './source1pcfloader';

export class SourcePCF {
	repository: string;
	path: string;
	stringDict: string[] = [];
	elementsDict: CDmxElement[] = [];
	systems: Record<string, CDmxElement> = {};//TODO: turn into map
	systems2: Record<string, CDmxElement> = {};//TODO: turn into map
	binaryVersion: number = 0;

	constructor(repository: string, path: string) {
		this.repository = repository;
		this.path = path;
	}

	getSystemElement(systemName: string): CDmxElement | undefined {
		return this.systems[systemName];
	}

	addSystem(element: CDmxElement): void {
		this.systems[element.name] = element;
		this.systems2[element.guid2] = element;
	}

	getSystem(systemName: string): Source1ParticleSystem | null {
		const element = this.systems[systemName];
		if (!element) { return null; }

		const attributes = element.attributes;

		const ps = new Source1ParticleSystem({ repository: this.repository, name: systemName });
		ps.pcf = this;	// Store PCF to load children
		ps.repository = this.repository;

		for (const attribute of attributes) {
			switch (attribute.typeName) {
				case 'renderers':
				case 'operators':
				case 'initializers':
				case 'emitters':
				case 'forces':
				case 'constraints':
				case 'children':
					this.addOperators(ps, attribute.value as CDmxAttributeValue[]/*TODO: check actual value*/, attribute.typeName);
					break;
				default:
					ps.setParam(attribute);
			}
		}
		return ps;
	}

	initSystem(system: Source1ParticleSystem): Source1ParticleSystem | null {//TODOv2: merge with previous function
		const element = this.systems[system.name];
		if (!element) { return null; }

		const attributes = element.attributes;

		system.pcf = this;	// Store PCF to load children
		system.repository = this.repository;

		for (const attribute of attributes) {
			switch (attribute.typeName) {
				case 'renderers':
				case 'operators':
				case 'initializers':
				case 'emitters':
				case 'forces':
				case 'constraints':
				case 'children':
					this.addOperators(system, attribute.value as CDmxAttributeValue[]/*TODO: check actual value*/, attribute.typeName);
					break;
				default:
					system.setParam(attribute);
			}
		}
		return system;
	}

	addOperators(system: Source1ParticleSystem, list: CDmxAttributeValue[], listType: string) {
		for (let i = 0; i < list.length; ++i) {
			const ope = list[i] as CDmxElement/*TODO: check actual value*/;
			if (ope.type == 'DmeParticleOperator') {
				const operator = Source1ParticleOperators.getOperator(system, ope.name);
				if (operator) {
					system.addSub(listType, operator, generateRandomUUID());
					this.addAttributes(operator, ope.attributes);
				} else {
					if (WARN) {
						console.warn(`Unknown function ${ope.name} type ${listType} for ${system.name}`);
					}
				}
			} else {
				if (ope.type == 'DmeParticleChild') {
					const attribs = ope.attributes;
					for (const attrib of attribs) {
						if (attrib.typeName == 'child' && attrib.value) {
							system.addTempChild((attrib.value as CDmxElement/*TODO: check actual value*/).name, ope.guid2);
						}
					}
				} else {
					if (LOG) { console.log('Unknown operator type ' + ope.type); }
				}
			}
		}
	}

	addAttributes(operator: Source1ParticleOperator, list: CDmxAttribute[]) {
		for (const attrib of list) {
			operator.setParameter(attrib.typeName, ELEMENT_TYPES[attrib.type]!, attrib.value);
		}
	}

}

export const DmeElement = 'DmeElement';
export const DmeParticleSystemDefinition = 'DmeParticleSystemDefinition';
