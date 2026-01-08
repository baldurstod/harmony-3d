import { addWgslInclude } from '../../../../shaders/includemanager';

import common_uniforms from './common_uniforms.wgsl';
addWgslInclude('common_uniforms', common_uniforms);

import matrix_uniforms from './matrix_uniforms.wgsl';
addWgslInclude('matrix_uniforms', matrix_uniforms);
