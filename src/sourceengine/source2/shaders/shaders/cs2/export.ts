import { Shaders } from '../../../../../shaders/shaders';

import source2_csgo_environment_fs from './source2_csgo_environment.fs';
import source2_csgo_environment_vs from './source2_csgo_environment.vs';
Shaders['source2_csgo_environment.fs'] = source2_csgo_environment_fs;
Shaders['source2_csgo_environment.vs'] = source2_csgo_environment_vs;

import source2_csgo_weapon_stattrak_fs from './source2_csgo_weapon_stattrak.fs';
import source2_csgo_weapon_stattrak_vs from './source2_csgo_weapon_stattrak.vs';
Shaders['source2_csgo_weapon_stattrak.fs'] = source2_csgo_weapon_stattrak_fs;
Shaders['source2_csgo_weapon_stattrak.vs'] = source2_csgo_weapon_stattrak_vs;

import source2_csgo_weapon_fs from './source2_csgo_weapon.fs';
import source2_csgo_weapon_vs from './source2_csgo_weapon.vs';
Shaders['source2_csgo_weapon.fs'] = source2_csgo_weapon_fs;
Shaders['source2_csgo_weapon.vs'] = source2_csgo_weapon_vs;
