import { vec3 } from 'gl-matrix';

import { Source2ModelManager } from '../../../models/source2modelmanager';
import { Operator } from '../operator';
import { RegisterSource2ParticleOperator } from '../source2particleoperators';

const tempVec3 = vec3.create();

export class RenderModels extends Operator {
	#modelList = new Map();
	#models = new Map();
	#skin;
	#totalProbability;
	//#modelPool = new Map();
	#allModels = new Map();
	#animated = false;

	_paramChanged(paramName, value) {
		switch (paramName) {
			case 'm_ModelList':
				this.#modelList.clear();
				this.#totalProbability = 0;

				// Example of system with multiple models: muerta_ultimate_ambient_flowers
				for (const model of value) {
					const modelName = model?.m_model;
					const modelProbability = model?.m_flRelativeProbabilityOfSpawn ?? 1;
					if (modelName) {
						this.#totalProbability += modelProbability;
						this.#modelList.set(modelName, this.#totalProbability);
					}
				}
				break;
			case 'm_nSkin':
				this.#skin = value;
				this.#models.forEach(model => {
					if (model) {
						model.skin = this.#skin
					}
				});
				break;
			case 'm_bAnimated':
				this.#animated = value;
				break;
			default:
				super._paramChanged(paramName, value);
		}
	}

	initRenderer(particleSystem) {
	}

	updateParticles(particleSystem, particleList, elapsedTime) {
		const activity = particleSystem.getAttribute('activity');

		for (let i = 0, l = particleList.length; i < l; ++i) {
			this.#updateParticle(particleSystem, i, particleList[i], activity?.activity, activity?.modifiers);
		}
	}

	#pickRandomModel() {
		const random = Math.random() * this.#totalProbability;
		for (const [modelName, modelProbability] of this.#modelList) {
			if (random <= modelProbability) {
				return modelName;
			}
		}
	}

	async #getModel(repository, modelName) {
		for (const [model, datas] of this.#allModels) {
			if (!datas.used && (datas.modelName == modelName) && (datas.repository == repository)) {
				//this.#allModels.delete(model);
				datas.used = true;
				return model;
			}
		}

		const model = await Source2ModelManager.createInstance(repository, modelName, this.#animated);

		if (model) {
			this.#allModels.set(model, { repository: repository, modelName: modelName, used: true });
		}
		return model;
	}

	#returnModel(particle) {
		const model = this.#models.get(particle);
		if (model) {
			//previousModel.dispose();
			//console.log(previousModel)
			const datas = this.#allModels.get(model);
			if (datas) {
				datas.used = false;
			}
		}

	}

	async #updateParticle(particleSystem, particleIndex, particle, activityName, activityModifiers) {
		let model;

		if (!particle.modelName) {
			const modelName = this.#pickRandomModel();
			particle.modelName = modelName;

			this.#returnModel(particle);
			model = await this.#getModel(particleSystem.repository, particle.modelName);

			this.#models.set(particle, model);

			if (this.#skin && model) {
				model.skin = this.#skin;
			}

			particleSystem.addChild(model);

		} else {
			model = this.#models.get(particle);
		}

		/*if (model === undefined) {
			this.#models.push(null);

			model = await Source2ModelManager.createInstance(particleSystem.repository, this.#pickRandomModel(), true);

			if (this.#skin && model) {
				model.skin = this.#skin;
			}

			this.#models[particleIndex] = model;
			particleSystem.addChild(model);

			return
		}*/

		if (model) {
			model.position = particle.position;
			const radius = particle.radius;
			model.scale = vec3.set(tempVec3, radius, radius, radius);
			model.quaternion = particle.quaternion;
			model.playSequence(activityName, activityModifiers);
			if (particle.color[3] == 0) { //TODO: add an actual rendering tint / alpha on models
				model.visible = false;
			} else {
				model.visible = undefined;
			}
		}
	}

	dispose() {
		this.#allModels.forEach((_, model) => model.dispose());
	}
}
RegisterSource2ParticleOperator('C_OP_RenderModels', RenderModels);
