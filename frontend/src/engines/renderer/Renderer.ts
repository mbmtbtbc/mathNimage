import * as THREE from "three";

export class Renderer {
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.Camera;
  private material!: THREE.ShaderMaterial;

  private startTime = Date.now();

  init(container: HTMLElement) {
    // renderer
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(
      container.clientWidth,
      container.clientHeight
    );

    container.appendChild(this.renderer.domElement);

    // scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.Camera();

    // fullscreen quad
    const geometry = new THREE.PlaneGeometry(2, 2);

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
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        uniform float u_time;
        uniform vec2 u_resolution;

        void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution;
          float color = 0.5 + 0.5*sin(u_time + uv.x * 10.0);
          gl_FragColor = vec4(vec3(color),1.0);
        }
      `,
    });

    const mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(mesh);

    this.animate();
  }

  private animate = () => {
    requestAnimationFrame(this.animate);

    this.material.uniforms.u_time.value =
      (Date.now() - this.startTime) / 1000;

    this.renderer.render(this.scene, this.camera);
  };
}