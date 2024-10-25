export * from './cs2/export';
export * from './dota2/export';

import { Shaders } from '../../../../shaders/shaders';

import source2_crystal_fs from './source2_crystal.fs';
import source2_crystal_vs from './source2_crystal.vs';
Shaders['source2_crystal.fs'] = source2_crystal_fs;
Shaders['source2_crystal.vs'] = source2_crystal_vs;

import source2_error_fs from './source2_error.fs';
import source2_error_vs from './source2_error.vs';
Shaders['source2_error.fs'] = source2_error_fs;
Shaders['source2_error.vs'] = source2_error_vs;

import source2_global_lit_simple_fs from './source2_global_lit_simple.fs';
import source2_global_lit_simple_vs from './source2_global_lit_simple.vs';
Shaders['source2_global_lit_simple.fs'] = source2_global_lit_simple_fs;
Shaders['source2_global_lit_simple.vs'] = source2_global_lit_simple_vs;

import source2_pbr_fs from './source2_pbr.fs';
import source2_pbr_vs from './source2_pbr.vs';
Shaders['source2_pbr.fs'] = source2_pbr_fs;
Shaders['source2_pbr.vs'] = source2_pbr_vs;

import source2_spring_meteor_fs from './source2_spring_meteor.fs';
import source2_spring_meteor_vs from './source2_spring_meteor.vs';
Shaders['source2_spring_meteor.fs'] = source2_spring_meteor_fs;
Shaders['source2_spring_meteor.vs'] = source2_spring_meteor_vs;

import source2_spritecard_fs from './source2_spritecard.fs';
import source2_spritecard_vs from './source2_spritecard.vs';
Shaders['source2_spritecard.fs'] = source2_spritecard_fs;
Shaders['source2_spritecard.vs'] = source2_spritecard_vs;
