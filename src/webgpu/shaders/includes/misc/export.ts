import { addWgslInclude } from '../../../../shaders/includemanager';

import luminance from './luminance.wgsl';
addWgslInclude('luminance', luminance);

import math_defines from './math_defines.wgsl';
addWgslInclude('math_defines', math_defines);

import output_fragment from './output_fragment.wgsl';
addWgslInclude('output_fragment', output_fragment);

import varying_standard from './varying_standard.wgsl';
addWgslInclude('varying_standard', varying_standard);
