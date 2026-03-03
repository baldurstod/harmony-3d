import { addWgslInclude } from '../../../shaders/includemanager';

import camera from './camera.wgsl';
addWgslInclude('raytracer::camera', camera);

import color from './color.wgsl';
addWgslInclude('raytracer::color', color);

import common from './common.wgsl';
addWgslInclude('raytracer::common', common);

import interval from './interval.wgsl';
addWgslInclude('raytracer::interval', interval);

import material from './material.wgsl';
addWgslInclude('raytracer::material', material);

import ray from './ray.wgsl';
addWgslInclude('raytracer::ray', ray);

import utils from './utils.wgsl';
addWgslInclude('raytracer::utils', utils);

import vec from './vec.wgsl';
addWgslInclude('raytracer::vec', vec);

import vertex from './vertex.wgsl';
addWgslInclude('raytracer::vertex', vertex);
