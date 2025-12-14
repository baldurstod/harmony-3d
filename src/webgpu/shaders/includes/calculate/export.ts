import { addWgslInclude } from '../../../../shaders/includemanager';

import calculate_fragment_alpha_test from './calculate_fragment_alpha_test.wgsl';
addWgslInclude('calculate_fragment_alpha_test', calculate_fragment_alpha_test);

import calculate_fragment_color_map from './calculate_fragment_color_map.wgsl';
addWgslInclude('calculate_fragment_color_map', calculate_fragment_color_map);

import calculate_fragment_diffuse from './calculate_fragment_diffuse.wgsl';
addWgslInclude('calculate_fragment_diffuse', calculate_fragment_diffuse);

import calculate_fragment_lights from './calculate_fragment_lights.wgsl';
addWgslInclude('calculate_fragment_lights', calculate_fragment_lights);

import calculate_fragment_log_depth from './calculate_fragment_log_depth.wgsl';
addWgslInclude('calculate_fragment_log_depth', calculate_fragment_log_depth);

import calculate_fragment_normal from './calculate_fragment_normal.wgsl';
addWgslInclude('calculate_fragment_normal', calculate_fragment_normal);

import calculate_fragment_standard from './calculate_fragment_standard.wgsl';
addWgslInclude('calculate_fragment_standard', calculate_fragment_standard);

import calculate_lights_setup_vars from './calculate_lights_setup_vars.wgsl';
addWgslInclude('calculate_lights_setup_vars', calculate_lights_setup_vars);
