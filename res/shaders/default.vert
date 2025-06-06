#version 330 core

in vec3 vertexPosition;

uniform mat4 mvp;

void main() {
  gl_Position = mvp*vec4(vertexPosition, 1.0);
}
