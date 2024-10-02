import { Includes } from '../../../../shaders/includes';

import declare_camera_position from './declare_camera_position.glsl';
Includes['declare_camera_position'] = declare_camera_position;

import declare_fragment_alpha_test from './declare_fragment_alpha_test.glsl';
Includes['declare_fragment_alpha_test'] = declare_fragment_alpha_test;

import declare_fragment_light_warp from './declare_fragment_light_warp.glsl';
Includes['declare_fragment_light_warp'] = declare_fragment_light_warp;

import declare_lights from './declare_lights.glsl';
Includes['declare_lights'] = declare_lights;

import declare_log_depth from './declare_log_depth.glsl';
Includes['declare_log_depth'] = declare_log_depth;

import declare_matrix_uniforms from './declare_matrix_uniforms.glsl';
Includes['declare_matrix_uniforms'] = declare_matrix_uniforms;

import declare_shadow_mapping from './declare_shadow_mapping.glsl';
Includes['declare_shadow_mapping'] = declare_shadow_mapping;

import declare_vertex_skinning from './declare_vertex_skinning.glsl';
Includes['declare_vertex_skinning'] = declare_vertex_skinning;

import declare_vertex_uv from './declare_vertex_uv.glsl';
Includes['declare_vertex_uv'] = declare_vertex_uv;
