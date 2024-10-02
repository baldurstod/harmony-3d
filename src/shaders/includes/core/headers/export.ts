import { Includes } from '../../../../shaders/includes';

import common_defines from './common_defines.glsl';
Includes['common_defines'] = common_defines;

import common_functions from './common_functions.glsl';
Includes['common_functions'] = common_functions;

import common_uniforms from './common_uniforms.glsl';
Includes['common_uniforms'] = common_uniforms;

import depth_packing from './depth_packing.glsl';
Includes['depth_packing'] = depth_packing;

import header_fragment from './header_fragment.glsl';
Includes['header_fragment'] = header_fragment;

import header_vertex from './header_vertex.glsl';
Includes['header_vertex'] = header_vertex;

import precision from './precision.glsl';
Includes['precision'] = precision;
