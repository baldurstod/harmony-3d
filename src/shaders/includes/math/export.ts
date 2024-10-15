import { Includes } from '../../../shaders/includes';

import mat4_from_quat from './mat4_from_quat.glsl';
Includes['mat4_from_quat'] = mat4_from_quat;

import vec3_transform_quat from './vec3_transform_quat.glsl';
Includes['vec3_transform_quat'] = vec3_transform_quat;
