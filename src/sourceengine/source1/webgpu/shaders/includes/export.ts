import { addWgslInclude } from '../../../../../shaders/includemanager';

import source1_calculate_particle_position from './source1_calculate_particle_position.wgsl';
addWgslInclude('source1_calculate_particle_position', source1_calculate_particle_position);

import source1_calculate_selfillum from './source1_calculate_selfillum.wgsl';
addWgslInclude('source1_calculate_selfillum', source1_calculate_selfillum);

import source1_calculate_sheen from './source1_calculate_sheen.wgsl';
addWgslInclude('source1_calculate_sheen', source1_calculate_sheen);

import source1_declare_gamma_functions from './source1_declare_gamma_functions.wgsl';
addWgslInclude('source1_declare_gamma_functions', source1_declare_gamma_functions);

import source1_declare_particle_position from './source1_declare_particle_position.wgsl';
addWgslInclude('source1_declare_particle_position', source1_declare_particle_position);

import source1_declare_phong from './source1_declare_phong.wgsl';
addWgslInclude('source1_declare_phong', source1_declare_phong);

import source1_declare_selfillum from './source1_declare_selfillum.wgsl';
addWgslInclude('source1_declare_selfillum', source1_declare_selfillum);

import source1_declare_sheen from './source1_declare_sheen.wgsl';
addWgslInclude('source1_declare_sheen', source1_declare_sheen);
