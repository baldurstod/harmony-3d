import { Shaders } from '../../shaders/shaders';
export * from './includes/export';

import bitangent_prepass from './bitangent_prepass.wgsl';
Shaders['bitangent_prepass.wgsl'] = bitangent_prepass;

import presentation from './presentation.wgsl';
Shaders['presentation.wgsl'] = presentation;

import raytracer from './raytracer.wgsl';
Shaders['raytracer.wgsl'] = raytracer;

import test from './test.wgsl';
Shaders['test.wgsl'] = test;
