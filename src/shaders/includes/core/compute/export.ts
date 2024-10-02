import { Includes } from '../../../../shaders/includes';

import compute_fragment_alpha_test from './compute_fragment_alpha_test.glsl';
Includes['compute_fragment_alpha_test'] = compute_fragment_alpha_test;

import compute_fragment_color_map from './compute_fragment_color_map.glsl';
Includes['compute_fragment_color_map'] = compute_fragment_color_map;

import compute_fragment_lights from './compute_fragment_lights.glsl';
Includes['compute_fragment_lights'] = compute_fragment_lights;

import compute_fragment_log_depth from './compute_fragment_log_depth.glsl';
Includes['compute_fragment_log_depth'] = compute_fragment_log_depth;

import compute_fragment_normal from './compute_fragment_normal.glsl';
Includes['compute_fragment_normal'] = compute_fragment_normal;

import compute_fragment_render_mode from './compute_fragment_render_mode.glsl';
Includes['compute_fragment_render_mode'] = compute_fragment_render_mode;

import compute_fragment_standard from './compute_fragment_standard.glsl';
Includes['compute_fragment_standard'] = compute_fragment_standard;

import compute_lights_setup_vars from './compute_lights_setup_vars.glsl';
Includes['compute_lights_setup_vars'] = compute_lights_setup_vars;

import compute_vertex_log_depth from './compute_vertex_log_depth.glsl';
Includes['compute_vertex_log_depth'] = compute_vertex_log_depth;

import compute_vertex_projection from './compute_vertex_projection.glsl';
Includes['compute_vertex_projection'] = compute_vertex_projection;

import compute_vertex_shadow_mapping from './compute_vertex_shadow_mapping.glsl';
Includes['compute_vertex_shadow_mapping'] = compute_vertex_shadow_mapping;

import compute_vertex_skinning from './compute_vertex_skinning.glsl';
Includes['compute_vertex_skinning'] = compute_vertex_skinning;

import compute_vertex_standard from './compute_vertex_standard.glsl';
Includes['compute_vertex_standard'] = compute_vertex_standard;

import compute_vertex_uv from './compute_vertex_uv.glsl';
Includes['compute_vertex_uv'] = compute_vertex_uv;

import compute_vertex from './compute_vertex.glsl';
Includes['compute_vertex'] = compute_vertex;
