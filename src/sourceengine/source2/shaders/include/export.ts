
export * from './dota2/export';

import { Includes } from '../../../../shaders/includes';


import source2_fragment_compute_detail from './source2_fragment_compute_detail.glsl';
Includes['source2_fragment_compute_detail'] = source2_fragment_compute_detail;

import source2_fragment_compute_mask from './source2_fragment_compute_mask.glsl';
Includes['source2_fragment_compute_mask'] = source2_fragment_compute_mask;

import source2_fragment_declare_detail_map from './source2_fragment_declare_detail_map.glsl';
Includes['source2_fragment_declare_detail_map'] = source2_fragment_declare_detail_map;

import source2_varying_global_lit_simple from './source2_varying_global_lit_simple.glsl';
Includes['source2_varying_global_lit_simple'] = source2_varying_global_lit_simple;
