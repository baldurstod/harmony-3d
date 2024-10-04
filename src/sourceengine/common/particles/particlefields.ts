export const PARTICLE_FIELD_POSITION = 0;
export const PARTICLE_FIELD_LIFETIME = 1;
export const PARTICLE_FIELD_POSITION_PREVIOUS = 2;
export const PARTICLE_FIELD_RADIUS = 3;
export const PARTICLE_FIELD_ROTATION_ROLL = 4;
export const PARTICLE_FIELD_ROTATION_ROLL_SPEED = 5;
export const PARTICLE_FIELD_COLOR = 6;
export const PARTICLE_FIELD_ALPHA = 7;
export const PARTICLE_FIELD_CREATION_TIME = 8;
export const PARTICLE_FIELD_SEQUENCE_NUMBER = 9;
export const PARTICLE_FIELD_TRAIL_LENGTH = 10;
export const PARTICLE_FIELD_PARTICLE_ID = 11;
export const PARTICLE_FIELD_YAW = 12;
export const PARTICLE_FIELD_SEQUENCE_NUMBER_2 = 13;
export const PARTICLE_FIELD_HITBOX_INDEX = 14;
export const PARTICLE_FIELD_HITBOX_OFFSET_POSITION = 15;
export const PARTICLE_FIELD_ALPHA_ALTERNATE = 16;
export const PARTICLE_FIELD_SCRATCH_VECTOR = 17;
export const PARTICLE_FIELD_SCRATCH_FLOAT = 18;
export const PARTICLE_FIELD_NONE = 19;
export const PARTICLE_FIELD_PITCH = 20;
export const PARTICLE_FIELD_NORMAL = 21;
export const PARTICLE_FIELD_GLOW_RGB = 22;
export const PARTICLE_FIELD_GLOW_ALPHA = 23;
export const PARTICLE_FIELD_SCRATCH_FLOAT_1 = 26;
export const PARTICLE_FIELD_SCRATCH_FLOAT_2 = 27;
export const PARTICLE_FIELD_SCRATCH_VECTOR2 = 30;
export const PARTICLE_FIELD_BONE_INDICE = 31;
export const PARTICLE_FIELD_BONE_WEIGHT = 32;
export const PARTICLE_FIELD_PARENT_PARTICLE_INDEX = 33;
export const PARTICLE_FIELD_FORCE_SCALE = 34;
export const PARTICLE_FIELD_MANUAL_ANIMATION_FRAME = 38;
export const PARTICLE_FIELD_SHADER_EXTRA_DATA_1 = 39;
export const PARTICLE_FIELD_SHADER_EXTRA_DATA_2 = 40;

export const ATTRIBUTES_WHICH_ARE_ANGLES = 1 << PARTICLE_FIELD_ROTATION_ROLL | 1 << PARTICLE_FIELD_ROTATION_ROLL_SPEED | 1 << PARTICLE_FIELD_YAW | 1 << PARTICLE_FIELD_PITCH;
export const ATTRIBUTES_WHICH_ARE_0_TO_1 = 1 << PARTICLE_FIELD_ALPHA;