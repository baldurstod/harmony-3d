import { Shaders } from '../../shaders/shaders';
export * from './includes/export';
export * from './v2/export';

import bitangent_prepass from './bitangent_prepass.wgsl';
Shaders['bitangent_prepass.wgsl'] = bitangent_prepass;

import debug_bvh from './debug_bvh.wgsl';
Shaders['debug_bvh.wgsl'] = debug_bvh;

import presentation from './presentation.wgsl';
Shaders['presentation.wgsl'] = presentation;

import raytracer_v2 from './raytracer_v2.wgsl';
Shaders['raytracer_v2.wgsl'] = raytracer_v2;

import raytracer from './raytracer.wgsl';
Shaders['raytracer.wgsl'] = raytracer;

import test from './test.wgsl';
Shaders['test.wgsl'] = test;
