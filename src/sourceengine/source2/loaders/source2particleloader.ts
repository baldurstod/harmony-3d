import { vec4 } from 'gl-matrix';
import { LOG, TESTING, VERBOSE } from '../../../buildoptions';
import { registerLoader } from '../../../loaders/loaderfactory';
import { Kv3Element } from '../../common/keyvalue/kv3element';
import { Operator } from '../particles/operators/operator';
import { GetSource2ParticleOperator } from '../particles/operators/source2particleoperators';
import { Source2ParticleManager } from '../particles/source2particlemanager';
import { ControlPointConfiguration, ControlPointConfigurationDriver, SOURCE2_DEFAULT_RADIUS, Source2ParticleSystem } from '../particles/source2particlesystem';
import { Source2File } from './source2file';
import { Source2FileLoader } from './source2fileloader';
import { DEFAULT_MAX_PARTICLES } from '../../common/particles/particleconsts';
import { OperatorParam } from '../particles/operators/operatorparam';

export const CParticleSystemDefinition = 'CParticleSystemDefinition';

function valueToControlPointConfigurationDrivers(value: Kv3Element[] | null): ControlPointConfigurationDriver[] {
	const ret: ControlPointConfigurationDriver[] = [];
	if (value) {
		for (const configuration of value) {
			ret.push({
				attachmentName: configuration.getValueAsString('m_attachmentName'),
				entityName: configuration.getValueAsString('m_entityName'),
				attachType: configuration.getValueAsString('m_iAttachType'),
				controlPoint: configuration.getValueAsNumber('m_iControlPoint'),
			});
		}
	}
	return ret;
}

function valueToControlPointConfigurations(value: Kv3Element[] | null): ControlPointConfiguration[] {
	const ret: ControlPointConfiguration[] = [];
	if (value) {
		for (const configuration of value) {
			ret.push({
				name: configuration.getValueAsString('m_name') ?? '',
				drivers: valueToControlPointConfigurationDrivers(configuration.getValueAsElementArray('m_drivers')),
			});
		}
	}
	return ret;
}

function initProperties(system: Source2ParticleSystem, systemDefinition: Kv3Element) {
	//const keys = Object.keys(systemDefinition);


	for (const [key, value] of systemDefinition.getProperties()) {
		//const value = systemDefinition[key];
		switch (key) {
			case 'm_nMaxParticles':
				system.setMaxParticles(systemDefinition.getValueAsNumber('m_nMaxParticles') ?? DEFAULT_MAX_PARTICLES);
				break;
			case 'm_ConstantColor':
				//vec4.set(system.baseProperties.color, Number(value[0]) / 255.0, Number(value[1]) / 255.0, Number(value[2]) / 255.0, Number(value[3]) / 255.0);
				const constantColor = systemDefinition.getValueAsNumberArray('m_ConstantColor');
				if (constantColor && constantColor.length >= 4) {
					vec4.set(system.baseProperties.color, constantColor[0]! / 255.0, constantColor[1]! / 255.0, constantColor[2]! / 255.0, constantColor[3]! / 255.0);
				}
				break;
			case 'm_flConstantLifespan':
				system.baseProperties.lifespan = systemDefinition.getValueAsNumber(key) ?? 0;// TODO: check default value
				break;
			case 'm_flConstantRadius':
				system.baseProperties.radius = systemDefinition.getValueAsNumber(key) ?? SOURCE2_DEFAULT_RADIUS;// TODO: check default value
				break;
			case 'm_nConstantSequenceNumber':
				system.baseProperties.sequenceNumber = systemDefinition.getValueAsNumber(key) ?? 0;// TODO: check default value
				break;
			case 'm_controlPointConfigurations':
				system.baseProperties.controlPointConfigurations = valueToControlPointConfigurations(systemDefinition.getValueAsElementArray(key));// TODO: check default value
				break;
			case 'm_hSnapshot':
				system.baseProperties.snapshot = systemDefinition.getValueAsResource(key) ?? '';// TODO: check default value
				break;
			case 'm_nSnapshotControlPoint':
				system.baseProperties.snapshotControlPoint = systemDefinition.getValueAsNumber(key) ?? 0;// TODO: check default value
				break;
			case 'm_nInitialParticles':
				system.initialParticles = systemDefinition.getValueAsNumber(key) ?? 0;
				break;
			case 'm_flConstantRotationSpeed':
				console.error('do this param', key, value);
				system.baseProperties.rotationSpeedRoll = value;
				break;
			default:
				switch (key) {
					case 'm_Initializers':
					case 'm_Operators':
					case 'm_Renderers':
					case 'm_Emitters':
					case 'm_Children':
					case 'm_ForceGenerators':
					case 'm_Constraints':
					case 'm_PreEmissionOperators':
					case '_class':
						break;
					default:
						if (TESTING) {
							console.warn('CParticleSystemDefinition : unknown parameter : ' + key, value);
						}
				}
		}
	}
}

