import { Shaders } from '../../shaders/shaders';
export * from './includes/export';

import raytracer from './raytracer.wgsl';
Shaders['raytracer.wgsl'] = raytracer;

import test from './test.wgsl';
Shaders['test.wgsl'] = test;
