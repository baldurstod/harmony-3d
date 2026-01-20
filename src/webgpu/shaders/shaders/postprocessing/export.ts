import { Shaders } from '../../../../shaders/shaders';

import grain from './grain.wgsl';
Shaders['grain.wgsl'] = grain;

import palette from './palette.wgsl';
Shaders['palette.wgsl'] = palette;

import pixelate from './pixelate.wgsl';
Shaders['pixelate.wgsl'] = pixelate;

import saturate from './saturate.wgsl';
Shaders['saturate.wgsl'] = saturate;
