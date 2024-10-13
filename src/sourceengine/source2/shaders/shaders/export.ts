
export * from './dota2/export';

import { Shaders } from '../../../../shaders/shaders';

import source2_global_lit_simple_fs from './source2_global_lit_simple.fs';
import source2_global_lit_simple_vs from './source2_global_lit_simple.vs';
Shaders['source2_global_lit_simple.fs'] = source2_global_lit_simple_fs;
Shaders['source2_global_lit_simple.vs'] = source2_global_lit_simple_vs;
