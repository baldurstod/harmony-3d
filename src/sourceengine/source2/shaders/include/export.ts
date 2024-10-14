
export * from './dota2/export';

import { Includes } from '../../../../shaders/includes';

import source2_detail_blend from './source2_detail_blend.glsl';
Includes['source2_detail_blend'] = source2_detail_blend;

import source2_fragment_compute_detail from './source2_fragment_compute_detail.glsl';
Includes['source2_fragment_compute_detail'] = source2_fragment_compute_detail;

import source2_fragment_compute_mask from './source2_fragment_compute_mask.glsl';
Includes['source2_fragment_compute_mask'] = source2_fragment_compute_mask;

import source2_fragment_compute_separate_alpha_transform from './source2_fragment_compute_separate_alpha_transform.glsl';
Includes['source2_fragment_compute_separate_alpha_transform'] = source2_fragment_compute_separate_alpha_transform;

import source2_fragment_declare_detail_map from './source2_fragment_declare_detail_map.glsl';
Includes['source2_fragment_declare_detail_map'] = source2_fragment_declare_detail_map;

import source2_fragment_declare_separate_alpha_transform from './source2_fragment_declare_separate_alpha_transform.glsl';
Includes['source2_fragment_declare_separate_alpha_transform'] = source2_fragment_declare_separate_alpha_transform;
