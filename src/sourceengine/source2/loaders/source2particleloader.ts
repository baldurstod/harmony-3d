import { vec4 } from 'gl-matrix';
import { Source2FileLoader } from './source2fileloader';
import { Source2ParticleManager } from '../particles/source2particlemanager';
import { Source2ParticleSystem } from '../particles/source2particlesystem';
import { Source2ParticleOperators } from '../particles/operators/source2particleoperators';
import { registerLoader } from '../../../loaders/loaderfactory';
import { LOG, DEBUG, VERBOSE, TESTING } from '../../../buildoptions';

export const CParticleSystemDefinition = 'CParticleSystemDefinition';

function _initProperties(system, systemDefinition) {
	let keys = Object.keys(systemDefinition);
	for (let key of keys) {
		let value = systemDefinition[key];
		switch (key) {
			case 'm_nMaxParticles':
				system.setMaxParticles(Number(value));
				break;
			case 'm_ConstantColor':
				vec4.set(system.baseProperties.color, Number(value[0]) / 255.0, Number(value[1]) / 255.0, Number(value[2]) / 255.0, Number(value[3]) / 255.0);
				break;
			case 'm_flConstantLifespan':
				system.baseProperties.lifespan = value;
				break;
			case 'm_flConstantRadius':
				system.baseProperties.radius = Number(value);
				break;
			case 'm_nConstantSequenceNumber':
				system.baseProperties.sequenceNumber = Number(value);
				break;
			case 'm_controlPointConfigurations':
				system.baseProperties.controlPointConfigurations = value;
				break;
			case 'm_hSnapshot':
				system.baseProperties.snapshot = value;
				break;
			case 'm_nSnapshotControlPoint':
				system.baseProperties.snapshotControlPoint = Number(value);
				break;
			case 'm_nInitialParticles':
				system.initialParticles = Number(value);
				break;
			case 'm_flConstantRotationSpeed':
				system.baseProperties.rotationSpeedRoll = value;
				break;
			default:
				if(TESTING) {
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
							console.warn('CParticleSystemDefinition : unknown parameter : ' + key, value);
					}

				} else {
					console.warn('CParticleSystemDefinition : unknown parameter : ' + key, value);
				}
		}
	}
}

function _initOperators(system, systemArray, kv3Array) {
	if (kv3Array) {
		let properties = kv3Array;
		if (properties) {
			for (let property of properties) {
				if (property._class) {
					let operatorClass = Source2ParticleOperators[property._class];
					if (operatorClass) {
						let operator = new operatorClass(system);
						if (operator.isPreEmission()) {
							system.preEmissionOperators.push(operator);
						} else {
							systemArray.push(operator);
						}
						for (let param of Object.keys(property)) {
							if (param != '_class') {
								operator.setParam(param, property[param]);
							}
						}
						operator.init();
					} else {
						console.error('Unknown operator : ' + property._class, property, system.name);
					}
				}
			}
		}
	}
}

async function _initChildren(repository, systemArray, kv3Array, snapshotModifiers) {
	let promises = [];
	if (kv3Array) {
		let properties = kv3Array;
		if (properties) {
			for (let childIndex = 0; childIndex < properties.length; ++childIndex) {
				let property = properties[childIndex];
				let m_ChildRef = property.m_ChildRef;
				let m_flDelay = property.m_flDelay || 0;
				if (m_ChildRef) {
					let p = new Promise(async (resolve, reject) => {
						let system = await Source2ParticleManager.getSystem(repository, m_ChildRef, snapshotModifiers);
						system.disabled = property.m_bDisableChild ?? false;
						if (system) {
							system.endCap = property.m_bEndCap ?? false;
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
		constructor() {
		}

		load(repository, fileName) {
			let promise = new Promise((resolve, reject) => {
				fileName = fileName.replace(/.vpcf_c/, '');
				let vpcfPromise = new Source2FileLoader(true).load(repository, fileName + '.vpcf_c');
				vpcfPromise.then(
					(source2File) => {
						if (VERBOSE) {
							console.log(source2File);
						}
						resolve(source2File);
					}
				).catch(
					(error) => reject(error)
				)
			});
			return promise;
		}

		async getSystem(repository, vpcf, snapshotModifiers) {
			if (TESTING && LOG) {
				console.debug(vpcf);
			}

			const fileName = vpcf.fileName;
			const result = /[ \w-]+?(?=\.)/.exec(fileName);

			let system = new Source2ParticleSystem(repository, fileName, result ? result[0] : fileName);

			let systemDefinition = vpcf.getBlockStruct('DATA.keyValue.root');
			if (systemDefinition._class == CParticleSystemDefinition) {
				_initOperators(system, system.preEmissionOperators, systemDefinition.m_PreEmissionOperators);
				_initOperators(system, system.emitters, systemDefinition.m_Emitters);
				_initOperators(system, system.initializers, systemDefinition.m_Initializers);
				_initOperators(system, system.operators, systemDefinition.m_Operators);
				_initOperators(system, system.renderers, systemDefinition.m_Renderers);
				_initOperators(system, system.forces, systemDefinition.m_ForceGenerators);
				_initOperators(system, system.constraints, systemDefinition.m_Constraints);
				await _initChildren(repository, system.childSystems, systemDefinition.m_Children, snapshotModifiers);
				_initProperties(system, systemDefinition);
			}

			await system.init(snapshotModifiers);
			return system;
		}
	}
	return Source2ParticleLoader;
}());
registerLoader('Source2ParticleLoader', Source2ParticleLoader);
