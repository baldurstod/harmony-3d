import { MapEntity } from '../mapentity';
import { MapEntities } from '../mapentities';
import { Source1ModelManager } from '../../models/source1modelmanager';

export class PropDynamic extends MapEntity {
	model;
	setKeyValues(kvElement) {//TODOv3 fix me
		super.setKeyValues(kvElement);
		this.setupModel(kvElement);
	}

	async setupModel(kvElement) {
		const entity = kvElement;
		if (entity && entity.model) {
			const model = await this.setModel(entity.model);
			const skin = entity.skin || 0;
			if (model) {
				model.skin = skin;

				if (model) {
					model.position = this._position;
					model.quaternion = this._quaternion;
				}

				if (entity.defaultanim) {
					model.playSequence(entity.defaultanim);
				} else {
					model.playDefaultAnim();
				}//TODO: RandomAnimation, StartDisabled, SetBodyGroup
				if (entity.startdisabled == 1) {
					this.model.visible = false;
				}
			}
		}
	}

	/*
		setKeyValue(key, value) {
			await super.setKeyValue(key, value);
			let model;
			switch (key) {
				case 'model':
					await this.setModel(value);
					break;
				case 'origin':
					model = this.model;
					if (model) {
						model.position = this._position;
					}
					break;
				case 'angles':
					model = this.model;
					if (model) {
						model.quaternion = this._quaternion;
					}
					break;
			}
		}*/

	async setModel(modelName) {
		modelName = modelName.replace(/\.mdl$/g, '');

		const model = await Source1ModelManager.createInstance(this.map.repository, modelName, true);
		/*model.position = this.position;
		model.quaternion = this._quaternion;*/
		this.model = model;
		this.m.dynamicProps.addChild(model);
		/*.then(
			(model) => {
				this.map.dynamicProps.addChild(model);
				model.position = this.position;
				model.quaternion = this._quaternion;
				//TODOv3: animate
			}
		);*/
		return model;
	}

	setInput(inputName, parameter) {
		switch (inputName.toLowerCase()) {
			case 'skin':
				this.model.setSkin(parameter);
				break;
		}
	}

	update(map, delta) {
		super.update(map, delta);
		const model = this.model;//fixme this
		if (model) {
			model.position = this._position;
			model.quaternion = this._quaternion;
		}
	}
}
MapEntities.registerEntity('prop_dynamic', PropDynamic);
MapEntities.registerEntity('prop_dynamic_override', PropDynamic);
//SEMapEntities.registerEntity('prop_static', SEEntityPropDynamic);
MapEntities.registerEntity('prop_scalable', PropDynamic);
MapEntities.registerEntity('prop_physics_override', PropDynamic);
