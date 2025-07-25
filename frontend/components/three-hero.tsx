'use client';

import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { useAspect, useTexture } from '@react-three/drei';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

const TEXTUREMAP = { src: 'https://i.postimg.cc/XYwvXN8D/img-4.png' };
const DEPTHMAP = { src: 'https://i.postimg.cc/2SHKQh2q/raw-4.webp' };

extend(THREE as any);

const WIDTH = 300;
const HEIGHT = 300;

const Scene = () => {
  const [rawMap, depthMap] = useTexture([TEXTUREMAP.src, DEPTHMAP.src]);

  const { material, uniforms } = useMemo(() => {
    const uPointer = new THREE.Uniform(new THREE.Vector2(0));
    const uProgress = new THREE.Uniform(0);

    // Create a simple material that works with Three.js
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: rawMap },
        uDepthMap: { value: depthMap },
        uPointer: uPointer,
        uProgress: uProgress,
        uTime: { value: 0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D uTexture;
        uniform sampler2D uDepthMap;
        uniform vec2 uPointer;
        uniform float uProgress;
        uniform float uTime;
        varying vec2 vUv;

        void main() {
          vec2 uv = vUv;
          
          // Get depth map value
          float depth = texture2D(uDepthMap, uv).r;
          
          // Create displacement effect
          float strength = 0.01;
          vec2 displacement = uPointer * depth * strength;
          
          // Sample texture with displacement
          vec4 texColor = texture2D(uTexture, uv + displacement);
          
          // Apply the texture without red overlay
          vec3 finalColor = texColor.rgb;
          
          gl_FragColor = vec4(finalColor, texColor.a);
        }
      `
    });

    return {
      material,
      uniforms: {
        uPointer,
        uProgress,
      },
    };
  }, [rawMap, depthMap]);

  const [w, h] = useAspect(WIDTH, HEIGHT);

  useFrame(({ clock, pointer }) => {
    uniforms.uProgress.value = (Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5);
    uniforms.uPointer.value = pointer;
    if (material.uniforms.uTime) {
      material.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  const scaleFactor = 0.6;
  return (
    <mesh scale={[w * scaleFactor, h * scaleFactor, 1]} material={material}>
      <planeGeometry />
    </mesh>
  );
};

export const ThreeHero = () => {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};

export default ThreeHero;
