import * as THREE from "three";
import type { IUniform } from "three";

class RendererEngine {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.Camera;
  private material!: THREE.ShaderMaterial;
  private container!: HTMLElement;
  private fragmentSource!: string;

  private startTime = Date.now();
  private initialized = false;

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

    window.addEventListener("resize", this.handleResize);

    this.animate();
  }

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

    this.renderer.render(this.scene, this.camera);
  };

  updateEquation(
  equationGLSL: string,
  params: Record<string, number> = {}
) {
  if (!this.material) return;

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

    float equation(vec2 uv){
      return ${equationGLSL};
    }

    void main(){
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float c = 0.5 + 0.5 * equation(uv);
      gl_FragColor = vec4(vec3(c),1.0);
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
}


/* ⭐ SINGLE GLOBAL INSTANCE */
export const Renderer = new RendererEngine();