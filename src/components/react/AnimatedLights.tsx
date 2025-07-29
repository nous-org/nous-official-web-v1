import React, { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';

interface MousePosition {
  x: number;
  y: number;
}

const SunRaysEffect: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const animationRef = useRef<number | null>(null);
  const mouseRef = useRef<MousePosition>({ x: 0, y: 0 });
  const clockRef = useRef<THREE.Clock>(new THREE.Clock());

  // Memoize the shader material
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      fragmentShader: `
        // Fragment shader
        uniform vec2 u_resolution;
        uniform vec2 u_mouse;
        uniform float u_time;
        uniform vec4 u_colors[2];
        uniform float u_intensity;
        uniform float u_rays;
        uniform float u_reach;

        #ifndef FNC_MOD289
        #define FNC_MOD289
        float mod289(const in float x) { return x - floor(x * (1. / 289.)) * 289.; }
        vec2 mod289(const in vec2 x) { return x - floor(x * (1. / 289.)) * 289.; }
        vec3 mod289(const in vec3 x) { return x - floor(x * (1. / 289.)) * 289.; }
        vec4 mod289(const in vec4 x) { return x - floor(x * (1. / 289.)) * 289.; }
        #endif

        #ifndef FNC_PERMUTE
        #define FNC_PERMUTE
        float permute(const in float x) { return mod289(((x * 34.0) + 1.0) * x); }
        vec2 permute(const in vec2 x) { return mod289(((x * 34.0) + 1.0) * x); }
        vec3 permute(const in vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
        vec4 permute(const in vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
        #endif

        #ifndef FNC_TAYLORINVSQRT
        #define FNC_TAYLORINVSQRT
        float taylorInvSqrt(in float r) { return 1.79284291400159 - 0.85373472095314 * r; }
        vec2 taylorInvSqrt(in vec2 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        vec3 taylorInvSqrt(in vec3 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        vec4 taylorInvSqrt(in vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
        #endif

        #ifndef FNC_QUINTIC
        #define FNC_QUINTIC 
        float quintic(const in float v) { return v*v*v*(v*(v*6.0-15.0)+10.0); }
        vec2 quintic(const in vec2 v) { return v*v*v*(v*(v*6.0-15.0)+10.0); }
        vec3 quintic(const in vec3 v) { return v*v*v*(v*(v*6.0-15.0)+10.0); }
        vec4 quintic(const in vec4 v) { return v*v*v*(v*(v*6.0-15.0)+10.0); }
        #endif

        float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed) {
          vec2 sourceToCoord = coord - raySource;
          float cosAngle = dot(normalize(sourceToCoord), rayRefDirection);
          
          return clamp(
            (.45 + 0.15 * sin(cosAngle * seedA + u_time * speed)) +
            (0.3 + 0.2 * cos(-cosAngle * seedB + u_time * speed)),
            u_reach, 1.0) *
            clamp((u_resolution.x - length(sourceToCoord)) / u_resolution.x, u_reach, 1.0);
        }

        void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          uv.y = 1.0 - uv.y;
          vec2 coord = vec2(gl_FragCoord.x, u_resolution.y - gl_FragCoord.y);
          float speed = u_rays * 10.0;
          
          // Set the parameters of the sun rays
          vec2 rayPos1 = vec2(u_resolution.x * 0.7, u_resolution.y * -0.4);
          vec2 rayRefDir1 = normalize(vec2(1.0, -0.116));
          float raySeedA1 = 36.2214*speed;
          float raySeedB1 = 21.11349*speed;
          float raySpeed1 = 1.5*speed;
          
          vec2 rayPos2 = vec2(u_resolution.x * 0.8, u_resolution.y * -0.6);
          vec2 rayRefDir2 = normalize(vec2(1.0, 0.241));
          float raySeedA2 = 22.39910*speed;
          float raySeedB2 = 18.0234*speed;
          float raySpeed2 = 1.1*speed;
          
          // Calculate the colour of the sun rays on the current fragment
          vec4 rays1 = vec4(0.,0.,0., .0) + rayStrength(rayPos1, rayRefDir1, coord, raySeedA1, raySeedB1, raySpeed1) * u_colors[0];
          vec4 rays2 = vec4(0.,0.,0., .0) + rayStrength(rayPos2, rayRefDir2, coord, raySeedA2, raySeedB2, raySpeed2) * u_colors[1];
          
          vec4 fragColor = (rays1) + (rays2);
          
          // Attenuate brightness towards the bottom, simulating light-loss due to depth.
          float brightness = 1.0*u_reach - (coord.y / u_resolution.y);
          fragColor *= (brightness + (0.5+ u_intensity));
          
          gl_FragColor = fragColor;
        }
      `,
      vertexShader: `
        // Vertex shader
        void main() {
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      uniforms: {
        u_colors: { value: [
          new THREE.Vector4(0.6235294117647059, 0, 1, 0.65),
          new THREE.Vector4(0.33725490196078434, 0.3764705882352941, 1, 0.29)
        ]},
        u_intensity: { value: 0.45 },
        u_rays: { value: 0.049 },
        u_reach: { value: 0.530 },
        u_time: { value: 0 },
        u_mouse: { value: [0, 0] },
        u_resolution: { value: [1024, 1024] }
      },
      wireframe: false,
      wireframeLinewidth: 0,
      dithering: false,
      glslVersion: THREE.GLSL1,
      transparent: true
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const container: HTMLDivElement = containerRef.current;
    const width: number = window.innerWidth;
    const height: number = window.innerHeight;

    // Create scene
    const scene: THREE.Scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create camera
    const camera: THREE.PerspectiveCamera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;

    // Create renderer
    const renderer: THREE.WebGLRenderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true,
      premultipliedAlpha: false,
      alpha: true,
      antialias: true,
      precision: "highp",
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000, 0); // Transparent background
    rendererRef.current = renderer;

    // Create geometry and mesh - adjust size to cover full screen
    const aspect = width / height;
    const frustumHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    const frustumWidth = frustumHeight * aspect;
    
    const geometry: THREE.PlaneGeometry = new THREE.PlaneGeometry(frustumWidth, frustumHeight);
    const mesh: THREE.Mesh = new THREE.Mesh(geometry, shaderMaterial);
    mesh.position.set(0, 0, 0);
    meshRef.current = mesh;
    scene.add(mesh);

    // Add canvas to container
    container.appendChild(renderer.domElement);

    // Mouse move handler
    const handleMouseMove = (event: MouseEvent): void => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    // Resize handler
    const handleResize = (): void => {
      const newWidth: number = window.innerWidth;
      const newHeight: number = window.innerHeight;
      
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      
      // Recalculate geometry size to fit new screen dimensions
      const newAspect = newWidth / newHeight;
      const newFrustumHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
      const newFrustumWidth = newFrustumHeight * newAspect;
      
      const newGeometry = new THREE.PlaneGeometry(newFrustumWidth, newFrustumHeight);
      if (mesh.geometry) {
        mesh.geometry.dispose();
      }
      mesh.geometry = newGeometry;
      
      if (mesh.material && 'uniforms' in mesh.material) {
        const material = mesh.material as THREE.ShaderMaterial;
        material.uniforms.u_resolution.value = [newWidth, newHeight];
      }
    };

    // Animation loop
    const animate = (): void => {
      animationRef.current = requestAnimationFrame(animate);
      
      if (mesh.material && 'uniforms' in mesh.material) {
        const material = mesh.material as THREE.ShaderMaterial;
        // Update uniforms
        material.uniforms.u_mouse.value = [
          mouseRef.current.x / 2 + 0.5,
          mouseRef.current.y / 2 + 0.5
        ];
        material.uniforms.u_time.value = clockRef.current.getElapsedTime();
        
        material.uniforms.u_resolution.value = [window.innerWidth, window.innerHeight];
      }
      
      renderer.render(scene, camera);
    };

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Start animation
    animate();

    // Cleanup function
    return (): void => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      
      // Dispose of Three.js objects
      geometry.dispose();
      shaderMaterial.dispose();
      renderer.dispose();
    };
  }, [shaderMaterial]);

  return (
    <div 
      ref={containerRef}
      style={{ 
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%', 
        height: '100%',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        pointerEvents: 'auto',
        zIndex: -10
      }}
    />
  );
};

export default SunRaysEffect;