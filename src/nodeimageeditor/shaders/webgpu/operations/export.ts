import { Shaders } from '../../../../shaders/shaders';

import select from './select.wgsl';
Shaders['select.wgsl'] = select;

import texturelookup from './texturelookup.wgsl';
Shaders['texturelookup.wgsl'] = texturelookup;
