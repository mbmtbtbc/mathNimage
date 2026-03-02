import * as THREE from "three";
import type { IUniform } from "three";
import { Styles } from "../../styles/styleShaders";
import { PostFX } from "../../postfx/postShaders";

class RendererEngine {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.Camera;
  private material!: THREE.ShaderMaterial;
  private container!: HTMLElement;
  private fragmentSource!: string;

  private startTime = Date.now();
  private initialized = false;

  private fractal = {
  zoom: 1.0,
  offsetX: -0.5,
  offsetY: 0.0,
};

private isDragging = false;
private lastMouse = { x: 0, y: 0 };

private renderTarget!: THREE.WebGLRenderTarget;
private postScene!: THREE.Scene;
private postCamera!: THREE.Camera;
private postMaterial!: THREE.ShaderMaterial;
private currentPostFX = "bloom";

  init(container: HTMLElement) {
    if (this.initialized) return;
    this.initialized = true;

    this.container = container;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );

    container.appendChild(this.renderer.domElement);

    this.scene = new THREE.Scene();
    this.camera = new THREE.Camera();

    this.renderTarget = new THREE.WebGLRenderTarget(
      container.clientWidth,
      container.clientHeight
    );
    const geometry = new THREE.PlaneGeometry(2, 2);

    /* ✅ STEP 1 — DEFINE SHADER SOURCE HERE */
    this.fragmentSource = `
      precision highp float;

      uniform float u_time;
      uniform vec2 u_resolution;

      float equation(vec2 uv){
        return sin(u_time + uv.x*10.0);
      }

      void main(){
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float c = 0.5 + 0.5 * equation(uv);
        gl_FragColor = vec4(vec3(c),1.0);
      }
    `;

    /* ✅ STEP 2 — USE IT HERE */
    this.material = new THREE.ShaderMaterial({
      uniforms: {
        u_time: { value: 0 },
        u_resolution: {
          value: new THREE.Vector2(
            container.clientWidth,
            container.clientHeight
          ),
        },
      },
      vertexShader: `
        void main() {
          gl_Position = vec4(position,1.0);
        }
      `,
      fragmentShader: this.fragmentSource,
    });

    const mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(mesh);

    this.postScene = new THREE.Scene();
    this.postCamera = new THREE.Camera();

    const postGeometry = new THREE.PlaneGeometry(2, 2);

    this.postMaterial = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: this.renderTarget.texture },
        u_time: { value: 0 },
      },

      vertexShader: `
        void main(){
          gl_Position = vec4(position,1.0);
        }
      `,

      fragmentShader: `
      precision highp float;

      uniform sampler2D tDiffuse;

      void main(){
        vec2 uv = gl_FragCoord.xy /
                  vec2(textureSize(tDiffuse,0));

        vec3 col = texture2D(tDiffuse, uv).rgb;

        // fake bloom effect
        vec3 blur =
            texture2D(tDiffuse, uv + vec2(0.002,0)).rgb +
            texture2D(tDiffuse, uv - vec2(0.002,0)).rgb +
            texture2D(tDiffuse, uv + vec2(0,0.002)).rgb +
            texture2D(tDiffuse, uv - vec2(0,0.002)).rgb;

        col += blur * 0.25;

        gl_FragColor = vec4(col,1.0);
      }
      `,
    });

    const postMesh = new THREE.Mesh(
  postGeometry,
  this.postMaterial
);

this.postScene.add(postMesh);

    window.addEventListener("resize", this.handleResize);
    
    this.animate();

    this.renderer.domElement.addEventListener(
    "wheel",
    this.handleZoom,
    { passive: false }
  );

  this.renderer.domElement.addEventListener(
    "mousedown",
    this.handleMouseDown
  );

  window.addEventListener("mouseup", this.handleMouseUp);
  window.addEventListener("mousemove", this.handleMouseMove);

  this.setPostFX("bloom");
}

  setPostFX(name: string) {
  this.currentPostFX = name;

  const fx = PostFX[name] || PostFX.none;

  this.postMaterial.fragmentShader = `
    precision highp float;

    uniform sampler2D tDiffuse;

    ${fx}

    void main(){
      vec2 uv = gl_FragCoord.xy /
                vec2(textureSize(tDiffuse,0));

      vec3 col = applyPost(uv);

      gl_FragColor = vec4(col,1.0);
    }
  `;

  this.postMaterial.needsUpdate = true;
}

  private handleZoom = (e: WheelEvent) => {
  e.preventDefault();

  const rect = this.renderer.domElement.getBoundingClientRect();

  const mx = (e.clientX - rect.left) / rect.width;
  const my = (e.clientY - rect.top) / rect.height;

  const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;

  const beforeX =
    (mx - 0.5) * 2.0 / this.fractal.zoom +
    this.fractal.offsetX;

  const beforeY =
    (my - 0.5) * 2.0 / this.fractal.zoom +
    this.fractal.offsetY;

  this.fractal.zoom *= zoomFactor;

  this.fractal.offsetX =
    beforeX -
    (mx - 0.5) * 2.0 / this.fractal.zoom;

  this.fractal.offsetY =
    beforeY -
    (my - 0.5) * 2.0 / this.fractal.zoom;

  const uniforms = this.material.uniforms;

  uniforms.u_zoom.value = this.fractal.zoom;
  uniforms.u_offset.value.set(
    this.fractal.offsetX,
    this.fractal.offsetY
  );
};

