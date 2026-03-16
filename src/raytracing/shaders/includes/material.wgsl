#include math::modulo

struct TextureDescriptor {
	width: u32,
	height: u32,
	offset: u32,
	elements: u32,
	repeat: u32,
}

struct Material {
    materialType: u32,
    reflectionRatio: f32,
    reflectionGloss: f32,
    refractionIndex: f32,
    albedo: vec3f,
    textures: array<TextureDescriptor, 8>,// TODO: setup a var for max textures
  };

  @must_use
  fn scatterLambertian(
    material: ptr<function, Material>,
    ray: ptr<function, Ray>,
    scattered: ptr<function, Ray>,
    hitRec: ptr<function, HitRecord>,
    attenuation: ptr<function, vec3f>,
    rngState: ptr<function, u32>
  ) -> bool {
    var scatterDirection = (*hitRec).normal + randomUnitVec3(rngState);
    if (nearZero(scatterDirection)) {
      scatterDirection = (*hitRec).normal;
    }
    (*scattered) = Ray((*hitRec).p, scatterDirection);
    (*attenuation) = (*material).albedo;
    return true;
  }

  @must_use
  fn scatterMetal(
    material: ptr<function, Material>,
    ray: ptr<function, Ray>,
    scattered: ptr<function, Ray>,
    hitRec: ptr<function, HitRecord>,
    attenuation: ptr<function, vec3f>,
    rngState: ptr<function, u32>
  ) -> bool {
    let reflected = reflect(normalize((*ray).direction), (*hitRec).normal);
    (*scattered) = Ray((*hitRec).p, reflected + (*material).reflectionGloss * randomUnitVec3(rngState));
    (*attenuation) = (*material).albedo;
    return (dot((*scattered).direction, (*hitRec).normal) >= 0);
  }

  @must_use
  fn scatterDielectric(
    material: ptr<function, Material>,
    ray: ptr<function, Ray>,
    scattered: ptr<function, Ray>,
    hitRec: ptr<function, HitRecord>,
    attenuation: ptr<function, vec3f>,
    rngState: ptr<function, u32>
  ) -> bool {
    *attenuation = vec3f(1);
    let refractRatio = select((*material).refractionIndex, 1.0 / (*material).refractionIndex, (*hitRec).frontFace);
    let unitDirection = normalize((*ray).direction);
    let cosTheta = dot(-unitDirection, (*hitRec).normal);
    let sinTheta = sqrt(1.0 - cosTheta * cosTheta);
    let cannotRefract = refractRatio * sinTheta > 1.0;
    let direction = select(
      refract(unitDirection, (*hitRec).normal, refractRatio),
      reflect(unitDirection, (*hitRec).normal),
      cannotRefract || reflectance(cosTheta, refractRatio) > rngNextFloat(rngState)
    );
    (*scattered) = Ray((*hitRec).p, direction);
    return true;
  }

  @must_use
  fn reflectance(cosine: f32, refractionIndex: f32) -> f32 {
    // Use Schlick's approximation for reflectance.
    var r0 = (1.0 - refractionIndex) / (1.0 + refractionIndex);
    r0 *= r0;
    return r0 + (1.0 - r0) * pow((1.0 - cosine), 5.0);
  }

  @must_use
  fn scatterSource1(
    material: ptr<function, Material>,
    ray: ptr<function, Ray>,
    scattered: ptr<function, Ray>,
    hitRec: ptr<function, HitRecord>,
    attenuation: ptr<function, vec3f>,
    rngState: ptr<function, u32>
  ) -> bool {
    var scatterDirection = (*hitRec).normal + randomUnitVec3(rngState);
    if (nearZero(scatterDirection)) {
      scatterDirection = (*hitRec).normal;
    }
    (*scattered) = Ray((*hitRec).p, scatterDirection);
    (*attenuation) = textureLookup((*material).textures[0], hitRec.coord.x, hitRec.coord.y);

    return true;
  }

  @must_use
  fn scatterSource1VertexLitGeneric(
    material: ptr<function, Material>,
    ray: ptr<function, Ray>,
    scattered: ptr<function, Ray>,
    hitRec: ptr<function, HitRecord>,
    attenuation: ptr<function, vec3f>,
    rngState: ptr<function, u32>
  ) -> bool {
    var scatterDirection = (*hitRec).normal;
    if (nearZero(scatterDirection)) {
      scatterDirection = (*hitRec).normal;
    }
    (*attenuation) = textureLookup((*material).textures[0], hitRec.coord.x, hitRec.coord.y);
    let normalTexture = (*material).textures[1];

    if (normalTexture.offset != 0xffffff) {
      let pixelNormal = textureLookup(normalTexture, hitRec.coord.x, hitRec.coord.y) * 2 - 1;
      scatterDirection = normalize((*hitRec).tbn * pixelNormal);
    }

    scatterDirection += randomUnitVec3(rngState);
    if (nearZero(scatterDirection)) {
      scatterDirection = (*hitRec).normal;
    }

    (*scattered) = Ray((*hitRec).p, scatterDirection);
    return true;
  }

  @must_use
  fn scatterSource1LightMappedGeneric(
    material: ptr<function, Material>,
    ray: ptr<function, Ray>,
    scattered: ptr<function, Ray>,
    hitRec: ptr<function, HitRecord>,
    attenuation: ptr<function, vec3f>,
    rngState: ptr<function, u32>
  ) -> bool {
    var scatterDirection = (*hitRec).normal + randomUnitVec3(rngState);
    if (nearZero(scatterDirection)) {
      scatterDirection = (*hitRec).normal;
    }
    (*scattered) = Ray((*hitRec).p, scatterDirection);
    (*attenuation) = textureLookup((*material).textures[0], hitRec.coord.x, hitRec.coord.y);

    return true;
  }

  fn textureLookup(desc: TextureDescriptor, u: f32, v: f32) -> vec3<f32> {
    if (desc.offset == 0xffffff) {
      return vec3f(0.0);
    }
    let u2: f32 = select(clamp(u, 0f, 1f), modulo_f32(u, 1), (desc.repeat & 1) == 1);
    let v2: f32 = select(clamp(v, 0f, 1f), modulo_f32(v, 1), (desc.repeat & 2) == 2);

    let j = u32(u2 * f32(desc.width - 1));
    let i = u32(v2 * f32(desc.height - 1));
    let idx = (i * desc.width + j) * desc.elements;

    //return abs(vec3f(vec2f(u2, v2), 0.));
    //return abs(vec3f(f32(j) / f32(desc.width)));

    let elem = textures[desc.offset + idx];
    return vec3f(
      textures[desc.offset + idx + 0],
      textures[desc.offset + idx + 1],
      textures[desc.offset + idx + 2],
    ) / 255.;
  }
