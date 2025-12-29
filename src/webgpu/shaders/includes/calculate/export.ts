import { addWgslInclude } from '../../../../shaders/includemanager';

import calculate_fragment_alpha_test from './calculate_fragment_alpha_test.wgsl';
addWgslInclude('calculate_fragment_alpha_test', calculate_fragment_alpha_test);

import calculate_fragment_color_map from './calculate_fragment_color_map.wgsl';
addWgslInclude('calculate_fragment_color_map', calculate_fragment_color_map);

import calculate_fragment_cube_map from './calculate_fragment_cube_map.wgsl';
addWgslInclude('calculate_fragment_cube_map', calculate_fragment_cube_map);

import calculate_fragment_depth from './calculate_fragment_depth.wgsl';
addWgslInclude('calculate_fragment_depth', calculate_fragment_depth);

import calculate_fragment_detail_map from './calculate_fragment_detail_map.wgsl';
addWgslInclude('calculate_fragment_detail_map', calculate_fragment_detail_map);

import calculate_fragment_diffuse from './calculate_fragment_diffuse.wgsl';
addWgslInclude('calculate_fragment_diffuse', calculate_fragment_diffuse);

import calculate_fragment_lights from './calculate_fragment_lights.wgsl';
addWgslInclude('calculate_fragment_lights', calculate_fragment_lights);

import calculate_fragment_log_depth from './calculate_fragment_log_depth.wgsl';
addWgslInclude('calculate_fragment_log_depth', calculate_fragment_log_depth);

import calculate_fragment_normal_map from './calculate_fragment_normal_map.wgsl';
addWgslInclude('calculate_fragment_normal_map', calculate_fragment_normal_map);

import calculate_fragment_normal from './calculate_fragment_normal.wgsl';
addWgslInclude('calculate_fragment_normal', calculate_fragment_normal);

import calculate_fragment_phong_exponent_map from './calculate_fragment_phong_exponent_map.wgsl';
addWgslInclude('calculate_fragment_phong_exponent_map', calculate_fragment_phong_exponent_map);

import calculate_fragment_standard from './calculate_fragment_standard.wgsl';
addWgslInclude('calculate_fragment_standard', calculate_fragment_standard);

import calculate_lights_setup_vars from './calculate_lights_setup_vars.wgsl';
addWgslInclude('calculate_lights_setup_vars', calculate_lights_setup_vars);

import calculate_silhouette_color from './calculate_silhouette_color.wgsl';
addWgslInclude('calculate_silhouette_color', calculate_silhouette_color);

import calculate_vertex_uv from './calculate_vertex_uv.wgsl';
addWgslInclude('calculate_vertex_uv', calculate_vertex_uv);

import calculate_vertex from './calculate_vertex.wgsl';
addWgslInclude('calculate_vertex', calculate_vertex);

import calculate_vertex_color from './calculate_vertex_color.wgsl';
addWgslInclude('calculate_vertex_color', calculate_vertex_color);

import calculate_vertex_log_depth from './calculate_vertex_log_depth.wgsl';
addWgslInclude('calculate_vertex_log_depth', calculate_vertex_log_depth);

import calculate_vertex_projection from './calculate_vertex_projection.wgsl';
addWgslInclude('calculate_vertex_projection', calculate_vertex_projection);

import calculate_vertex_shadow_mapping from './calculate_vertex_shadow_mapping.wgsl';
addWgslInclude('calculate_vertex_shadow_mapping', calculate_vertex_shadow_mapping);

import calculate_vertex_skinning from './calculate_vertex_skinning.wgsl';
addWgslInclude('calculate_vertex_skinning', calculate_vertex_skinning);

import calculate_vertex_standard from './calculate_vertex_standard.wgsl';
addWgslInclude('calculate_vertex_standard', calculate_vertex_standard);