private handleMouseDown = (e: MouseEvent) => {
  this.isDragging = true;
  this.lastMouse = { x: e.clientX, y: e.clientY };
};

private handleMouseUp = () => {
  this.isDragging = false;
};

private handleMouseMove = (e: MouseEvent) => {
  if (!this.isDragging) return;

  const dx = e.clientX - this.lastMouse.x;
  const dy = e.clientY - this.lastMouse.y;

  this.lastMouse = { x: e.clientX, y: e.clientY };

  const scale = 0.002 / this.fractal.zoom;

  this.fractal.offsetX -= dx * scale;
  this.fractal.offsetY += dy * scale;

  const uniforms = this.material.uniforms;

  if (uniforms.u_offset) {
    uniforms.u_offset.value.set(
      this.fractal.offsetX,
      this.fractal.offsetY
    );
  }
};

  private handleResize = () => {
    if (!this.container) return;

    const w = this.container.clientWidth;
    const h = this.container.clientHeight;

    this.renderer.setSize(w, h);
    this.material.uniforms.u_resolution.value.set(w, h);
  };

  private animate = () => {
    requestAnimationFrame(this.animate);

    this.material.uniforms.u_time.value =
      (Date.now() - this.startTime) / 1000;

    // PASS 1 — render equation/fractal
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.scene, this.camera);

    // PASS 2 — post-processing
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.postScene, this.postCamera);
  };

  updateEquation(
  equationGLSL: string,
  params: Record<string, number> = {},
  styleName: string = "default"
  ) {
  if (!this.material) return;

  const styleCode = Styles[styleName] || Styles.default;

  /* ⭐ ensure uniforms exist BEFORE compiling */
  Object.entries(params).forEach(([key, value]) => {
    const uniformName = `u_${key}`;

    if (!this.material.uniforms[uniformName]) {
      this.material.uniforms[uniformName] = { value };
    }
  });

  /* build parameter uniform declarations */
  const paramUniforms = Object.keys(params)
    .map((k) => `uniform float u_${k};`)
    .join("\n");

  this.fragmentSource = `
precision highp float;

uniform float u_time;
uniform vec2 u_resolution;

${paramUniforms}

${styleCode}

float equation(vec2 uv){
  return ${equationGLSL};
}

void main(){
  vec2 uv = gl_FragCoord.xy/u_resolution;

  float v = 0.5 + 0.5*equation(uv);

  vec3 col = applyStyle(v, uv);

  gl_FragColor = vec4(col,1.0);
}
`;

  this.material.fragmentShader = this.fragmentSource;
  this.material.needsUpdate = true;
}

  updateParameters(params: Record<string, number>) {
  if (!this.material) return;

  const uniforms = this.material.uniforms as Record<
    string,
    IUniform<number>
  >;

  Object.entries(params).forEach(([key, value]) => {
    const uniformName = `u_${key}`;

    if (!uniforms[uniformName]) {
      uniforms[uniformName] = { value: value };
    } else {
      uniforms[uniformName].value = value;
    }
  });
}

setFractalMode() {
  if (!this.material) return;

  this.material.uniforms.u_zoom = { value: this.fractal.zoom };
  this.material.uniforms.u_offset = {
    value: new THREE.Vector2(
      this.fractal.offsetX,
      this.fractal.offsetY
    ),
  };

  this.fragmentSource = `
    precision highp float;

    uniform vec2 u_resolution;
    uniform float u_time;
    uniform float u_zoom;
    uniform vec2 u_offset;

    int MAX_ITER = 120;

    vec3 palette(float t){
      return vec3(
        0.5 + 0.5*cos(6.2831*(t+0.0)),
        0.5 + 0.5*cos(6.2831*(t+0.33)),
        0.5 + 0.5*cos(6.2831*(t+0.66))
      );
    }

    void main(){
      vec2 uv = (gl_FragCoord.xy/u_resolution - 0.5) * 2.0;

      uv /= u_zoom;
      uv += u_offset;

      vec2 z = vec2(0.0);
      vec2 c = uv;

      int i;
      for(i=0;i<MAX_ITER;i++){
        if(dot(z,z) > 4.0) break;

        z = vec2(
          z.x*z.x - z.y*z.y,
          2.0*z.x*z.y
        ) + c;
      }

      float t = float(i)/float(MAX_ITER);

      vec3 col = palette(t);

      gl_FragColor = vec4(col,1.0);
    }
  `;

  this.material.fragmentShader = this.fragmentSource;
  this.material.needsUpdate = true;
}
}


/* ⭐ SINGLE GLOBAL INSTANCE */
export const Renderer = new RendererEngine();