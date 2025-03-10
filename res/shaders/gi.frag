#version 330 core

#define PI 3.141596
#define TWO_PI 6.2831853071795864769252867665590
#define TAU 0.0006

out vec4 fragColor;

uniform vec2      uResolution;
uniform int       uRaysPerPx;
uniform int       uMaxSteps;

uniform sampler2D uDistanceField;
uniform sampler2D uSceneMap;

/* this shader performs "radiosity-based GI" - see comments */

vec3 raymarch(vec2 uv, vec2 dir) {
  /*
   * Raymarching works by taking a position and a direction and using a distance field.
   *
   * We read the distance value of the inputted position via the distance field and "march" (read "step") our ray
   * by that distance in the specified direction. We then take another reading of the distance field
   * and march our ray again according to that reading's value. We repeat this until we either exceed
   * our maximum step count or we read a value on the distance field below a certain value (ideally a small
   * value such as 0.0001), which indicates we have hit a surface.
   *
   * Once we have hit a surface we can sample the surface that we have hit in the scene and return it.
   *
   * See this image:
   * https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F2e366a8e-7f70-4be9-bb73-1a89fc0c6d55_1920x1080.png
   * Each circle indicates the distance to the nearest surface. See how we are marching our ray according to that distance.
   * This can theoretically be done forever as we will never technically hit a surface, but that's why we want to check for
   * the distance to be below a certain threshold instead.
   */
  float dist = 0.0;
  for (int i = 0; i < uMaxSteps; i++) {
    uv += (dir * dist) / (uResolution.x/uResolution.y); // march our ray (divided by our aspect ratio so no skewed directions)
    dist = texture(uDistanceField, uv).r;               // sample distance field

    // skip UVs outside of the window
    // our Y coordinate is upside down
    if (uv.x != clamp(uv.x,  0.0, 1.0)) return vec3(0.0);
    if (uv.y != clamp(uv.y, -1.0, 0.0)) return vec3(0.0);

    if (dist < TAU) { // surface hit
      return texture(uSceneMap, uv).rgb;
    }
  }
  return vec3(0.0);
}

// sourced from https://samuelbigos.github.io/posts/2dgi1-2d-global-illumination-in-godot.html#the-fun-stuff---fields-and-algorithms
vec3 lin_to_srgb(vec3 color)
{
   vec3 x = color.rgb * 12.92;
   vec3 y = 1.055 * pow(clamp(color.rgb, 0.0, 1.0), vec3(0.4166667)) - 0.055;
   vec3 clr = color.rgb;
   clr.r = (color.r < 0.0031308) ? x.r : y.r;
   clr.g = (color.g < 0.0031308) ? x.g : y.g;
   clr.b = (color.b < 0.0031308) ? x.b : y.b;
   return clr.rgb;
}

void main() {
 /*
  * This GI algorithm works by utilising raymarching (see raymarching function).
  *
  * To calculate the light value of a pixel we cast rays in all directions (governed by uRaysPerPx in this case)
  * and then add up all the results of the rays and divide by raycount.
  */
  vec2 fragCoord = gl_FragCoord.xy/uResolution;
  fragCoord.y = -fragCoord.y;

  float dist = texture(uDistanceField, fragCoord).r;
  vec3 color = texture(uSceneMap, fragCoord).rgb;

  if (dist >= TAU) {
    float brightness = max(color.r, max(color.g, color.b));

    // cast rays angularly with equal angles between them
    for (float i = 0.0; i < TWO_PI; i += TWO_PI / uRaysPerPx) {
      vec3 hitcol = raymarch(fragCoord, vec2(cos(i), -sin(i)));
      color += hitcol;
      brightness += max(hitcol.r, max(hitcol.g, hitcol.b));
    }

    color = (color / brightness) * (brightness / uRaysPerPx);
  }

  fragColor = vec4(lin_to_srgb(color), 1.0);
}
