import { Shaders } from '../../../../shaders/shaders';

import combinelerp from './combinelerp.wgsl';
Shaders['combine_lerp.wgsl'] = combinelerp;

import combineadd from './combineadd.wgsl';
Shaders['combine_add.wgsl'] = combineadd;

import multiply from './multiply.wgsl';
Shaders['multiply.wgsl'] = multiply;

import select from './select.wgsl';
Shaders['select.wgsl'] = select;

import texturelookup from './texturelookup.wgsl';
Shaders['texturelookup.wgsl'] = texturelookup;
