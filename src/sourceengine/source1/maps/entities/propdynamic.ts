import { Camera } from '../../../../cameras/camera';
import { Scene } from '../../../../scenes/scene';
import { Source1ModelInstance } from '../../export';
import { KvElement } from '../../loaders/kvreader';
import { Source1ModelManager } from '../../models/source1modelmanager';
import { MapEntities } from '../mapentities';
import { MapEntity } from '../mapentity';

export class PropDynamic extends MapEntity {
	#model: Source1ModelInstance | null = null;

	setKeyValues(kvElement: KvElement) {//TODOv3 fix me
		super.setKeyValues(kvElement);
		this.setupModel(kvElement);
	}

	async setupModel(kvElement: KvElement) {
		const entity = kvElement;
		if (entity && (kvElement as any/*TODO: fix that*/).model) {
			const model = await this.setModel((kvElement as any/*TODO: fix that*/).model);
			const skin = (kvElement as any/*TODO: fix that*/).skin ?? 0;
			if (model) {
				model.skin = skin;

				if (model) {
					model.position = this._position;
					model.quaternion = this._quaternion;
				}

				if ((kvElement as any/*TODO: fix that*/).defaultanim) {
					model.playSequence((kvElement as any/*TODO: fix that*/).defaultanim);
				} else {
					model.playDefaultAnim();
				}//TODO: RandomAnimation, StartDisabled, SetBodyGroup
				if ((kvElement as any/*TODO: fix that*/).startdisabled == 1) {
					model.setVisible(false);
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

	async setModel(modelName: string) {
		modelName = modelName.replace(/\.mdl$/g, '');

		const model = await Source1ModelManager.createInstance(this.map.#repository, modelName, true);
		/*model.position = this.position;
		model.quaternion = this._quaternion;*/
		this.#model = model;
		this.map.dynamicProps.addChild(model);
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

	setInput(inputName: string, parameters: any/*TODO: improve type*/) {
		switch (inputName.toLowerCase()) {
			case 'skin':
				this.#model?.setSkin(parameters);
				break;
		}
	}

	update(scene: Scene, camera: Camera, delta: number): void {
		super.update(scene, camera, delta);
		const model = this.#model;//fixme this
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
