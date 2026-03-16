  struct CommonUniforms {
    // Random seed for the workgroup
    //seed : vec3u,
    frameCounter: u32,
    maxBounces: u32,
    flatShading: u32,
    debugNormals: u32,
    debugColor: u32,
  }

  struct HitRecord {
    p: vec3f,
    normal: vec3f,
    tbn: mat3x3f,
    coord: vec2f,
    t: f32,
    frontFace: bool,
    materialIdx: u32,
    meshIdx: i32
  };

  struct Face {
    p0: vec3f,
    p1: vec3f,
    p2: vec3f,

    n0: vec3f,
    n1: vec3f,
    n2: vec3f,

    ta0: vec4f,
    ta1: vec4f,
    ta2: vec4f,

    bta0: vec3f,
    bta1: vec3f,
    bta2: vec3f,

    t0: vec2f,
    t1: vec2f,
    t2: vec2f,

    faceNormal: vec3f,
    materialIdx: u32,
    flatShading: u32,
  }

  struct AABB {
    min: vec3f,
    max: vec3f,
    leftChildIdx: i32,
    rightChildIdx: i32,
    faceIdx0: i32,
    faceIdx1: i32
  }

  struct Mesh {
    aabbOffset: i32,
    faceOffset: i32
  }
