import { SourceEngineParticleSystem } from '../particles/sourceengineparticlesystem';
import { SourceEngineParticleOperators } from '../particles/sourceengineparticleoperators';
import { ELEMENT_TYPES } from '../particles/constants';
import { generateRandomUUID } from '../../../math/functions';
import { LOG, WARN } from '../../../buildoptions';

export class SourcePCF {
	repository: string;
	stringDict = [];
	elementsDict = [];
	systems = {};
	systems2 = {};
	constructor(repository: string) {
		this.repository = repository;
	}

	getSystemElement(systemName) {
		return this.systems[systemName];
	}

	addSystem(element) {
		this.systems[element.name] = element;
		this.systems2[element.guid2] = element;
	}

	getSystem(systemName) {
		const element = this.systems[systemName];
		if (!element) { return null; }

		const attributes = element.attributes;

		const ps = new SourceEngineParticleSystem(this.repository, { name: systemName });
		ps.pcf = this;	// Store PCF to load children
		ps.repository = this.repository;

		for (let attributeIndex = 0; attributeIndex < attributes.length; ++attributeIndex) {
			let attribute = attributes[attributeIndex];
			switch (attribute.typeName) {
				case 'renderers':
				case 'operators':
				case 'initializers':
				case 'emitters':
				case 'forces':
				case 'constraints':
					this.addOperators(ps, attribute.value, attribute.typeName);
					break;
				case 'children':
					this.addOperators(ps, attribute.value, attribute.typeName);
					break;
				default:
					ps.setParam(attribute);
			}
		}
		return ps;
	}

	initSystem(system) {//TODOv2: merge with previous function
		const element = this.systems[system.name];
		if (!element) { return null; }

		const attributes = element.attributes;

		system.pcf = this;	// Store PCF to load children
		system.repository = this.repository;

		for (let attributeIndex = 0; attributeIndex < attributes.length; ++attributeIndex) {
			let attribute = attributes[attributeIndex];
			switch (attribute.typeName) {
				case 'renderers':
				case 'operators':
				case 'initializers':
				case 'emitters':
				case 'forces':
				case 'constraints':
					this.addOperators(system, attribute.value, attribute.typeName);
					break;
				case 'children':
					this.addOperators(system, attribute.value, attribute.typeName);
					break;
				default:
					system.setParam(attribute);
			}
		}
		return system;
	}

	addOperators(system, list, listType) {
		for (let i = 0; i < list.length; ++i) {
			const ope = list[i];
			if (ope.type == 'DmeParticleOperator') {
				const operator = SourceEngineParticleOperators.getOperator(ope.name);
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
					for (let attribIndex = 0; attribIndex < attribs.length; ++attribIndex) {
						const attrib = attribs[attribIndex];
						if (attrib.typeName == 'child' && attrib.value) {
							system.addTempChild(attrib.value.name, ope.guid2);
						}
					}
				} else {
					if (LOG) { console.log('Unknown operator type ' + ope.type); }
				}
			}
		}
	}

	addAttributes(operator, list) {
		for (let i = 0; i < list.length; ++i) {
			let attrib = list[i];

			operator.setParameter(attrib.typeName, ELEMENT_TYPES[attrib.type], attrib.value);
		}
	}

}

export const DmeElement = 'DmeElement';
export const DmeParticleSystemDefinition = 'DmeParticleSystemDefinition';
