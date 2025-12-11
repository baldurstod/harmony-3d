import { addWgslInclude } from '../../../../shaders/includemanager';

import calculate_fragment_alpha_test from './calculate_fragment_alpha_test.wgsl';
addWgslInclude('calculate_fragment_alpha_test', calculate_fragment_alpha_test);

import calculate_fragment_color_map from './calculate_fragment_color_map.wgsl';
addWgslInclude('calculate_fragment_color_map', calculate_fragment_color_map);

import calculate_fragment_diffuse from './calculate_fragment_diffuse.wgsl';
addWgslInclude('calculate_fragment_diffuse', calculate_fragment_diffuse);

import compute_fragment_normal from './compute_fragment_normal.wgsl';
addWgslInclude('compute_fragment_normal', compute_fragment_normal);
