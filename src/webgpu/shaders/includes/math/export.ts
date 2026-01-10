import { addWgslInclude } from '../../../../shaders/includemanager';

import mat4_from_quat from './mat4_from_quat.wgsl';
addWgslInclude('mat4_from_quat', mat4_from_quat);

import vec3_transform_quat from './vec3_transform_quat.wgsl';
addWgslInclude('vec3_transform_quat', vec3_transform_quat);
