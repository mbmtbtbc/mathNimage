export const Styles: Record<string, string> = {
  default: `
    vec3 applyStyle(float v, vec2 uv){
      return vec3(v);
    }
  `,

  neon: `
    vec3 applyStyle(float v, vec2 uv){
      float glow = smoothstep(0.4,0.6,v);
      return vec3(
        0.2 + glow,
        0.3*sin(v*6.2831),
        1.0-glow
      );
    }
  `,

  terrain: `
    vec3 applyStyle(float v, vec2 uv){
      vec3 water = vec3(0.0,0.2,0.6);
      vec3 land = vec3(0.1,0.6,0.2);
      vec3 mountain = vec3(0.8,0.8,0.8);

      if(v < 0.4) return water;
      if(v < 0.7) return land;
      return mountain;
    }
  `,

  contour: `
    vec3 applyStyle(float v, vec2 uv){
      float lines = step(0.95, fract(v*20.0));
      return mix(vec3(v), vec3(0.0), lines);
    }
  `,
};