  #include raytracer::common

  @group(0) @binding(0) var<storage, read_write> faces: array<Face>;

  override WORKGROUP_SIZE_X: u32;
  /**
   * compute the bitangent for each vertex
   */
  @compute @workgroup_size(WORKGROUP_SIZE_X, 1)
  fn compute_main(@builtin(global_invocation_id) id : vec3<u32>,) {
    if (id.x > arrayLength(&faces)) {
      return;
    }

    let face = &faces[id.x];

    face.bta0 = cross(face.n0, face.ta0.xyz) * face.ta0.w;
    face.bta1 = cross(face.n1, face.ta1.xyz) * face.ta1.w;
    face.bta2 = cross(face.n2, face.ta2.xyz) * face.ta2.w;
  }
