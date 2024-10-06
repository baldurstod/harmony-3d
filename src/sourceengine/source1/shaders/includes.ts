import { Includes } from '../../../shaders/includes';

import source1_declare_phong from './includes/source1_declare_phong.glsl';
Includes['source1_declare_phong'] = source1_declare_phong;

import source1_declare_selfillum from './includes/source1_declare_selfillum.glsl';
Includes['source1_declare_selfillum'] = source1_declare_selfillum;

import source1_fragment_common from './includes/source1_fragment_common.glsl';
Includes['source1_fragment_common'] = source1_fragment_common;

import source1_varying_vertexlit_generic from './includes/source1_varying_vertexlit_generic.glsl';
Includes['source1_varying_vertexlit_generic'] = source1_varying_vertexlit_generic;
