#version 330 core

#define N         25
#define PRIMARY   vec4(1.0f, 0.0f, 1.0f, 1.0f)
#define SECONDARY vec4(0.0f, 0.0f, 0.0f, 1.0f)

out vec4 fragColor;

// checkerboard pattern
void main()
{
  vec2 pos = mod(gl_FragCoord.xy,vec2(N));

  if      ((pos.x > N/2) && (pos.y > N/2)){
    fragColor = PRIMARY;
  }
  else if ((pos.x < N/2) && (pos.y < N/2)){
    fragColor = PRIMARY;
  }
  else if ((pos.x < N/2) && (pos.y > N/2)){
    fragColor = SECONDARY;
  }
  else if ((pos.x > N/2) && (pos.y < N/2)){
    fragColor = SECONDARY;
  }
}
