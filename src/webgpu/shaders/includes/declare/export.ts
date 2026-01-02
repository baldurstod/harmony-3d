import { addWgslInclude } from '../../../../shaders/includemanager';

import declare_fragment_alpha_test from './declare_fragment_alpha_test.wgsl';
addWgslInclude('declare_fragment_alpha_test', declare_fragment_alpha_test);

import declare_fragment_color_map from './declare_fragment_color_map.wgsl';
addWgslInclude('declare_fragment_color_map', declare_fragment_color_map);

import declare_fragment_cube_map from './declare_fragment_cube_map.wgsl';
addWgslInclude('declare_fragment_cube_map', declare_fragment_cube_map);

import declare_fragment_detail_map from './declare_fragment_detail_map.wgsl';
addWgslInclude('declare_fragment_detail_map', declare_fragment_detail_map);

import declare_fragment_diffuse from './declare_fragment_diffuse.wgsl';
addWgslInclude('declare_fragment_diffuse', declare_fragment_diffuse);

import declare_fragment_light_warp from './declare_fragment_light_warp.wgsl';
addWgslInclude('declare_fragment_light_warp', declare_fragment_light_warp);

import declare_fragment_normal_map from './declare_fragment_normal_map.wgsl';
addWgslInclude('declare_fragment_normal_map', declare_fragment_normal_map);

import declare_fragment_phong_exponent_map from './declare_fragment_phong_exponent_map.wgsl';
addWgslInclude('declare_fragment_phong_exponent_map', declare_fragment_phong_exponent_map);

import declare_fragment_standard from './declare_fragment_standard.wgsl';
addWgslInclude('declare_fragment_standard', declare_fragment_standard);

import declare_lights from './declare_lights.wgsl';
addWgslInclude('declare_lights', declare_lights);

import declare_log_depth from './declare_log_depth.wgsl';
addWgslInclude('declare_log_depth', declare_log_depth);

import declare_shadow_mapping from './declare_shadow_mapping.wgsl';
addWgslInclude('declare_shadow_mapping', declare_shadow_mapping);

import declare_texture_transform from './declare_texture_transform.wgsl';
addWgslInclude('declare_texture_transform', declare_texture_transform);

import declare_vertex_detail_uv from './declare_vertex_detail_uv.wgsl';
addWgslInclude('declare_vertex_detail_uv', declare_vertex_detail_uv);

import declare_vertex_skinning from './declare_vertex_skinning.wgsl';
addWgslInclude('declare_vertex_skinning', declare_vertex_skinning);

import declare_vertex_standard_params from './declare_vertex_standard_params.wgsl';
addWgslInclude('declare_vertex_standard_params', declare_vertex_standard_params);
