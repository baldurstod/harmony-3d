import { vec3 } from 'gl-matrix';
import { KvElement } from '../../loaders/kvreader';
import { MapEntities } from '../mapentities';
import { MapEntity, ParseVector } from '../mapentity';

/**
 * DummyEntity
 */
export class DummyEntity extends MapEntity {

	setKeyValues(kvElement: KvElement) {
		super.setKeyValues(kvElement);
		const result = /^\*(\d*)$/.exec((kvElement as any/*TODO: fix that*/).model);

		if (result && result.length >= 2) {
			this.map.funcBrushesRemoveMe.push({
				model: result[1]!,
				origin: ParseVector(vec3.create(), (kvElement as any/*TODO: fix that*/).origin) ?? vec3.create(),
			});
		}
	}
}
MapEntities.registerEntity('env_sprite', DummyEntity);
//MapEntities.registerEntity('light_spot', DummyEntity);
MapEntities.registerEntity('worldspawn', DummyEntity);
MapEntities.registerEntity('info_player_teamspawn', DummyEntity);
MapEntities.registerEntity('team_round_timer', DummyEntity);
MapEntities.registerEntity('team_control_point_master', DummyEntity);
MapEntities.registerEntity('tf_gamerules', DummyEntity);
MapEntities.registerEntity('filter_activator_tfteam', DummyEntity);
MapEntities.registerEntity('env_lightglow', DummyEntity);
//MapEntities.registerEntity('light', DummyEntity);
MapEntities.registerEntity('point_spotlight', DummyEntity);
MapEntities.registerEntity('func_nobuild', DummyEntity);
MapEntities.registerEntity('keyframe_rope', DummyEntity);
MapEntities.registerEntity('move_rope', DummyEntity);
MapEntities.registerEntity('func_regenerate', DummyEntity);
MapEntities.registerEntity('env_soundscape', DummyEntity);
MapEntities.registerEntity('env_soundscape_proxy', DummyEntity);
MapEntities.registerEntity('func_areaportal', DummyEntity);
MapEntities.registerEntity('func_illusionary', DummyEntity);
MapEntities.registerEntity('func_respawnroomvisualizer', DummyEntity);
MapEntities.registerEntity('func_respawnroom', DummyEntity);
MapEntities.registerEntity('trigger_capture_area', DummyEntity);
MapEntities.registerEntity('info_player_start', DummyEntity);
MapEntities.registerEntity('env_tonemap_controller', DummyEntity);
MapEntities.registerEntity('prop_physics_multiplayer', DummyEntity);
MapEntities.registerEntity('ambient_generic', DummyEntity);
//MapEntities.registerEntity('info_particle_system', DummyEntity);
//MapEntities.registerEntity('light_environment', DummyEntity);
MapEntities.registerEntity('shadow_control', DummyEntity);
MapEntities.registerEntity('env_sun', DummyEntity);
MapEntities.registerEntity('water_lod_control', DummyEntity);
MapEntities.registerEntity('env_fog_controller', DummyEntity);
MapEntities.registerEntity('item_grenadepack', DummyEntity);
MapEntities.registerEntity('env_smokestack', DummyEntity);
MapEntities.registerEntity('func_rotating', DummyEntity);
MapEntities.registerEntity('logic_relay', DummyEntity);
MapEntities.registerEntity('game_round_win', DummyEntity);
MapEntities.registerEntity('game_intro_viewpoint', DummyEntity);
MapEntities.registerEntity('func_occluder', DummyEntity);
MapEntities.registerEntity('sunlight_shadow_control', DummyEntity);
//MapEntities.registerEntity('prop_dynamic_override', DummyEntity);
MapEntities.registerEntity('prop_ragdoll', DummyEntity);
MapEntities.registerEntity('info_target', DummyEntity);
MapEntities.registerEntity('math_counter', DummyEntity);
