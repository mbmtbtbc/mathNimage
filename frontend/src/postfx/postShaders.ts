export const PostFX: Record<string, string> = {

  none: `
    vec3 applyPost(vec2 uv){
      return texture2D(tDiffuse, uv).rgb;
    }
  `,

  bloom: `
    vec3 applyPost(vec2 uv){
      vec3 col = texture2D(tDiffuse, uv).rgb;

      vec3 blur =
          texture2D(tDiffuse, uv+vec2(0.002,0)).rgb +
          texture2D(tDiffuse, uv-vec2(0.002,0)).rgb +
          texture2D(tDiffuse, uv+vec2(0,0.002)).rgb +
          texture2D(tDiffuse, uv-vec2(0,0.002)).rgb;

      return col + blur*0.25;
    }
  `,

  sketch: `
    vec3 applyPost(vec2 uv){
      float dx = 1.0/800.0;
      float dy = 1.0/600.0;

      vec3 c = texture2D(tDiffuse, uv).rgb;
      vec3 cx = texture2D(tDiffuse, uv+vec2(dx,0)).rgb;
      vec3 cy = texture2D(tDiffuse, uv+vec2(0,dy)).rgb;

      float edge = length(c-cx)+length(c-cy);

      return vec3(1.0-edge*5.0);
    }
  `,

  watercolor: `
    vec3 applyPost(vec2 uv){
      vec3 col = texture2D(tDiffuse, uv).rgb;

      col = pow(col, vec3(1.2));
      col += sin(uv.x*200.0)*0.01;

      return col;
    }
  `
};