import { Shaders } from '../../../../shaders/shaders';

import multiply from './multiply.wgsl';
Shaders['multiply.wgsl'] = multiply;

import select from './select.wgsl';
Shaders['select.wgsl'] = select;

import texturelookup from './texturelookup.wgsl';
Shaders['texturelookup.wgsl'] = texturelookup;
