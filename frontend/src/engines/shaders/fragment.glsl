precision highp float;

uniform float u_time;
uniform vec2 u_resolution;

void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;

    float color = 0.5 + 0.5*sin(u_time + uv.x * 10.0);

    gl_FragColor = vec4(vec3(color), 1.0);
}