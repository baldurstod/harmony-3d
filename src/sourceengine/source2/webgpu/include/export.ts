import { addWgslInclude } from '../../../../shaders/includemanager';

export * from './common/export';

import source2_detail_blend from './source2_detail_blend.wgsl';
addWgslInclude('source2_detail_blend', source2_detail_blend);

import source2_fragment_calculate_detail from './source2_fragment_calculate_detail.wgsl';
addWgslInclude('source2_fragment_calculate_detail', source2_fragment_calculate_detail);

import source2_fragment_calculate_mask from './source2_fragment_calculate_mask.wgsl';
addWgslInclude('source2_fragment_calculate_mask', source2_fragment_calculate_mask);

import source2_fragment_calculate_separate_alpha_transform from './source2_fragment_calculate_separate_alpha_transform.wgsl';
addWgslInclude('source2_fragment_calculate_separate_alpha_transform', source2_fragment_calculate_separate_alpha_transform);

import source2_fragment_declare_detail_map from './source2_fragment_declare_detail_map.wgsl';
addWgslInclude('source2_fragment_declare_detail_map', source2_fragment_declare_detail_map);

import source2_fragment_declare_separate_alpha_transform from './source2_fragment_declare_separate_alpha_transform.wgsl';
addWgslInclude('source2_fragment_declare_separate_alpha_transform', source2_fragment_declare_separate_alpha_transform);
