
export * from './dota2/export';

import { Shaders } from '../../../../shaders/shaders';

import source2_crystal_fs from './source2_crystal.fs';
import source2_crystal_vs from './source2_crystal.vs';
Shaders['source2_crystal.fs'] = source2_crystal_fs;
Shaders['source2_crystal.vs'] = source2_crystal_vs;

import source2_global_lit_simple_fs from './source2_global_lit_simple.fs';
import source2_global_lit_simple_vs from './source2_global_lit_simple.vs';
Shaders['source2_global_lit_simple.fs'] = source2_global_lit_simple_fs;
Shaders['source2_global_lit_simple.vs'] = source2_global_lit_simple_vs;