function initOperators(system: Source2ParticleSystem, systemArray: Operator[], kv3Array: Kv3Element[] | null): void {
	if (!kv3Array) {
		return;
	}
	const properties = kv3Array;
	if (properties) {
		for (const property of properties) {
			const operatorClassName = property.getValueAsString('_class');
			if (operatorClassName) {
				const operatorClass = GetSource2ParticleOperator(operatorClassName);
				if (operatorClass) {
					const operator = new operatorClass(system);
					if (operator.isPreEmission()) {
						system.preEmissionOperators.push(operator);
					} else {
						systemArray.push(operator);
					}
					for (const [name, value] of property.getProperties()) {
						if (value && name != '_class') {
							operator.setParam(name, OperatorParam.fromKv3(value)/*property.getValue(name)*/);
						}
					}
					operator.init();
				} else {
					console.error('Unknown operator : ' + operatorClassName, property, system.name);
				}
			}
		}
	}
}

async function initChildren(repository: string, systemArray: Source2ParticleSystem[], kv3Array: Kv3Element[] | null, snapshotModifiers?: Map<string, string>): Promise<void> {
	const promises: Promise<boolean>[] = [];
	if (kv3Array) {
		const properties = kv3Array;
		if (properties) {
			for (let childIndex = 0; childIndex < properties.length; ++childIndex) {
				const property = properties[childIndex];
				const m_ChildRef = property.getValueAsResource('m_ChildRef');
				const m_flDelay = property.getValueAsNumber('m_flDelay') ?? 0;
				if (m_ChildRef) {
					const p = new Promise<boolean>(async resolve => {
						const system = await Source2ParticleManager.getSystem(repository, m_ChildRef, snapshotModifiers);
						system.disabled = property.getValueAsBool('m_bDisableChild') ?? false;
						if (system) {
							system.endCap = property.getValueAsBool('m_bEndCap') ?? false;
							system.startAfterDelay = m_flDelay;
							systemArray[childIndex] = system;
							resolve(true);
						} else {
							resolve(false);
						}
					});
					promises.push(p);
				}
			}
		}
	}
	await Promise.allSettled(promises);
}

export const Source2ParticleLoader = new (function () {
	class Source2ParticleLoader {
		load(repository: string, path: string): Promise<Source2File | null> {
			const promise = new Promise<Source2File | null>(resolve => {
				path = path.replace(/.vpcf_c/, '');
				const vpcfPromise = new Source2FileLoader().load(repository, path + '.vpcf_c') as Promise<Source2File | null>;
				vpcfPromise.then(
					(source2File: Source2File | null) => {
						if (VERBOSE) {
							console.log(source2File);
						}
						resolve(source2File);
					}
				);
			});
			return promise;
		}

		async getSystem(repository: string, vpcf: Source2File, snapshotModifiers?: Map<string, string>) {
			if (TESTING && LOG) {
				console.debug(vpcf);
			}

			const fileName = vpcf.fileName;
			const result = /[ \w-]+?(?=\.)/.exec(fileName);

			const system = new Source2ParticleSystem(repository, fileName, result ? result[0] : fileName);

			//const systemDefinition = vpcf.getBlockStruct('DATA', '');
			if (vpcf.getBlockStructAsString('DATA', '_class') == CParticleSystemDefinition) {
				initOperators(system, system.preEmissionOperators, vpcf.getBlockStructAsElementArray('DATA', 'm_PreEmissionOperators'));
				initOperators(system, system.emitters, vpcf.getBlockStructAsElementArray('DATA', 'm_Emitters'));
				initOperators(system, system.initializers, vpcf.getBlockStructAsElementArray('DATA', 'm_Initializers'));
				initOperators(system, system.operators, vpcf.getBlockStructAsElementArray('DATA', 'm_Operators'));
				initOperators(system, system.renderers, vpcf.getBlockStructAsElementArray('DATA', 'm_Renderers'));
				initOperators(system, system.forces, vpcf.getBlockStructAsElementArray('DATA', 'm_ForceGenerators'));
				initOperators(system, system.constraints, vpcf.getBlockStructAsElementArray('DATA', 'm_Constraints'));
				await initChildren(repository, system.childSystems, vpcf.getBlockStructAsElementArray('DATA', 'm_Children'), snapshotModifiers);
				const dataKv = vpcf.getBlockKeyValues('DATA');
				if (dataKv) {
					initProperties(system, dataKv);
				}
			}

			await system.init(snapshotModifiers);
			return system;
		}
	}
	return Source2ParticleLoader;
}());
registerLoader('Source2ParticleLoader', Source2ParticleLoader);
