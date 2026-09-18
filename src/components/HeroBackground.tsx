"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float, PointMaterial, Points } from "@react-three/drei";
import * as THREE from "three";
import * as random from "maath/random";

/**
 * High-density cinematic particle field with smooth pointer parallax.
 */
function ParticleField() {
  const ref = useRef<THREE.Points>(null);
  const { pointer } = useThree();

  // Generate safe random positions with guaranteed NaN protection
  const sphere = useMemo(() => {
    const data = random.inSphere(new Float32Array(6000), { radius: 2.2 }) as Float32Array;
    for (let i = 0; i < data.length; i++) {
      if (isNaN(data[i])) data[i] = 0;
    }
    return data;
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      // Smooth organic rotation
      ref.current.rotation.x -= delta / 25;
      ref.current.rotation.y -= delta / 35;

      // Subtle reactive mouse parallax tilt
      ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, pointer.y * 0.2, 0.05);
      ref.current.rotation.y = THREE.MathUtils.lerp(ref.current.rotation.y, pointer.x * 0.2, 0.05);
    }
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
        <PointMaterial
          transparent
          color="#A855F7" // Electric violet accent
          size={0.018}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          opacity={0.8}
        />
      </Points>
    </group>
  );
}

/**
 * Organic morphing 3D geometric shape with glassmorphism / wireframe fusion
 */
function AdvancedFloatingShape({ 
  position, 
  color, 
  scale = 1, 
  speed = 1.5 
}: { 
  position: [number, number, number]; 
  color: string; 
  scale?: number;
  speed?: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const safeScale = isNaN(scale) || scale <= 0 ? 1 : scale;

  // Custom vertex wave deformation for a living, breathing effect
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime() * speed;
      meshRef.current.rotation.x = time * 0.3;
      meshRef.current.rotation.y = time * 0.2;
      
      // Breathing scale pulse
      const pulse = 1 + Math.sin(time * 1.5) * 0.06;
      meshRef.current.scale.set(safeScale * pulse, safeScale * pulse, safeScale * pulse);
    }
  });

  return (
    <Float speed={2.5} rotationIntensity={1.5} floatIntensity={3}>
      <mesh ref={meshRef} position={position}>
        <icosahedronGeometry args={[1.2, 2]} />
        <meshPhysicalMaterial
          color={color}
          roughness={0.15}
          metalness={0.8}
          transmission={0.6} // Glass refraction feel
          thickness={1.2}
          wireframe={false}
          transparent
          opacity={0.85}
        />
      </mesh>
    </Float>
  );
}

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <Canvas 
        camera={{ position: [0, 0, 6], fov: 50 }} 
        dpr={[1, 2]} // Optimizes crisp rendering on retina screens
        gl={{ antialias: true, alpha: true }}
      >
        {/* Dynamic Multi-Point Cinematic Lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#FFFFFF" />
        <pointLight position={[-8, 4, -2]} intensity={3} color="#2563EB" /> {/* Electric Blue */}
        <pointLight position={[8, -4, -2]} intensity={3} color="#7C3AED" />  {/* Deep Purple */}
        <pointLight position={[0, 6, 2]} intensity={2} color="#10B981" />   {/* Emerald Green */}
        
        {/* Background Atmosphere */}
        <ParticleField />
        
        {/* Pro-Level Floating Asset Nodes */}
        <AdvancedFloatingShape position={[-5.5, 2.8, -1.5]} color="#2563EB" scale={0.9} speed={1.2} />
        <AdvancedFloatingShape position={[6.2, -3.2, -2.5]} color="#7C3AED" scale={0.7} speed={1.8} />
        <AdvancedFloatingShape position={[3.8, 5.2, -3]} color="#10B981" scale={0.5} speed={1.4} />
      </Canvas>
    </div>
  );
}

